from pymongo import MongoClient

client = MongoClient("mongodb://tagging-database:27017/?appname=tagging_service&ssl=false")
db = client['tagging_db']


def get_db_names():
    return client.list_database_names()


def get_tagged_datasets():
    return db.tagged_data.distinct('dataset_id')


def get_tagged_dataset(dataset_id):
    return list(db.tagged_data.find({'dataset_id': dataset_id}, {'_id': False}))


def get_tagged_dataset_with_tag(dataset_id, tag):
    return list(db.tagged_data.find({'dataset_id': dataset_id, 'tags': {
        "$all": [tag]
    }}, {'_id': False}))


def get_tagged_question(dataset_id, question_id):
    return list(db.tagged_data.find({'dataset_id': dataset_id, 'question_id': question_id}, {'_id': False}))


def get_answers_tagged_by_user_in_dataset(dataset_id, user_id):
    return list(db.tagged_data.find({'user_id': user_id, 'dataset_id': dataset_id}, {'_id': False}))


def get_fully_specified_answer(dataset_id, question_id, answer_id, user_id):
    return list(db.tagged_data.find({
        'dataset_id': dataset_id,
        'question_id': question_id,
        'answer_id': answer_id,
        'user_id': user_id
    }, {'_id': False}))


def post_tagged_answer(tagged_answer):
    query = {
        'dataset_id': tagged_answer['dataset_id'],
        'question_id': tagged_answer['question_id'],
        'answer_id': tagged_answer['answer_id'],
        'user_id': tagged_answer['user_id']
    }
    update = {
        '$set':
            {
                'tags': tagged_answer['tags'],
                'tagging_time': tagged_answer['tagging_time'],
                'highlighted_ranges': tagged_answer['highlighted_ranges'],
                'answer_text': tagged_answer['answer_text']
            }
    }
    db.tagged_data.update_one(query, update, upsert=True)


def save_cluster(dataset_id, question_id, user_id, cluster):
    query = {
        'dataset_id': dataset_id,
        'question_id': question_id,
        'user_id': user_id
    }
    update = {
        '$set':
            {
                'clusters': cluster
            }
    }
    db.cluster_data.update_one(query, update, upsert=True)


def get_cluster(dataset_id, question_id, user_id):
    clusters = list(db.cluster_data.find({'dataset_id': dataset_id, 'question_id': question_id, 'user_id': user_id},
                                         {'_id': False}))

    if len(clusters) == 0:
        return list(db.cluster_data.find({'dataset_id': dataset_id, 'question_id': question_id, 'user_id': ''},
                                         {'_id': False}))
    return clusters
