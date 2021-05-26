import json
import os

import pytest
from flask import Flask
from flask_testing import TestCase
from testcontainers.core.generic import GenericContainer

from flaskr.config import cache
from flaskr.endpoints import api

mongo_container = GenericContainer("mongo:4.2.13-bionic")
mongo_container.with_volume_mapping(host=str(os.path.abspath('../../mongodb/init-mongo.js')),
                                    container='/docker-entrypoint-initdb.d/init-mongo.js', mode='ro')

mongo_container.with_bind_ports(27017, 27017)


class AuthApiTest(TestCase):

    @classmethod
    def setUpClass(cls):
        mongo_container.start()

    @classmethod
    def tearDownClass(cls):
        mongo_container.stop()

    def create_app(self):
        app = Flask(__name__)
        api.init_app(app)
        cache.init_app(app)
        self.app = app
        return app

    def test_user_exists_false(self):
        response = self.app.test_client().get('/auth/exists/test_user')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert not response.json

    def test_user_register(self):
        payload = json.dumps({'username': 'test_user', 'password': 'test_user_password'})

        response = self.app.test_client().post('/auth/register',
                                               headers={"Content-Type": "application/json"},
                                               data=payload)
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

    def test_user_exists_true(self):
        response = self.app.test_client().get('/auth/exists/test_user')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        TestCase.assertTrue(self, response)

    def test_user_login(self):
        payload = json.dumps({'username': 'test_user', 'password': 'test_user_password'})

        response = self.app.test_client().post('/auth/login',
                                               headers={"Content-Type": "application/json"},
                                               data=payload)
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
