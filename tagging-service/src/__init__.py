from flask_caching import Cache

# CACHING
# https://flask-caching.readthedocs.io/en/latest/
config = {
    "DEBUG": True,  # some Flask specific configs
    "CACHE_TYPE": "simple",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 600,
}
cache = Cache()
