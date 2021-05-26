from flask import Flask
from flask_caching import Cache
from flask_testing import TestCase
from flaskr.endpoints import api

config = {
    "DEBUG": True,  # some Flask specific configs
    "CACHE_TYPE": "simple",  # Flask-Caching related configs
}
cache = Cache(config=config)


class ProgmisconAPITest(TestCase):

    def create_app(self):
        app = Flask(__name__)
        api.init_app(app)
        cache.init_app(app)
        self.app = app
        return app

    def test_get_misconceptions(self):
        response = self.app.test_client().get('/progmiscon_api/misconceptions')
        assert response.status_code == 200
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        for misc in response.json:
            assert type(misc['name']) == str
            assert misc['name'] != ''
            assert type(misc['description']) == str
            assert misc['description'] != ''
            assert type(misc['color']) == str
            assert misc['color'].startswith('#')
