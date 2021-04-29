from os import environ

SIMILARITY_CLUSTERING_STATE = (environ.get('SIMILARITY_CLUSTERING_STATE') == 'true') or \
                              (environ.get('SIMILARITY_CLUSTERING_STATE') == 'True')
