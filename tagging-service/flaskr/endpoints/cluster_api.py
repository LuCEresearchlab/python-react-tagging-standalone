from flask import request
from flask_restx import Namespace, Resource, fields
from flaskr.endpoints.upload_api import ANSWER
from flaskr import cache

import flaskr.util.mongo_helper as db

api = Namespace('clusters', description='API to view available datasets')

CLUSTERED_ANSWERS = api.model('Clustered Answers', {
    'dataset_id': fields.String(required=True, readonly=True, description='ID of the dataset',
                                example='603501f39175ac3898e094cc'),
    'question_id': fields.String(required=True, readonly=True, description='ID of the question',
                                 example='6035089963cf6ef09a9c418e'),
    'clusters': fields.List(fields.List(fields.Nested(ANSWER)))
})


@api.route('/dataset/<string:dataset_id>/question/<string:question_id>/user/<string:user_id>')
@api.doc(description='API to get clusters for current user',
         params={
             'dataset_id': 'ID of the dataset',
             'user_id': 'ID of the user'
         })
class Clusters(Resource):
    @api.marshal_list_with(CLUSTERED_ANSWERS)
    @cache.memoize()
    def get(self, dataset_id, question_id, user_id):
        return db.get_cluster(dataset_id=dataset_id, question_id=question_id, user_id=user_id)[0]

    @api.expect(CLUSTERED_ANSWERS)
    def post(self, dataset_id, question_id, user_id):
        data = request.get_json()
        db.save_cluster(dataset_id=dataset_id, question_id=question_id, user_id=user_id, cluster=data)
        cache.delete_memoized(Clusters.get, dataset_id, user_id)
