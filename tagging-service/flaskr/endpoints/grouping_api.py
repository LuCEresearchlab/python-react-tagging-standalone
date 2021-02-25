from flask_restx import Namespace, Resource, fields
from flaskr.util.answers_loader import load_data

api = Namespace('grouping_api', description='API for grouping answers by similarity')

answer = api.model('Answer', {
    'content': fields.String(required=True, readonly=True, description='The answer of the student'),
    'question_type': fields.String(required=True, readonly=True, description='The question type')
})


@api.route('/group_similarity')
@api.doc(description='group answers by similarity')
class Grouping(Resource):
    @api.doc(description='group given answers')
    @api.marshal_list_with(answer)
    def get(self):
        return load_data()
