from flask import request
from flask_restx import Namespace, Resource, fields

import flaskr.util.mongo_helper as db

api = Namespace('datasets', description='API to interact with datasets')

RANGE = api.model('Range', {
    'start': fields.Integer(required=True, readonly=True, description='start of the range',
                            example='0'),
    'end': fields.Integer(required=True, readonly=True, description='end of the range',
                          example='10'),
    'misconception': fields.String(required=True, readonly=True, description='Misconception associated with the range',
                                   example='NoMisconception'),
})


TAGGED_DATA = api.model('Tagged Answer', {
    'dataset_id': fields.String(required=True, readonly=True, description='ID of the dataset',
                                example='603501f39175ac3898e094cc'),
    'question_id': fields.String(required=True, readonly=True, description='ID of the question',
                                 example='6035089963cf6ef09a9c418e'),
    'answer_id': fields.String(required=True, readonly=True, description='ID of the answer',
                               example='3535089963cf6ef09a9c418e'),
    'user_id': fields.String(required=True, readonly=True, description='ID of the User tagging the data',
                             example='9435089963cf6ef09a9c418e'),
    'answer_text': fields.String(required=True, readonly=True, description='Answer of the student',
                                 example='I don\'t know'),
    'tags': fields.List(fields.String(readonly=True, description='Tags for answer',
                                      example="NullIsObject"), required=True),
    'tagging_time': fields.Integer(required=False, readonly=True, description='Total ms taken to tag the answer',
                                   example='15000'),
    'highlighted_ranges': fields.List(fields.Nested(RANGE), required=True)
})


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


@api.route('/tagged-answer/dataset/<string:dataset_id>')
@api.doc(description='Get all tagged answers in specified dataset',
         params={'dataset_id': 'ID of the dataset'})
class TaggedAnswersAPI(Resource):
    @api.marshal_list_with(TAGGED_DATA)
    def get(self, dataset_id):
        return db.get_tagged_dataset(dataset_id=dataset_id)


@api.route('/tagged-answer/dataset/<string:dataset_id>/question/<string:question_id>/answer/<string:answer_id>/user/<string:user_id>')
@api.doc(description='Get specific answer',
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


@api.route('/tagged-answer/dataset/<string:dataset_id>/question/<string:question_id>')
@api.doc(description='API to get all answers for specific question',
         params={
             'dataset_id': 'ID of the dataset',
             'question_id': 'ID of the question'
         })
class UserTaggedDatasetAPI(Resource):
    @api.marshal_list_with(TAGGED_DATA)
    def get(self, dataset_id, question_id):
        return db.get_tagged_question(dataset_id=dataset_id, question_id=question_id)


