# import json
# import pathlib

import math
import numpy as np
import nltk

from semantic_text_similarity.models import WebBertSimilarity
from sklearn.cluster import SpectralClustering

from nltk.corpus import stopwords
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

    clustering = SpectralClustering(n_clusters=nr_clusters,
                                    affinity='precomputed',
                                    random_state=0,
                                    n_init=50).fit(sim_matrix)

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
# print(all_clusters)
# sorted_ans = get_sorted_answers(anss)
# print(all_clusters)

# get_sorted_answers2(anss)
