from pymongo import MongoClient
from bson import json_util
from flask import jsonify

client = MongoClient("mongodb://mongo_database:27017/")
db = client['tagging_db']


def serialize_cursor(cursor):
    return jsonify(json_util.dumps(cursor))


def get_db_names():
    return client.list_database_names()


def get_misconceptions():
    return serialize_cursor(db.misconceptions.find({"pl": "Java"}, {'_id': 0, 'name': 'true'}))
