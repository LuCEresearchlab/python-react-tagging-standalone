from flask import current_app

from flaskr.util.model_loader import cluster
from flaskr.util.mongo_helper import get_cluster


def get_clusters(dataset_id, question_id, answers):
    if current_app.config['SIMILARITY_CLUSTERING_STATE']:
        current_cluster = get_cluster(dataset_id=dataset_id, question_id=question_id, user_id='')
        if len(current_cluster) == 0:
            return cluster(answers)
        else:
            return current_cluster
    return [[answer] for answer in answers]
