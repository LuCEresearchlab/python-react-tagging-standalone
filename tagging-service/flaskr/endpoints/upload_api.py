import os
import json
import datetime
import pathlib
import logging
from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from flaskr.exceptions.error import Error
from flaskr import cache

import flaskr.util.mongo_helper as db
from flaskr.util.xlnet_loader import get_sorted_answers

api = Namespace('datasets', description='Upload API to load files')

logger = logging.getLogger(__name__)

DATASET_DESC = api.model('Dataset Description', {
    'id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'name': fields.String(required=True, readonly=True, description='The name of the dataset'),
    'date': fields.Date(required=True, readonly=True, description='The Date of the dataset creation')
})

ANSWER = api.model('Answer', {
    'answer_id': fields.String(required=True, readonly=True, description='ID of the Answer'),
    'data': fields.String(required=True, readonly=True, description='Text of the Answer')
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
    id_to_filename, _ = _get_dataset_id_to_filename_name_map()

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
                question['answers'] = get_sorted_answers(answers)
            return j
    else:
        raise Error(f'File {file} not found at {file}', status_code=500)


@cache.cached(key_prefix='datasets-id-map')
def _get_dataset_id_to_filename_name_map():
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
def _load_dataset_name_list():
    datasets = []

    folder = current_app.config['UPLOAD_FOLDER']

    _, _, filenames = next(os.walk(folder))
    counter = 0

    for filename in filenames:
        if filename == '.gitignore' or filename == '.DS_Store':
            continue

        file_path = pathlib.Path(os.path.join(folder, filename)).absolute()

        dataset_id_to_filename, dataset_id_to_name = _get_dataset_id_to_filename_name_map()
        filename_to_dataset_id = {v: k for k, v in dataset_id_to_filename.items()}

        dataset_id = filename_to_dataset_id[file_path]

        datasets.append({
            'id': dataset_id,
            'name': dataset_id_to_name[dataset_id],
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
        cache.delete('dataset-id-map')
        logger.debug('Deleted datasets cache')
        return f'uploaded file: {uploaded_file.name} successfully'


@api.route('/get-dataset/dataset/<string:dataset_id>')
@api.doc(description='get content of uploaded file')
class UploadedDataset(Resource):
    @api.doc(description='Get content of specific dataset')
    @api.marshal_with(DATASET)
    def get(self, dataset_id):
        content = _load_dataset(dataset_id)
        return content


def _populate_retrieving_maps(dataset_id):
    dataset = _load_dataset(dataset_id)
    id_to_question_data = {}
    id_to_answer_data = {}
    for question in dataset['questions']:
        id_to_question_data[question['question_id']] = question
        for answer in question['answers']:
            id_to_answer_data[answer['answer_id']] = answer
    return id_to_question_data, id_to_answer_data


@api.route('/download/dataset/<string:dataset_id>')
@api.doc(description='Get all tagged answers in specified dataset in a downloadable format',
         params={'dataset_id': 'ID of the dataset'})
class TaggedAnswersDownloadAPI(Resource):
    def get(self, dataset_id):

        id_to_question_data, id_to_answer_data = _populate_retrieving_maps(dataset_id)

        tagged_answers = db.get_tagged_dataset(dataset_id)

        formatted_values = []

        for tagged_answer in tagged_answers:
            question_id = tagged_answer['question_id']
            answer_id = int(tagged_answer['answer_id'])

            tagged_answer['question_text'] = id_to_question_data[question_id]['text']
            tagged_answer['answer_text'] = id_to_answer_data[answer_id]['data']
            formatted_values.append(tagged_answer)

        return formatted_values


@api.route('/tagged-answer/dataset/<string:dataset_id>/tag/<string:misconception>')
@api.doc(description='Get all tagged answers in specified dataset with specific misconception',
         params={
             'dataset_id': 'ID of the dataset',
             'misconception': 'misconception contained by the answers to return'
         })
class TaggedAnswersMisconceptionAPI(Resource):
    def get(self, dataset_id, misconception):

        id_to_question_data, id_to_answer_data = _populate_retrieving_maps(dataset_id)

        answers = db.get_tagged_dataset_with_tag(dataset_id=dataset_id, tag=misconception)

        for answer in answers:

            question_id = answer['question_id']
            answer_id = int(answer['answer_id'])

            answer['question_text'] = id_to_question_data[question_id]['text']
            answer['data'] = id_to_answer_data[answer_id]['data']

        return answers
