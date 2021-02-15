from flask import Flask
from flask_restx import Resource, Api, fields

from util.data_loader import load_data
from util.mongo_helper import get_db_names, get_misconceptions

app = Flask(__name__)
api = Api(app, version='1.0', title='tagging Service',
          description='tagging API',
          )


@api.route('/test')
@api.doc('testing endpoints, just examples')
class TestApp(Resource):
    @api.doc('get test')
    def get(self):
        return 'Hello, World!'


answer = api.model('Answer', {
    'content': fields.String(required=True, readonly=True, description='The answer of the student'),
    'question_type': fields.String(required=True, readonly=True, description='The question type')
})


@api.route('/group_similarity')
@api.doc('group answers by similarity')
class Grouping(Resource):
    @api.doc('group given answers')
    @api.marshal_list_with(answer)
    def get(self):
        return load_data()


@api.route('/info')
class Info(Resource):
    @api.doc('info about mongo database')
    def get(self):
        return get_db_names()


@api.route('/misconceptions')
class Misconceptions(Resource):
    @api.doc('lists available misconceptions for Java')
    def get(self):
        return get_misconceptions()


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
