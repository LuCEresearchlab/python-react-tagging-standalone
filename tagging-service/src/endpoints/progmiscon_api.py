from flask_restx import Namespace, Resource
from src.util.progmiscon_helper import get_java_public_misconceptions
from src import cache

api = Namespace('progmiscon_api', description='API for grouping answers by similarity')


@api.route('/misconceptions')
class Misconceptions(Resource):
    @api.doc('lists available misconceptions for Java')
    @cache.cached(timeout=60 * 60 * 24)
    def get(self):
        return get_java_public_misconceptions()
