#!/usr/bin/env python3
import json
import os
import numpy as np
from sklearn.metrics import silhouette_samples

from model_tests import get_similarity_matrix, clean_answers_only_lowercase, \
    clean_answers_only_stopwords, clean_answers_only_lemma, clean_answers_full, clean_answers_stopwords_lemma, raw


def get_key(x):
    return x['idx']

algo = 'agglomerative'

def load_cluster():
    for root, directories, files in os.walk(f'data_{algo}'):
        for file in sorted(files):
            if file.startswith("experiment") and file.endswith(".json"):
                file_name = os.path.join(root, file)
                with open(file_name, 'r') as f:
                    clustering = json.loads(f.read())
                    compute_metrics(clustering, file_name)


def compute_metrics(clusters, file_name):
    is_lower_case = '_only_lowercase' in file_name
    is_stopwords = '_only_stopwords' in file_name
    is_lemma = '_only_lemma' in file_name
    is_full = '_full' in file_name
    is_raw = '_raw' in file_name
    is_stopwords_lemma = '_stopwords_lemma' in file_name

    answers = []
    for cluster in clusters:
        for answer in cluster:
            answers.append(answer)

    answers.sort(key=get_key)
    min_idx = np.min([a['idx'] for a in answers])  # adjust with min index to shift to [0, len-1]

    clean_func = None
    if is_lower_case:
        clean_func = clean_answers_only_lowercase
    elif is_stopwords:
        clean_func = clean_answers_only_stopwords
    elif is_lemma:
        clean_func = clean_answers_only_lemma
    elif is_full:
        clean_func = clean_answers_full
    elif is_raw:
        clean_func = raw
    elif is_stopwords_lemma:
        clean_func = clean_answers_stopwords_lemma
    else:
        exit(1)

    similarity_matrix = get_similarity_matrix(answers=answers, clean_function=clean_func)

    def set_diagonal_0():
        for i in range(len(answers)):
            similarity_matrix[i][i] = 0  #

    set_diagonal_0()
    maximal_value = np.max(similarity_matrix)
    similarity_matrix = similarity_matrix / maximal_value  # normalize
    similarity_matrix = 1 - similarity_matrix
    set_diagonal_0()

    # some questions have missing elements due to lack of explanation
    labels = [-1 for _ in range(33)]
    for cluster_idx, cluster in enumerate(clusters):
        for answer in cluster:
            labels[answer['idx'] - min_idx] = cluster_idx

    labels = list(filter(lambda x: x != -1, labels))

    distance_matrix = similarity_matrix  # normalized and inverted

    silhouette_score = silhouette_samples(distance_matrix, labels=labels, metric='precomputed')

    print(file_name)
    print(clusters)
    print('silhouette scores')
    print(silhouette_score)
    print(f'max: {np.max(silhouette_score)} arg: {np.argmax(silhouette_score)}')
    print(f'mean: {np.mean(silhouette_score)}')
    print(f'min: {np.min(silhouette_score)} arg: {np.argmin(silhouette_score)}')
    print(f'std: {np.std(silhouette_score)}')
    print('\n')


load_cluster()
