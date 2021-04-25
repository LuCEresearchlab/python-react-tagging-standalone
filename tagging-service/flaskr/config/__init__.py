from flask_caching import Cache
from flask_httpauth import HTTPBasicAuth

# CACHING
# https://flask-caching.readthedocs.io/en/latest/

config = {
    "DEBUG": True,  # some Flask specific configs
    "CACHE_TYPE": "filesystem",  # Flask-Caching related configs
    "CACHE_DIR": "cache",
    "CACHE_THRESHOLD": 1000,
    "CACHE_DEFAULT_TIMEOUT": 0,
}
cache = Cache(config=config)
auth = HTTPBasicAuth()
