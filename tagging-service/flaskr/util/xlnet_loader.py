import json
import pathlib

import math
import numpy as np

from semantic_text_similarity.models import WebBertSimilarity
from sklearn.cluster import SpectralClustering


# TODO: change python version, tensorflow only works with 3.8 -> 3.6.13

# def load_answers():
#     file = pathlib.Path("/home/god/IdeaProjects/python-react-tagging-standalone/tagging-service/datasets/Anonymized-PS2020-Midterm-Results.json")
#
#     with open(file, 'r') as file:
#         content = file.read()
#         j = json.loads(content)
#         for question in j['questions']:
#             answers = question['answers']
#             return answers
#         return j

web_model = WebBertSimilarity(device='cpu', batch_size=10)


def get_similarity_matrix(answers):
    nr_elements = len(answers)
    sim_matrix = np.zeros((nr_elements, nr_elements))

    for i, elem1 in enumerate(answers):
        for j, elem2 in enumerate(answers):
            if j >= i:  # only compute half
                sim_matrix[i][j] = web_model.predict([(elem1['data'], elem2['data'])])

    # fill in bottom left side
    for i in range(1, nr_elements):
        for j in range(nr_elements):
            if j < i:
                sim_matrix[i][j] = sim_matrix[j][i]

    return sim_matrix


def _sort_answers_by_sim(answers, sim_matrix):
    r = list(range(len(answers)))
    answers = list(zip(r, answers))

    sorted_answers = [answers[0]]
    answers = answers[1:]

    while len(answers) > 0:
        last_answer = sorted_answers[-1][0]
        most_similar = None
        similarity = -1
        pos = -1

        for idx, (answer_idx, answer) in enumerate(answers):
            s = sim_matrix[last_answer][answer_idx]
            if s > similarity:
                similarity = s
                most_similar = (answer_idx, answer)
                pos = idx
        sorted_answers.append(most_similar)
        answers.pop(pos)

    return [a for (idx, a) in sorted_answers]


def _cluster(answers):
    nr_answers = len(answers)
    nr_clusters = max(int(math.ceil(nr_answers / 10)), 2)

    sim_matrix = get_similarity_matrix(answers)
    max_value = sim_matrix.max()
    norm_matrix = 1 - (sim_matrix / max_value)

    clustering = SpectralClustering(n_clusters=nr_clusters,
                                    affinity='precomputed',
                                    random_state=0,
                                    n_init=50).fit(norm_matrix)

    clusters = [[] for _ in range(nr_clusters)]
    for idx, cluster_idx in enumerate(clustering.labels_):
        clusters[cluster_idx].append(answers[idx])
    return clusters


def cluster(answers):
    clusters = _cluster(answers)
    final_clusters = []
    for c in clusters:
        if len(c) <= 5:
            final_clusters.append(c)
        else:
            final_clusters.extend(cluster(c))
    return final_clusters


def get_sorted_answers(answers):
    sim_matrix = get_similarity_matrix(answers)
    return _sort_answers_by_sim(answers, sim_matrix)

# anss = load_answers()
# all_clusters = cluster(answers=anss)
# sorted_ans = get_sorted_answers2(anss)
# print(all_clusters)

# get_sorted_answers2(anss)
