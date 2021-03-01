export interface Dataset {
    name: string,
    "creation_data": Date,
    "dataset_id": string,
    "questions": [
        {
            "question_id": string,
            "text": string,
            "answers": [
                {
                    "answer_id": string,
                    "data": Date,
                    "user_id": string
                }
            ]
        }
    ]
}