from flask_restx import Namespace, Resource
from flaskr.util.progmiscon_helper import get_java_public_misconceptions
from flaskr import cache

api = Namespace('progmiscon_api', description='API to obtain formatted list of misconceptions')


@api.route('/misconceptions')
class Misconceptions(Resource):
    @api.doc(description='lists available misconceptions for Java')
    @cache.cached(timeout=60 * 60 * 24)
    def get(self):
        return get_java_public_misconceptions()
