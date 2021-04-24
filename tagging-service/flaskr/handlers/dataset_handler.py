import logging
from datetime import datetime

from pymongo import MongoClient
from threading import Thread

from flaskr.util.model_loader import cluster
from flaskr.util.mongo_helper import save_cluster

logger = logging.getLogger(__name__)


client = MongoClient("mongodb://tagging-database:27017/?appname=tagging_service&ssl=false")

file_db = client['dataset_db']


def _db_add_dataset(db, dataset, computed_clusters):
    total_computed = int(computed_clusters)
    query = {
        'dataset_id': dataset['dataset_id']
    }
    update = {
        '$set':
            {
                'name': dataset['name'],
                'creation_data': datetime.now(),
                'dataset_id': dataset['dataset_id'],
                'questions': dataset['questions'],
                'clusters_computed': total_computed
            }
    }
    db.dataset.update_one(query, update, upsert=True)
    logger.debug(f'called _db_add_dataset: clusters_computed {total_computed}')


def _db_add_questions(db, dataset_id, question_id, question):
    query = {
        'dataset_id': dataset_id,
        'question_id': question_id
    }
    update = {
        '$set':
            {
                'question': question,
            }
    }
    db.questions.update_one(query, update, upsert=True)


def add_dataset(input_client, dataset):
    db = input_client['dataset_db']

    logger.debug('setting dataset as loading')
    _db_add_dataset(db=db, dataset=dataset, computed_clusters=0)
    logger.debug('dataset now loading')

    def thread_func(_dataset_id, _question_id, _answers, my_client):
        connection = my_client
        logger.debug('clustering ' + _question_id)
        c = cluster(_answers)  # force computation
        save_cluster(connection=connection,
                     dataset_id=_dataset_id,
                     question_id=_question_id,
                     user_id='',
                     cluster=c)
        logger.debug('done ' + _question_id)

    threads = []
    for question in dataset['questions']:
        dataset_id = dataset['dataset_id']
        question_id = question['question_id']
        answers = question['answers']

        thread = Thread(target=thread_func, args=(dataset_id, question_id, answers, client,))
        thread.start()
        threads.append(thread)

        _db_add_questions(db=db, dataset_id=dataset_id, question_id=question_id, question=question)

    for thread in threads:
        logger.debug('waiting for thread')
        thread.join()

    # set as loaded
    logger.debug('set dataset as loaded')
    _db_add_dataset(db=db, dataset=dataset, computed_clusters=len(dataset['questions']))


def get_dataset(dataset_id):
    return file_db.dataset.find_one({'dataset_id': dataset_id}, {'_id': False})


def get_dataset_list():
    datasets = list(file_db.dataset.find({}, {'_id': False}))

    for dataset in datasets:
        dataset['nr_questions'] = len(dataset['questions'])
    return datasets
