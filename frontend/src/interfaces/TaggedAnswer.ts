import {HighlightRange} from "./HighlightRange";
import {Answer} from "./Dataset";

export interface TaggedAnswer extends Answer {
    dataset_id: string,
    question_id: string,
    tags: string[],
    tagging_time: number,
    answer_text: string,
    highlighted_ranges: HighlightRange[]
}

export interface ExtendedTaggedAnswer extends TaggedAnswer {
    question_text: string
}
