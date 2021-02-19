import os
from flask import request, current_app
from flask_restx import Namespace, Resource
from webargs.flaskparser import use_kwargs
from webargs import fields

api = Namespace('upload', description='Upload API to load files')


@api.route('')
@api.doc('endpoint to upload answers datasets')
class Upload(Resource):
    @api.doc('upload file')
    @use_kwargs({'file': fields.Field(validate=lambda file: file.mimetype == 'multipart/form-data', location="files")})
    def post(self):
        uploaded_file = request.files['file']
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_file.filename)
        uploaded_file.save(full_path)
        return f'uploaded file: {uploaded_file.name} successfully'
