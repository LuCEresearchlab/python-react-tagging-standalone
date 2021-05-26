import json
import os
import time

from flask import Flask
from flask_testing import TestCase
from testcontainers.core.generic import GenericContainer

from flaskr.config import cache
from flaskr.endpoints import api
from test.util import add_dataset_and_wait

mongo_container = GenericContainer("mongo:4.2.13-bionic")
mongo_container.with_volume_mapping(host=str(os.path.abspath('../../mongodb/init-mongo.js')),
                                    container='/docker-entrypoint-initdb.d/init-mongo.js', mode='ro')

mongo_container.with_bind_ports(27017, 27017)


class ClusterApiTest(TestCase):

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

    def test1_cluster_get_default(self):
        test_client = self.app.test_client()
        # add dataset to generate clusters
        add_dataset_and_wait(test_client=test_client)

        response = test_client.get('/clusters/dataset/d1/question/q1/user/user_test')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

        response_json = response.json

        assert response_json['dataset_id'] == 'd1'
        assert response_json['question_id'] == 'q1'

        clusters = response_json['clusters']

        assert type(clusters) == list
        assert len(clusters) == 2
        for cluster_idx, cluster in enumerate(clusters):
            assert cluster['name'] == 'Cluster ' + str(cluster_idx + 1)
            assert type(cluster['answers']) == list
            assert len(cluster['answers']) == 2

    def test2_cluster_set(self):
        with open('test.json', 'rb') as file:
            dataset = json.loads(file.read())
            payload = json.dumps({
                'dataset_id': 'd1',
                'question_id': 'q1',
                'clusters': [
                    {
                        'name': 'custom cluster',
                        'answers': dataset['questions'][0]['answers']
                    }
                ]
            })

            response = self.app.test_client().post('/clusters/dataset/d1/question/q1/user/user_test',
                                                   headers={"Content-Type": "application/json"},
                                                   data=payload)
            TestCase.assert200(self, response)
            assert response.mimetype == 'application/json'

    def test3_cluster_get_custom(self):
        response = self.app.test_client().get('/clusters/dataset/d1/question/q1/user/user_test')

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

        response_json = response.json

        assert response_json['dataset_id'] == 'd1'
        assert response_json['question_id'] == 'q1'

        clusters = response_json['clusters']

        assert type(clusters) == list
        assert len(clusters) == 1
