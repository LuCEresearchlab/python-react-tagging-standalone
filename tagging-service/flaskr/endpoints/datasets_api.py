import datetime
import pathlib
from os import walk, path

from flask import current_app, request
from flask_restx import Namespace, Resource, fields

import flaskr.util.mongo_helper as db

api = Namespace('datasets', description='API to view available datasets')

DATASET_DESC = api.model('Answer', {
    'id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'name': fields.String(required=True, readonly=True, description='The name of the dataset'),
    'date': fields.Date(required=True, readonly=True, description='The Date of the dataset creation')
})

TAGGED_DATA = api.model('Tagged_Answer', {
    'dataset_id': fields.String(required=True, readonly=True, description='ID of the dataset',
                                example='603501f39175ac3898e094cc'),
    'question_id': fields.String(required=True, readonly=True, description='ID of the question',
                                 example='6035089963cf6ef09a9c418e'),
    'answer_id': fields.String(required=True, readonly=True, description='ID of the answer',
                               example='3535089963cf6ef09a9c418e'),
    'user_id': fields.String(required=True, readonly=True, description='ID of the User tagging the data',
                             example='9435089963cf6ef09a9c418e'),
    'tags': fields.List(fields.String(readonly=True, description='Tags for answer',
                                      example="NullIsObject"), required=True),
    'tagging_time': fields.Integer(required=False, readonly=True, description='Total ms taken to tag the answer',
                                   example='15000')
})

IDS = api.model('Ids', {
    'ids': fields.List(fields.String(readonly=True, description='Tags for answer'), required=True,
                       example='603501f39175ac3898e094cc')
})


# load datasets from disk, should be updated to load from service for specified user (currently not given)
def _load_datasets():
    datasets = []

    folder = current_app.config['UPLOAD_FOLDER']

    _, _, filenames = next(walk(folder))
    counter = 0

    for filename in filenames:
        if filename == '.gitignore' or filename == '.DS_Store':
            continue
        file = pathlib.Path(path.join(folder, filename))
        datasets.append({
            'id': counter,
            'name': filename[:filename.find('.json')],  # name of file
            'date': datetime.datetime.fromtimestamp(file.stat().st_mtime)
        })
        counter += 1

    return datasets


@api.route('/list')
@api.doc(description='list all available datasets')
class DatasetsAPI(Resource):
    @api.marshal_list_with(DATASET_DESC)
    def get(self):
        return _load_datasets()


@api.route('/tagged-datasets')
@api.doc(description='API for tagged datasets')
class TaggedDatasetsAPI(Resource):
    @api.doc(description='Get all tagged datasets')
    @api.marshal_with(IDS)
    def get(self):
        return {'ids': db.get_tagged_datasets()}


@api.route('/tagged-answer')
class UserTaggedPostAPI(Resource):
    @api.doc(description="""
    Add tagging data to database in case the user hasn't tagged the answer yet.
    If the Answer is already tagged replace the saved tags with the ones submitted.
    The body of the request must contain a JSON respecting the model.
    """)
    @api.expect(TAGGED_DATA)
    @api.marshal_with(TAGGED_DATA)
    def post(self):
        data = request.get_json()
        db.post_tagged_answer(data)
        return data


@api.route('/tagged-answer/<string:dataset_id>')
@api.doc(description='Get all tagged answers in specified dataset',
         params={'dataset_id': 'ID of the dataset'})
class TaggedAnswersAPI(Resource):
    @api.marshal_list_with(TAGGED_DATA)
    def get(self, dataset_id):
        return db.get_tagged_dataset(dataset_id=dataset_id)


@api.route('/tagged-answer/<string:dataset_id>/<string:question_id>/<string:answer_id>/<string:user_id>')
@api.doc(description='Get answer tagged by the user',
         params={
             'dataset_id': 'ID of the dataset',
             'question_id': 'ID of the question',
             'answer_id': 'ID of the answer',
             'user_id': 'ID of the user'
         })
class TaggedAnswersAPI(Resource):
    @api.marshal_list_with(TAGGED_DATA)
    def get(self, dataset_id, question_id, answer_id, user_id):
        return db.get_fully_specified_answer(
            dataset_id=dataset_id,
            question_id=question_id,
            answer_id=answer_id,
            user_id=user_id)


@api.route('/user-tags/<string:dataset_id>/<string:user_id>')
@api.doc(description='API to get all answers tagged by the user for a specific dataset',
         params={
             'dataset_id': 'ID of the dataset',
             'user_id': 'ID of the user'
         })
class UserTaggedDatasetAPI(Resource):
    @api.marshal_list_with(TAGGED_DATA)
    def get(self, dataset_id, user_id):
        return db.get_answers_tagged_by_user_in_dataset(dataset_id=dataset_id, user_id=user_id)
