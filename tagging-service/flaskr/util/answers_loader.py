import logging

from flaskr.util.mongo_helper import get_cluster

logger = logging.getLogger(__name__)


def populate_retrieving_maps(dataset):
    id_to_question_data = {}
    id_to_answer_data = {}
    dataset_id = dataset['dataset_id']

    for question in dataset['questions']:
        question_id = question['question_id']
        id_to_question_data[question['question_id']] = question
        for c in get_cluster(dataset_id=dataset_id, question_id=question_id, user_id='')[0]['clusters']:
            for answer in c:
                id_to_answer_data[answer['answer_id']] = answer
    return id_to_question_data, id_to_answer_data
