export interface Dataset {
    name: string,
    "creation_data": Date,
    "dataset_id": string,
    "questions": [Question]
}

export interface Question {
    "question_id": string,
    "text": string,
    "clustered_answers": [[Answer]]
}

export interface Answer {
    "answer_id": string,
    "data": string,
    "user_id": string
}
