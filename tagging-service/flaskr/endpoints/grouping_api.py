from flask_restx import Namespace, Resource
from flaskr import cache

from flaskr.util.answers_loader import get_dataset_answers
from flaskr.util.model_loader import cluster

api = Namespace('grouping_api', description='API for grouping answers by similarity')


@api.route('/dataset/<string:dataset_id>/question/<string:question_id>')
@api.doc(description='group answers by similarity')
class Grouping(Resource):
    @cache.cached()
    @api.doc(description='group given answers')
    def get(self, dataset_id, question_id):
        answers = get_dataset_answers(dataset_id=dataset_id, question_id=question_id)
        c = cluster(answers)
        return c
