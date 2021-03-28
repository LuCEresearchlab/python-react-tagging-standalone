from flask import current_app
from flaskr import cache
from flaskr.exceptions.error import Error
import os
import pathlib
import json
import datetime
import logging

from flaskr.util.grouper_helper import fake_get_clusters

logger = logging.getLogger(__name__)


@cache.cached(key_prefix='datasets-cache')
def load_dataset(dataset_id):
    id_to_filename, _ = get_dataset_id_to_filename_name_map()

    file = pathlib.Path(id_to_filename[dataset_id])

    logger.debug(f"Trying to load {file}")

    if file.exists():
        logger.debug("File Exists")
        with open(file, 'r') as file:
            logger.debug("File Opened")
            content = file.read()
            logger.debug("Read file")
            j = json.loads(content)
            for question in j['questions']:
                answers = question['answers']
                logger.debug("SORTING ANSWERS")
                question['clustered_answers'] = fake_get_clusters(answers)
            return j
    else:
        raise Error(f'File {file} not found at {file}', status_code=500)


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


def populate_retrieving_maps(dataset_id):
    dataset = load_dataset(dataset_id)
    id_to_question_data = {}
    id_to_answer_data = {}
    logger.debug(dataset)
    for question in dataset['questions']:
        id_to_question_data[question['question_id']] = question
        for c in question['clustered_answers']:
            for answer in c:
                id_to_answer_data[answer['answer_id']] = answer
    return id_to_question_data, id_to_answer_data

