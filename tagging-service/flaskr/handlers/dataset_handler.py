import logging
from datetime import datetime, timezone
from threading import Thread
from flaskr import cache

from flaskr.util.model_loader import cluster
from flaskr.util.mongo_helper import save_cluster, get_new_mongo_client


logger = logging.getLogger(__name__)

client = get_new_mongo_client()

file_db = client['dataset_db']


def _db_add_dataset(db, dataset, computed_clusters, finished_clustering):
    total_computed = int(computed_clusters)
    query = {
        'dataset_id': dataset['dataset_id']
    }
    update = {
        '$set':
            {
                'name': dataset['name'],
                'creation_data': datetime.now(tz=timezone.utc).isoformat(),
                'dataset_id': dataset['dataset_id'],
                'questions': dataset['questions'],
                'clusters_computed': total_computed,
                'finished_clustering': finished_clustering,
            }
    }
    db.dataset.update_one(query, update, upsert=True)
    logger.debug(f'called _db_add_dataset: clusters_computed {total_computed}')


def add_dataset(dataset, mem_to_clean):
    dataset_id = dataset['dataset_id']
    # runs in thread, need local client
    db = get_new_mongo_client()['dataset_db']

    logger.debug('setting dataset as loading')
    _db_add_dataset(db=db, dataset=dataset, computed_clusters=0, finished_clustering=False)
    logger.debug('dataset now loading')

    def thread_func(_dataset_id, _question_id, _answers):
        logger.debug('clustering ' + _question_id)
        cls = cluster(_answers)  # force computation
        save_cluster(dataset_id=_dataset_id,
                     question_id=_question_id,
                     user_id='',
                     cluster=[{'answers': c, 'name': f'Cluster {i + 1}'} for i, c in enumerate(cls)])  # convert format
        logger.debug('done ' + _question_id)

    threads = []
    for question in dataset['questions']:
        question_id = question['question_id']
        answers = question['answers']

        thread = Thread(target=thread_func, args=(dataset_id, question_id, answers,))
        thread.start()
        threads.append(thread)

    for thread in threads:
        logger.debug('waiting for thread')
        thread.join()

    # set as loaded
    logger.debug('set dataset as loaded')
    _db_add_dataset(db=db, dataset=dataset, computed_clusters=len(dataset['questions']), finished_clustering=True)

    # clean cache
    for mem in mem_to_clean:
        cache.delete_memoized(mem, dataset_id)
    cache.delete('dataset-list')

    logger.debug('cleaned cache')


def get_dataset(dataset_id):
    return file_db.dataset.find_one({'dataset_id': dataset_id}, {'_id': False})


def get_dataset_list():
    datasets = list(file_db.dataset.find({}, {'_id': False}))

    for dataset in datasets:
        dataset['nr_questions'] = len(dataset['questions'])
    return datasets
