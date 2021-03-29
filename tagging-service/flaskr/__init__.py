from flask import Flask, jsonify
from flaskr.config import cache
from flaskr.endpoints import api
from flask_cors import CORS
from flaskr.exceptions.error import Error
import logging

logging.basicConfig(level=logging.INFO, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')


def create_app(test_config=None):
    app = Flask(__name__)

    api.init_app(app)
    cache.init_app(app)
    app.config.from_pyfile('./config/env_config.py')
    CORS(app, resources={r'/*': {"origins": "http://localhost:8080"}})

    @app.errorhandler(Error)
    def handle_invalid_usage(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='0.0.0.0', threaded=True)
