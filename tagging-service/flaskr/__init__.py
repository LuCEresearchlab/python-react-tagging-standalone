from flask import Flask
from flaskr.config import cache
from flaskr.endpoints import api


def create_app(test_config=None):
    app = Flask(__name__)

    api.init_app(app)
    cache.init_app(app)
    app.config['UPLOAD_FOLDER'] = './datasets'
    return app

app = create_app()
app.run(debug=True, host='0.0.0.0', threaded=True)
