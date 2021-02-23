from os import walk, path
import pathlib
import datetime
from flask import current_app, request
from flask_restx import Namespace, Resource, fields
import flaskr.util.mongo_helper as db

api = Namespace('datasets', description='API to view available datasets')

DATASET_DESC = api.model('Answer', {
    'id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'name': fields.String(required=True, readonly=True, description='The name of the dataset'),
    'date': fields.Date(required=True, readonly=True, description='The Date of the dataset creation')
})


TAGGED_DATA = api.model('Tagged_Question', {
    'dataset_id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'question_id': fields.String(required=True, readonly=True, description='ID of the question'),
    'answer_id': fields.String(required=True, readonly=True, description='ID of the answer'),
    'user': fields.String(required=True, readonly=True, description='User tagging the data'),
    'tags': fields.List(fields.String(readonly=True, description='Tags for answer'), required=True)
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
@api.doc('list all available datasets')
class DatasetsAPI(Resource):
    @api.marshal_list_with(DATASET_DESC)
    def get(self):
        return _load_datasets()


@api.route('/tagged-datasets')
@api.doc('API for tagged datasets')
class TaggedAnswerAPI(Resource):
    @api.doc('get all tagged datasets')
    @api.marshal_with(IDS)
    def get(self):
        return {'ids': db.get_tagged_datasets()}


@api.route('/tagged-answer')
@api.doc('API for tagged answers')
class TaggedAnswerAPI(Resource):
    @api.doc('add tagged answer')
    @api.marshal_with(TAGGED_DATA)
    def post(self):
        data = request.get_json()
        db.post_tagged_answer(data)
        return data
