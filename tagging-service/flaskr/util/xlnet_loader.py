from embedding_as_service.text.encode import Encoder
from sklearn.metrics.pairwise import cosine_similarity


# https://github.com/amansrivastava17/embedding-as-service#-supported-embeddings-and-models
# https://pypi.org/project/embedding-as-service/

# TODO: change python version, tensorflow only works with 3.8 -> 3.6.13


def get_sorted_answers(answers):
    a = [answer['data'] for answer in answers]

    en = Encoder(embedding='xlnet', model='xlnet_large_cased', max_seq_length=256)
    vectors = en.encode(texts=a, pooling='reduce_mean')

    answers = list(zip(vectors, answers))
    sorted_answers = [answers[0]]
    answers = answers[1:]

    while len(answers) > 0:
        (last_vec, last_elem) = sorted_answers[-1]
        most_similar = None
        similarity = -1
        pos = -1

        for idx, (vec, answer) in enumerate(answers):
            s = cosine_similarity([last_vec], [vec])
            if s > similarity:
                similarity = s
                most_similar = (vec, answer)
                pos = idx
        sorted_answers.append(most_similar)
        answers.pop(pos)

    return [ans for (_, ans) in sorted_answers]
