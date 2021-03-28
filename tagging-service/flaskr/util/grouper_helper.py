from flaskr import cache

from flaskr.util.model_loader import cluster


@cache.cached()
def get_clusters(answers):
    return cluster(answers)


@cache.cached()
def fake_get_clusters(answers):
    return [[answer] for answer in answers]
