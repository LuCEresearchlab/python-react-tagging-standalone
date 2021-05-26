import json
import os
import time

from flask import Flask
from flask_caching import Cache
from flask_testing import TestCase
from testcontainers.core.container import DockerContainer

from flaskr.endpoints import api

mongo_container = DockerContainer("mongo:4.2.13-bionic")
mongo_container.with_volume_mapping(host=str(os.path.abspath('../../mongodb/init-mongo.js')),
                                    container='/docker-entrypoint-initdb.d/init-mongo.js', mode='ro')

mongo_container.with_bind_ports(27017, 27017)

tagged_answer = {
    "dataset_id": "d1",
    "question_id": "q1",
    "answer_id": "a1",
    "user_id": "user_test",
    "tags": ["NoMisconception"],
    "tagging_time": 10,
    "highlighted_ranges": [],
    "answer_text": "some answer"
}

config = {
    "DEBUG": True,  # some Flask specific configs
    "CACHE_TYPE": "simple",  # Flask-Caching related configs
}
cache = Cache(config=config)


class DatasetApiTest(TestCase):

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

    def test1_upload(self):
        test_client = self.app.test_client()
        response = test_client.post('/datasets/upload',
                                    headers={"Content-Type": "multipart/form-data"},
                                    data={'file': open('test.json', 'rb')})

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

        assert response.json == 'uploaded file: file successfully'

    def test2_list(self):
        test_client = self.app.test_client()
        response = test_client.get('/datasets/list')
        while len(response.json) == 0 or not response.json[0]['finished_clustering']:
            time.sleep(0.1)
            response = test_client.get('/datasets/list')

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

        response_json = response.json

        assert type(response_json) == list
        assert len(response_json) == 1

        dataset = response_json[0]

        assert dataset['dataset_id'] == 'd1'
        assert dataset['name'] == 'test-dataset'
        assert dataset['clusters_computed'] == 1
        assert dataset['nr_questions'] == 1
        assert dataset['finished_clustering']

    def test3_download_empty(self):
        test_client = self.app.test_client()

        response = test_client.get('/datasets/download/dataset/d1')

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 0

    def test4_get_dataset(self):
        test_client = self.app.test_client()
        response = test_client.get('/datasets/get-dataset/dataset/d1')

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'

        dataset = response.json
        assert dataset['name'] == 'test-dataset'
        assert dataset['dataset_id'] == 'd1'
        assert dataset['questions'] == [{'question_id': 'q1', 'text': 'question_text'}]

    def test5_tagged_answer_post(self):
        payload = json.dumps(tagged_answer)

        test_client = self.app.test_client()
        response = test_client.post('/datasets/tagged-answer',
                                    headers={"Content-Type": "application/json"},
                                    data=payload)

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert response.json == tagged_answer

    def test6_tagged_answer_dataset(self):
        response = self.app.test_client().get('/datasets/tagged-answer/dataset/d1')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1
        assert response.json[0] == tagged_answer

    def test7_download_not_empty(self):
        response = self.app.test_client().get('/datasets/download/dataset/d1')

        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1
        assert response.json[0] != tagged_answer
        assert response.json[0]['question_text'] is not None

    def test8_tagged_answer_dataset_question(self):
        response = self.app.test_client().get('/datasets/tagged-answer/dataset/d1/question/q1')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1
        assert response.json[0] == tagged_answer

    def test8_tagged_answer_dataset_question_answer_user(self):
        response = self.app.test_client().get('/datasets/tagged-answer/dataset/d1/question/q1/answer/a1/user/user_test')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1
        assert response.json[0] == tagged_answer

    def test8_tagged_answer_dataset_tag(self):
        response = self.app.test_client().get('/datasets/tagged-answer/dataset/d1/tag/NoMisconception')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1

    def test8_tagged_answer_dataset_tag(self):
        response = self.app.test_client().get('/datasets/user-tags/d1/user_test')
        TestCase.assert200(self, response)
        assert response.mimetype == 'application/json'
        assert type(response.json) == list
        assert len(response.json) == 1
