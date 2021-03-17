import {HighlightRange} from "./HighlightRange";
import {Answer} from "./Dataset";

export interface taggedAnswer extends Answer {
    dataset_id: string,
    question_id: string,
    tags: string[],
    tagging_time: number,
    answer_text: string,
    highlighted_ranges: HighlightRange[]
}

export interface extendedTaggedAnswer extends taggedAnswer {
    question_text: string
}
