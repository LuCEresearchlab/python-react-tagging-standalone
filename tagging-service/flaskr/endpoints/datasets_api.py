from os import walk, path
import pathlib
import datetime
from flask import current_app
from flask_restx import Namespace, Resource, fields

api = Namespace('datasets', description='API to view available datasets')

dataset_desc = api.model('Answer', {
    'id': fields.String(required=True, readonly=True, description='ID of the dataset'),
    'title': fields.String(required=True, readonly=True, description='The title of the dataset'),
    'date': fields.Date(required=True, readonly=True, description='The Date of the dataset creation')
})


# load datasets from disk, should be updated to load from service for specified user (currently not given)
def _load_datasets():
    datasets = []

    folder = current_app.config['UPLOAD_FOLDER']

    _, _, filenames = next(walk(folder))

    for filename in filenames:
        if filename == '.gitignore':
            continue
        file = pathlib.Path(path.join(folder, filename))
        datasets.append({
            'id': 0,
            'title': filename[:filename.find('.json')],  # name of file
            'date': datetime.datetime.fromtimestamp(file.stat().st_mtime)
        })

    return datasets


@api.route('/list')
@api.doc('list all available datasets')
class DatasetsAPI(Resource):
    @api.marshal_list_with(dataset_desc)
    def get(self):
        return _load_datasets()
