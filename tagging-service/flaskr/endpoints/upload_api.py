import os
import json
import datetime
import pathlib
import logging
from os import walk, path
from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from flaskr.exceptions.error import Error
from flaskr import cache

api = Namespace('datasets', description='Upload API to load files')

logger = logging.getLogger(__name__)


DATASET_DESC = api.model('Dataset Description', {
    'id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'name': fields.String(required=True, readonly=True, description='The name of the dataset'),
    'date': fields.Date(required=True, readonly=True, description='The Date of the dataset creation')
})

ANSWER = api.model('Answer', {
    'answer_id': fields.String(required=True, readonly=True, description='ID of the Answer'),
    'data': fields.String(required=True, readonly=True, description='Text of the Answer'),
    'user_id': fields.String(required=False, readonly=True, description='ID of the user posting the answer'),
})

QUESTION = api.model('Question', {
    'question_id': fields.String(required=True, readonly=True, description='ID of the Question'),
    'text': fields.String(required=True, readonly=True, description='Text of the Question'),
    'answers': fields.List(fields.Nested(ANSWER))
})


DATASET = api.model('Dataset', {
    "name": fields.String(required=True, readonly=True, description='Name of dataset'),
    "creation_data": fields.Date(required=True, readonly=True, description='The Date of the Dataset creation'),
    "dataset_id": fields.String(required=True, readonly=True, description='ID of the Dataset'),
    "questions": fields.List(fields.Nested(QUESTION))
})


def _assert_valid_schema(data):
    valid = 'name' in data
    valid &= 'creation_data' in data
    valid &= 'dataset_id' in data
    valid &= 'questions' in data
    # check questions
    if valid:
        for question in data['questions']:
            valid &= 'question_id' in question
            valid &= 'text' in question
            valid &= 'answers' in question
            if valid:
                for answer in question['answers']:
                    valid &= 'answer_id' in answer
                    valid &= 'data' in answer
    return valid


# TODO: placeholder function, reimplement once integrated
@cache.cached(key_prefix='datasets-cache')
def _load_dataset(dataset_id):
    folder = current_app.config['UPLOAD_FOLDER']
    file_name = _load_dataset_name_list()[dataset_id]['name'] + '.json'

    logger.debug(f"Filename {file_name}")

    file = pathlib.Path(path.join(folder, file_name))
    logger.debug(f"Trying to load {file}")

    if file.exists():
        logger.debug("File Exists")
        with open(file, 'r') as file:
            logger.debug("File Opened")
            content = file.read()
            logger.debug("Read file")
            return json.loads(content)
    else:
        raise Error(f'File {file_name} not found at {file}', status_code=500)


# load datasets from disk, should be updated to load from service for specified user (currently not given)
@cache.cached(key_prefix='datasets-cache-list')
def _load_dataset_name_list():
    datasets = []

    folder = current_app.config['UPLOAD_FOLDER']

    _, _, filenames = next(walk(folder))
    counter = 0

    for filename in filenames:
        if filename == '.gitignore' or filename == '.DS_Store':
            continue
        file_path = pathlib.Path(path.join(folder, filename))

        datasets.append({
            'id': counter,
            'name': filename[:filename.find('.json')],  # name of file
            'date': datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
        })
        counter += 1

    return datasets


@api.route('/list')
@api.doc(description='list all available datasets')
class DatasetsAPI(Resource):
    @api.marshal_list_with(DATASET_DESC)
    def get(self):
        return _load_dataset_name_list()


@api.route('/upload')
@api.doc('endpoint to upload answers datasets')
class Upload(Resource):
    @api.doc(description='upload file')
    def post(self):
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return "no file received"
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_file.filename)
        uploaded_file.save(full_path)
        cache.delete('datasets-cache')
        cache.delete('datasets-cache-list')
        logger.debug('Deleted datasets cache')
        return f'uploaded file: {uploaded_file.name} successfully'


@api.route('/get-dataset/<int:index>')
@api.doc(description='get content of uploaded file')
class UploadedDataset(Resource):
    @api.doc(description='Get content of specific dataset')
    @api.marshal_with(DATASET)
    def get(self, index):
        content = _load_dataset(index)
        logger.debug(content)
        return content
