
class Answer:
    def __init__(self, content, question_type):
        self.content = content
        self.question_type = question_type


qtype = 'TEXT_QUESTION'

data = [[Answer('answer1', qtype),
         Answer('answer2', qtype),
         Answer('answer3', qtype)], [
            Answer('a4', qtype),
            Answer('a5', qtype)]]


def load_data():
    return data
