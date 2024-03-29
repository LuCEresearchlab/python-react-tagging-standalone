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

cols = ['question', 'option', 'isCorrect', 'explanation', 'Mark']

dataset = pd.read_excel(filepath, usecols=cols)
# drop invalid columns
dataset = dataset.dropna(axis='rows', subset=['question', 'explanation'])

# remove comma
dataset['question'] = dataset['question'].astype(np.int8)
dataset['option'] = dataset['option'].astype(np.int8)

# reduce size
dataset['isCorrect'] = dataset['isCorrect'].astype(np.bool)
dataset['Mark'] = dataset['Mark'].astype(np.bool)

dataset.rename(columns={'explanation': 'data'}, inplace=True)

# create columns
dataset['text'] = pd.Series(dtype=object)
dataset['question_id'] = pd.Series(dtype=object)
dataset['question_option_index'] = pd.Series(dtype=object)

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

    question_option_counter = 0

    for question_nr, question_element in enumerate(question_list):
        question_text = question_element['contents']
        for option_nr, option in enumerate(question_element['options']):
            # append option text to the one from the question
            extended_question = question_text + '\nOption:\n' + option['contents']
            option_id = option['_id']['$oid']

            dataset.loc[(dataset['question'] == question_nr) &
                        (dataset['option'] == option_nr), 'question_id'] = option_id
            dataset.loc[dataset['question_id'] == option_id, 'text'] = extended_question
            questions.append({
                'question_id': option_id,
                'text': extended_question,
                'answers': []
            })
            dataset.loc[dataset['question_id'] == option_id, 'question_option_index'] = question_option_counter
            question_option_counter += 1

    dataset['text'] = dataset['text'].astype('category')
    dataset['question_id'] = dataset['question_id'].astype('category')

# drop unused columns
dataset.drop(['option'], axis='columns', inplace=True)
# drop questions not in session file
dataset = dataset.dropna(axis='rows', subset=['question_id', 'text'])

# build output
for i, row in dataset.iterrows():
    answer = {
        'answer_id': i,
        'data': row['data'],
        'picked': row['isCorrect'],
        'matches_expected': row['Mark']
    }
    output['questions'][row['question_option_index']]['answers'].append(answer)

# Write the object to file.
with open(output['name'] + '.json', 'w') as jsonFile:
    json.dump(output, jsonFile)
