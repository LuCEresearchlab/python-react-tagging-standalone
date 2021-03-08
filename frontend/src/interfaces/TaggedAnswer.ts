
export interface taggedAnswer {
    dataset_id: string,
    question_id: string,
    answer_id: string,
    user_id: string,
    tags: string[],
    tagging_time: number
}

export interface extendedTaggedAnswer extends taggedAnswer {
    question_text: string,
    answer_text: string
}
