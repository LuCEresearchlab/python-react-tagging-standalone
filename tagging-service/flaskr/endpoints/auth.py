import logging

from flask import request, abort
from flask_restx import Namespace, Resource, fields
from werkzeug.security import generate_password_hash, check_password_hash

from flaskr.config import auth
from flaskr.util.mongo_helper import get_new_mongo_client

api = Namespace('auth', description='API to handle authentication requests')

client = get_new_mongo_client()

logger = logging.getLogger(__name__)

USER = api.model('User', {
    'username': fields.String(required=True, readonly=True, description='Username', example='username'),
    'password': fields.String(required=True, readonly=True, description='Password', example='password')
})

users = {
    "john": generate_password_hash("hello"),
    "susan": generate_password_hash("bye")
}


@auth.verify_password
def authenticate(username, password):
    user = client['users_db'].user_data.find_one({'username': username})
    if user is not None:
        if check_password_hash(pwhash=user['password'], password=password):
            return True
        else:
            return False
    return False


@api.route('/login')
class LoginTest(Resource):
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')
        return authenticate(username=username, password=password)


@api.route('/test')
class LoginTest(Resource):
    @auth.login_required
    def get(self):
        return "test, {}!".format(auth.current_user())


def user_exists(username):
    return client['users_db'].user_data.find_one({'username': username}) is not None


@api.route('/exists/<string:username>')
class UserExists(Resource):
    def get(self, username):
        return user_exists(username=username)


@api.doc(description='Allow to register an username',
         params={
             'username': 'Username to register',
             'password': 'Password for the login'
         })
@api.route('/register')
class Register(Resource):
    @api.expect(USER)
    def post(self):
        username = request.json.get('username')
        password = request.json.get('password')
        if username is None or password is None:
            abort(400)

        db = client['users_db'].user_data

        if user_exists(username=username):
            abort(400)

        password_hash = generate_password_hash(password=password)
        db.insert_one({'username': username, 'password': password_hash})
        logger.debug(f'creating {username}')
        return request.json
