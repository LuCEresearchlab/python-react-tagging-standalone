import os
import logging
from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from flaskr import cache

import flaskr.util.mongo_helper as db
from flaskr.util.answers_loader import load_dataset_name_list, load_dataset, populate_retrieving_maps

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
    'picked': fields.Boolean(required=True, readonly=True, description='Value picked'),
    'matches_expected': fields.Boolean(required=True, readonly=True, description='Answer matches expected value')
})

QUESTION = api.model('Question', {
    'question_id': fields.String(required=True, readonly=True, description='ID of the Question'),
    'text': fields.String(required=True, readonly=True, description='Text of the Question')
})

DATASET = api.model('Dataset', {
    "name": fields.String(required=True, readonly=True, description='Name of dataset'),
    "creation_data": fields.Date(required=True, readonly=True, description='The Date of the Dataset creation'),
    "dataset_id": fields.String(required=True, readonly=True, description='ID of the Dataset'),
    "questions": fields.List(fields.Nested(QUESTION))
})


@api.route('/list')
@api.doc(description='list all available datasets')
class DatasetsAPI(Resource):
    @api.marshal_list_with(DATASET_DESC)
    def get(self):
        return load_dataset_name_list()


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
        content = load_dataset(dataset_id)
        return content


@api.route('/download/dataset/<string:dataset_id>')
@api.doc(description='Get all tagged answers in specified dataset in a downloadable format',
         params={'dataset_id': 'ID of the dataset'})
class TaggedAnswersDownloadAPI(Resource):
    def get(self, dataset_id):
        id_to_question_data, id_to_answer_data = populate_retrieving_maps(dataset_id)

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
        id_to_question_data, id_to_answer_data = populate_retrieving_maps(dataset_id)

        answers = db.get_tagged_dataset_with_tag(dataset_id=dataset_id, tag=misconception)

        for answer in answers:

            question_id = answer['question_id']
            answer_id = int(answer['answer_id'])

            answer['question_text'] = id_to_question_data[question_id]['text']
            answer['data'] = id_to_answer_data[answer_id]['data']

        return answers
