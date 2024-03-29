import json
import logging
from threading import Thread
from flask import request
from flask_restx import Namespace, Resource, fields
from flaskr import cache

from flaskr.handlers.dataset_handler import get_dataset_list, add_dataset, get_dataset
from flaskr.util.answers_loader import populate_retrieving_maps
from flaskr.util.mongo_helper import get_tagged_dataset, get_tagged_dataset_with_tag

api = Namespace('datasets', description='API to interact with datasets')

logger = logging.getLogger(__name__)

DATASET_DESC = api.model('Dataset Description', {
    'dataset_id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'name': fields.String(required=True, readonly=True, description='The name of the dataset'),
    'creation_data': fields.DateTime(required=True, readonly=True, description='The Date of the dataset creation'),
    'clusters_computed': fields.Integer(required=True, readonly=True, description='Number of computed clusters'),
    'nr_questions': fields.Integer(required=True, readonly=True, description='Number of questions in dataset'),
    'finished_clustering': fields.Boolean(required=True, readonly=True, description='Is done clustering?')
})

ANSWER = api.model('Answer', {
    'answer_id': fields.String(required=True, readonly=True, description='ID of the Answer'),
    'data': fields.String(required=True, readonly=True, description='Text of the Answer'),
    'picked': fields.Boolean(required=True, readonly=True, description='Value picked'),
    'matches_expected': fields.Boolean(required=True, readonly=True, description='Answer matches expected value')
})

QUESTION = api.model('Question', {
    'question_id': fields.String(required=True, readonly=True, description='ID of the Question'),
    'text': fields.String(required=True, readonly=True, description='Text of the Question')
})

DATASET = api.model('Dataset', {
    "name": fields.String(required=True, readonly=True, description='Name of dataset'),
    "creation_data": fields.DateTime(required=True, readonly=True, description='The Date of the Dataset creation'),
    "dataset_id": fields.String(required=True, readonly=True, description='ID of the Dataset'),
    "questions": fields.List(fields.Nested(QUESTION))
})


@api.route('/list')
@api.doc(description='list all available datasets')
class DatasetsAPI(Resource):
    @cache.cached(key_prefix='dataset-list', timeout=10)
    @api.marshal_list_with(DATASET_DESC)
    def get(self):
        return get_dataset_list()


@api.route('/upload')
@api.doc('endpoint to upload answers datasets')
class Upload(Resource):
    @api.doc(description='upload file')
    def post(self):
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return "no file received"

        def thread_function(dataset):
            logger.debug('adding dataset in thread')
            add_dataset(dataset=dataset, mem_to_clean=[TaggedAnswersDownloadAPI.get, UploadedDataset.get])
            logger.debug('added dataset')

        json_dataset = json.loads(uploaded_file.read())

        dataset_from_db = get_dataset(dataset_id=json_dataset['dataset_id'])
        if dataset_from_db is not None and dataset_from_db['clusters_computed'] != len(dataset_from_db['questions']):
            return f'rejected file: {uploaded_file.name}, dataset still uploading'

        Thread(target=thread_function, args=(json_dataset,)).start()

        return f'uploaded file: {uploaded_file.name} successfully'


@api.route('/get-dataset/dataset/<string:dataset_id>')
@api.doc(description='get content of uploaded file')
class UploadedDataset(Resource):
    @cache.memoize()
    @api.doc(description='Get content of specific dataset')
    @api.marshal_with(DATASET)
    def get(self, dataset_id):
        return get_dataset(dataset_id=dataset_id)


@api.route('/download/dataset/<string:dataset_id>')
@api.doc(description='Get all tagged answers in specified dataset in a downloadable format',
         params={'dataset_id': 'ID of the dataset'})
class TaggedAnswersDownloadAPI(Resource):
    @cache.memoize()
    def get(self, dataset_id):
        id_to_question_data, id_to_answer_data = populate_retrieving_maps(get_dataset(dataset_id=dataset_id))

        tagged_answers = get_tagged_dataset(dataset_id)

        formatted_values = []

        for tagged_answer in tagged_answers:
            question_id = tagged_answer['question_id']
            answer_id = tagged_answer['answer_id']

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
        id_to_question_data, id_to_answer_data = populate_retrieving_maps(get_dataset(dataset_id=dataset_id))

        answers = get_tagged_dataset_with_tag(dataset_id=dataset_id, tag=misconception)

        for answer in answers:
            question_id = answer['question_id']
            answer_id = answer['answer_id']

            answer['question_text'] = id_to_question_data[question_id]['text']
            answer['data'] = id_to_answer_data[answer_id]['data']

        return answers
