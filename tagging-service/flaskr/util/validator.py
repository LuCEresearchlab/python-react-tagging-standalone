def _assert_valid_schema(data):
    valid = 'name' in data
    valid &= 'creation_data' in data
    valid &= 'dataset_id' in data
    valid &= 'questions' in data
    # check questions
    if valid:
        for question in data['questions']:
            valid &= 'question_id' in question
            valid &= 'text' in question
            valid &= 'answers' in question
            if valid:
                for answer in question['answers']:
                    valid &= 'answer_id' in answer
                    valid &= 'data' in answer
    return valid
