#!/usr/bin/env python3

import pandas as pd
import numpy as np
from datetime import datetime

import os
import argparse
import json

parser = argparse.ArgumentParser(description='Convert files to required format.')

parser.add_argument('filepath', metavar='filepath', type=str, help='dataset file (excel format)')
parser.add_argument('quiz_file', metavar='quiz_file', type=str, help='quiz session file')

args = parser.parse_args()

filepath = args.filepath
quiz_file = args.quiz_file

cols = ['question', 'isCorrect', 'explanation']

dataset = pd.read_excel(filepath, usecols=cols)
# drop invalid columns
dataset = dataset.dropna(axis='rows', subset=['question'])

# remove comma
dataset['question'] = dataset['question'].astype(np.int8)

# fix for no explanation
dataset['data'] = dataset['explanation'].fillna('').astype('category')

# drop unused columns
dataset.drop(['explanation'], axis='columns', inplace=True)

# create columns
dataset['text'] = pd.Series(dtype=object)
dataset['question_id'] = pd.Series(dtype=object)


output = {}

with open(quiz_file) as jsonfile:
    quiz_session = json.load(jsonfile)[0]

    dataset_id = quiz_session['_id']['$oid']
    question_list = quiz_session['snapshot']['questions']

    output = {
        "name": os.path.basename(filepath)[:-5],
        "creation_data": datetime.now().isoformat(),
        "dataset_id": dataset_id,
        "questions": []
    }

    questions = output['questions']

    for question_nr, question_element in enumerate(question_list):
        data = question_element['contents']
        question_id = question_element['_id']['$oid']

        dataset.loc[dataset['question'] == question_nr, 'question_id'] = question_id
        dataset.loc[dataset['question_id'] == question_id, 'text'] = data
        questions.append({
            'question_id': question_id,
            'text': data[3:-3],  # skip ```
            'answers': []
        })

    dataset['text'] = dataset['text'].astype('category')
    dataset['question_id'] = dataset['question_id'].astype('category')

# drop unused columns
# drop questions not in session file
dataset = dataset.dropna(axis='rows', subset=['question_id', 'text'])


# build output
for i, row in dataset.iterrows():
    answer = {
        'answer_id': i,
        'data': row['data'],
        'isCorrect': row['isCorrect']  # not actually required but added as it might be used
    }
    output['questions'][row['question']]['answers'].append(answer)

# Write the object to file.
with open(output['name'] + '.json', 'w') as jsonFile:
    json.dump(output, jsonFile)

