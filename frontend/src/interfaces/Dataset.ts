export interface Dataset {
    "name": string,
    "creation_data": string,
    "dataset_id": string,
    "questions": [Question]
}

export interface DatasetDesc {
    "name": string,
    "creation_data": string,
    "dataset_id": string,
    "nr_questions": number,
    "clusters_computed": number
}

export interface Question {
    "question_id": string,
    "text": string
}

export interface Answer {
    "answer_id": string,
    "data": string,
    "user_id": string,
    "picked": boolean,
    "matches_expected": boolean
}
