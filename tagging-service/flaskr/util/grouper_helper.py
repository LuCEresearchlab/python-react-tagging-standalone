from flask import current_app
from flaskr import cache

from flaskr.util.model_loader import cluster


@cache.memoize()
def get_clusters(answers):
    if current_app.config['SIMILARITY_CLUSTERING_STATE']:
        return cluster(answers)
    return [[answer] for answer in answers]
