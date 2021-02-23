from bson import json_util
from flask import jsonify
from pymongo import MongoClient

client = MongoClient("mongodb://tagging-database:27017/?appname=tagging_service&ssl=false")
db = client['tagging_db']


def serialize_cursor(cursor):
    return jsonify(json_util.dumps(cursor))


def get_db_names():
    return client.list_database_names()


def get_tagged_datasets():
    return db.tagged_data.distinct('dataset_id')


def get_tagged_dataset(dataset_id):
    return db.tagged_data.find({'dataset_id': dataset_id})


def get_tagged_question(dataset_id, question_id):
    return db.tagged_data.find({'dataset_id': dataset_id, 'question_id': question_id})


def post_tagged_answer(tagged_answer):
    query = {
        'dataset_id': tagged_answer['dataset_id'],
        'question_id': tagged_answer['question_id'],
        'answer_id': tagged_answer['answer_id'],
        'user': tagged_answer['user']
    }
    update = {
        '$set':
            {
                'tags': tagged_answer['tags']
            }
    }
    db.tagged_data.update_one(query, update, upsert=True)
