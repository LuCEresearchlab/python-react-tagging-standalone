from os import environ
from dotenv import load_dotenv

load_dotenv(".env")

UPLOAD_FOLDER = environ.get('UPLOAD_FOLDER')
SIMILARITY_CLUSTERING_STATE = (environ.get('SIMILARITY_CLUSTERING_STATE') == 'true') or \
                              (environ.get('SIMILARITY_CLUSTERING_STATE') == 'True')
