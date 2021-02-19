from flask_restx import Namespace, Resource

api = Namespace('upload', description='Upload API to load files')


@api.route('/upload')
@api.doc('endpoint to upload answers datasets')
class Upload(Resource):
    @api.doc('upload file')
    def get(self):
        return 'upload'
