from flask import Flask

from src import cache
from endpoints import api


app = Flask(__name__)

api.init_app(app)
cache.init_app(app)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', threaded=True)
