# import json
# import pathlib

import math
import numpy as np
import nltk

from semantic_text_similarity.models import WebBertSimilarity
from sklearn.cluster import AgglomerativeClustering

from nltk.corpus import stopwords, wordnet
from nltk.tokenize import word_tokenize

# def load_answers():
#     file = pathlib.Path(
#         "/home/god/IdeaProjects/python-react-tagging-standalone/tagging-service/datasets/Anonymized-PS2020-Midterm-Results.json")
#
#     with open(file, 'r') as file:
#         content = file.read()
#         j = json.loads(content)
#         for question in j['questions']:
#             answers = question['answers']
#             return answers
#         return j


web_model = WebBertSimilarity(device='cpu', batch_size=32)

nltk.download('wordnet')
nltk.download('stopwords')
nltk.download('punkt')

stop_words = set(stopwords.words('english'))
lemma = nltk.wordnet.WordNetLemmatizer()
wordnet.ensure_loaded()


def clean_answers(answers):
    cleaned_answers = []

    for answer in answers:
        word_tokens = word_tokenize(answer['data'], language='english')  # tokenize
        filtered_sentence = [w.lower() for w in word_tokens if w not in stop_words]  # remove stopwords and lowercase
        lemmatized = [lemma.lemmatize(w) for w in filtered_sentence]  # lemmatize
        cleaned_answers.append(' '.join(lemmatized))  # join back
    return cleaned_answers


def get_similarity_matrix(answers):
    nr_elements = len(answers)
    sim_matrix = np.zeros((nr_elements, nr_elements))

    cleaned_answers = clean_answers(answers)

    for i, elem1 in enumerate(cleaned_answers):
        for j, elem2 in enumerate(cleaned_answers):
            if j >= i:  # only compute half
                sim_matrix[i][j] = web_model.predict([(elem1, elem2)])

    # fill in bottom left side
    for i in range(1, nr_elements):
        for j in range(nr_elements):
            if j < i:
                sim_matrix[i][j] = sim_matrix[j][i]

    return sim_matrix


def get_distance_matrix(answers):
    sim_matrix = get_similarity_matrix(answers=answers)
    for i in range(len(answers)):
        sim_matrix[i][i] = 0  #

    maximal_value = np.max(sim_matrix)
    sim_matrix = sim_matrix / maximal_value  # normalize
    sim_matrix = 1 - sim_matrix

    for i in range(len(answers)):
        sim_matrix[i][i] = 0
    return sim_matrix


def _opt_cluster(answers, dist_matrix):
    nr_answers = len(answers)
    nr_clusters = max(int(math.ceil(nr_answers / 10)), 2)
    clustering = AgglomerativeClustering(n_clusters=nr_clusters,
                                         affinity='precomputed',
                                         linkage='complete').fit(dist_matrix)

    clusters = [[] for _ in range(nr_clusters)]
    for idx, cluster_idx in enumerate(clustering.labels_):
        clusters[cluster_idx].append(answers[idx])
    return clusters


def opt_cluster(all_answers, answers, dist_matrix):
    clusters = _opt_cluster(answers=answers,
                            dist_matrix=opt_dist_matrix(
                                all_answers=all_answers,
                                answers=answers,
                                dist_matrix=dist_matrix)
                            )
    final_clusters = []
    for c in clusters:
        if len(c) <= 5:
            final_clusters.append(c)
        else:
            final_clusters.extend(opt_cluster(all_answers=all_answers, answers=c, dist_matrix=dist_matrix))
    return final_clusters


def opt_dist_matrix(all_answers, answers, dist_matrix):
    indexes_to_take = []
    for index in range(len(all_answers)):
        if all_answers[index] in answers:
            indexes_to_take.append(index)

    new_dist_matrix = []
    for index in indexes_to_take:
        elements = []
        for idx in indexes_to_take:
            elements.append(dist_matrix[index][idx])
        new_dist_matrix.append(elements)
    return new_dist_matrix


def cluster(answers):
    # extract empty answers
    empty_answers, not_empty_answers = [], []
    for a in answers:
        if not a['data']:  # empty string
            empty_answers.append(a)
        else:
            not_empty_answers.append(a)

    dist_matrix = get_distance_matrix(not_empty_answers)

    computed_clusters = opt_cluster(all_answers=not_empty_answers, answers=not_empty_answers, dist_matrix=dist_matrix)

    if not empty_answers:  # no empty answer exists
        return computed_clusters

    computed_clusters.append(empty_answers)  # add values
    return computed_clusters

# anss = load_answers()
# all_clusters = cluster(answers=anss)
# print(all_clusters)
