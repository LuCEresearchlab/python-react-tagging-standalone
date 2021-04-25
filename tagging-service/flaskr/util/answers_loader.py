from flask import current_app
from flaskr import cache
import os
import pathlib
import json
import datetime
import logging

from flaskr.util.mongo_helper import get_cluster

logger = logging.getLogger(__name__)


@cache.cached(key_prefix='datasets-id-map')
def get_dataset_id_to_filename_name_map():
    id_to_dataset_filename = {}
    id_to_dataset_name = {}
    folder = current_app.config['UPLOAD_FOLDER']
    for root, dirs, files in os.walk(folder):
        for file_name in files:
            file_path = pathlib.Path(os.path.join(root, file_name)).absolute()
            if file_path.exists() and file_name.endswith('.json'):
                with open(file_path, 'r') as dataset:
                    content = json.loads(dataset.read())

                    id_to_dataset_filename[content['dataset_id']] = file_path
                    id_to_dataset_name[content['dataset_id']] = content['name']
    return id_to_dataset_filename, id_to_dataset_name


# load datasets from disk, should be updated to load from service for specified user (currently not given)
@cache.cached(key_prefix='datasets-cache-list')
def load_dataset_name_list():
    datasets = []

    folder = current_app.config['UPLOAD_FOLDER']

    _, _, filenames = next(os.walk(folder))
    counter = 0

    for filename in filenames:
        if filename == '.gitignore' or filename == '.DS_Store':
            continue

        file_path = pathlib.Path(os.path.join(folder, filename)).absolute()

        dataset_id_to_filename, dataset_id_to_name = get_dataset_id_to_filename_name_map()
        filename_to_dataset_id = {v: k for k, v in dataset_id_to_filename.items()}

        dataset_id = filename_to_dataset_id[file_path]

        datasets.append({
            'id': dataset_id,
            'name': dataset_id_to_name[dataset_id],
            'date': datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
        })
        counter += 1

    return datasets


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
