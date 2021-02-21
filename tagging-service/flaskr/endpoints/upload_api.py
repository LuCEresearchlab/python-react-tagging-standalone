import os
from flask import request, current_app
from flask_restx import Namespace, Resource

api = Namespace('upload', description='Upload API to load files')

@api.route('')
@api.doc('endpoint to upload answers datasets')
class Upload(Resource):
    @api.doc('upload file')
    def post(self):
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return "no file received"
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], uploaded_file.filename)
        uploaded_file.save(full_path)
        return f'uploaded file: {uploaded_file.name} successfully'
