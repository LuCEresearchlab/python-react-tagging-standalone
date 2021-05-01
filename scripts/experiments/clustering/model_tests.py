#!/usr/bin/env python3
import json
import pathlib

import math
import numpy as np
import nltk

from semantic_text_similarity.models import WebBertSimilarity
from sklearn.cluster import SpectralClustering, AffinityPropagation, AgglomerativeClustering

from nltk.corpus import stopwords, wordnet
from nltk.tokenize import word_tokenize


def load_answers(question_nr):
    file = pathlib.Path("../../Anonymized-PS2020-Midterm-Results.json")

    with open(file, 'r') as file:
        content = file.read()
        j = json.loads(content)
        question = j['questions'][question_nr]
        return question['answers']


web_model = WebBertSimilarity(device='cpu', batch_size=32)

nltk.download('wordnet')
nltk.download('stopwords')
nltk.download('punkt')

stop_words = set(stopwords.words('english'))
lemma = nltk.wordnet.WordNetLemmatizer()
wordnet.ensure_loaded()

easy_split = False
algo = 'agglomerative'  # agglomerative | spectral | affinity


def raw(answers):
    return [answer['data'] for answer in answers]


def clean_answers_full(answers):
    cleaned_answers = []

    for answer in answers:
        word_tokens = word_tokenize(answer['data'], language='english')  # tokenize
        filtered_sentence = [w.lower() for w in word_tokens if w not in stop_words]  # remove stopwords and lowercase
        lemmatized = [lemma.lemmatize(w) for w in filtered_sentence]  # lemmatize
        cleaned_answers.append(' '.join(lemmatized))  # join back
    return cleaned_answers


def clean_answers_stopwords_lemma(answers):
    cleaned_answers = []

    for answer in answers:
        word_tokens = word_tokenize(answer['data'], language='english')  # tokenize
        filtered_sentence = [w for w in word_tokens if w not in stop_words]  # remove stopwords
        lemmatized = [lemma.lemmatize(w) for w in filtered_sentence]  # lemmatize
        cleaned_answers.append(' '.join(lemmatized))  # join back
    return cleaned_answers


def clean_answers_only_lemma(answers):
    cleaned_answers = []

    for answer in answers:
        word_tokens = word_tokenize(answer['data'], language='english')  # tokenize
        lemmatized = [lemma.lemmatize(w) for w in word_tokens]  # lemmatize
        cleaned_answers.append(' '.join(lemmatized))  # join back
    return cleaned_answers


def clean_answers_only_stopwords(answers):
    cleaned_answers = []

    for answer in answers:
        word_tokens = word_tokenize(answer['data'], language='english')  # tokenize
        filtered_sentence = [w for w in word_tokens if w not in stop_words]  # remove stopwords
        cleaned_answers.append(' '.join(filtered_sentence))  # join back
    return cleaned_answers


def clean_answers_only_lowercase(answers):
    cleaned_answers = []

    for answer in answers:
        cleaned_answers.append(' '.join(answer['data'].lower()))  # join back
    return cleaned_answers


def get_similarity_matrix(answers, clean_function):
    nr_elements = len(answers)
    sim_matrix = np.zeros((nr_elements, nr_elements))

    cleaned_answers = clean_function(answers)

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


def _cluster(answers, clean_func):
    nr_answers = len(answers)
    if nr_answers < 2:
        return answers
    nr_clusters = max(int(math.ceil(nr_answers / 10)), 2)

    sim_matrix = get_similarity_matrix(answers, clean_func)

    clustering = None

    if algo == 'spectral':
        clustering = SpectralClustering(n_clusters=nr_clusters,
                                        affinity='precomputed',
                                        random_state=0,
                                        n_init=50).fit(sim_matrix)
    elif algo == 'affinity':
        clustering = AffinityPropagation(random_state=0, affinity='precomputed').fit(sim_matrix)
    else:
        # need distance matrix, convert
        for i in range(len(answers)):
            sim_matrix[i][i] = 0  #

        maximal_value = np.max(sim_matrix)
        sim_matrix = sim_matrix / maximal_value  # normalize
        sim_matrix = 1 - sim_matrix

        for i in range(len(answers)):
            sim_matrix[i][i] = 0  #

        clustering = AgglomerativeClustering(n_clusters=nr_clusters,
                                             affinity='precomputed',
                                             linkage='complete').fit(sim_matrix)

    clusters = [[] for _ in range(np.max(clustering.labels_) + 1)]
    for idx, cluster_idx in enumerate(clustering.labels_):
        clusters[cluster_idx].append(answers[idx])
    return clusters


def cluster(answers, clean_func):
    clusters = _cluster(answers, clean_func)
    final_clusters = []
    for c in clusters:
        if len(c) <= 5:
            final_clusters.append(c)
        else:
            if easy_split:
                final_clusters.extend(cluster(c[:4], clean_func))
                final_clusters.extend(cluster(c[4:], clean_func))
            else:
                final_clusters.extend(cluster(c, clean_func))
    return final_clusters


def compute_metrics(question_idx):
    dirty_answers = load_answers(question_idx)
    clean_functions = [raw, clean_answers_only_lowercase, clean_answers_only_stopwords, clean_answers_only_lemma,
                       clean_answers_stopwords_lemma, clean_answers_full]

    computed_clusters = []

    for clean_function in clean_functions:
        computed_clusters.append(cluster(dirty_answers, clean_func=clean_function))

    for idx in range(len(clean_functions)):
        question_idx = str(question_idx)
        if len(question_idx) < 2:
            question_idx = '0' + question_idx

        with open(f"./data_{algo}/experiment_q{question_idx}_{clean_functions[idx].__name__}.json", "w") as file:
            cs = computed_clusters[idx]
            file.write('[\n')
            array_content = []
            for c in cs:
                answers_to_write = []
                for a in c:
                    answers_to_write.append('\t\t{"data": "' + a['data'].replace('"', '\'') + '", "idx": '
                                            + str(a['answer_id']) + '}')
                array_content.append('\t[\n' + ',\n'.join(answers_to_write) + '\n\t]\n')
            file.write(','.join(array_content))

            file.write(']\n')
        print(f'done with {clean_functions[idx].__name__}')


if __name__ == "__main__":
    _filepath = pathlib.Path("../../Anonymized-PS2020-Midterm-Results.json")

    nr_questions = 0

    with open(_filepath, 'r') as _file:
        j = json.loads(_file.read())
        nr_questions = len(j['questions'])

    for i in range(nr_questions):
        compute_metrics(i)
