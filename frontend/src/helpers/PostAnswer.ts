import {HighlightRange} from "../interfaces/HighlightRange";
import {TaggedAnswer} from "../interfaces/TaggedAnswer";


const {TAGGING_SERVICE_URL} = require('../../../config.json')

const post_answer_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'

function get_millis() {
    return new Date().getTime()
}

function post(url: string, data: any) {
    console.log('posting to ' + url)
    console.log(data)
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response: Response) => console.log(response.status));
}

export default function postAnswer(dataset_id: string,
                                   question_id: string,
                                   answer_id: string,
                                   user_id: string,
                                   data: string,
                                   startTaggingTime: number, submitted_ranges: HighlightRange[],
                                   given_tags: (string | null)[]) {
    post(post_answer_url,
        {
            dataset_id: dataset_id,
            question_id: question_id,
            answer_id: answer_id,
            user_id: user_id,
            tags: given_tags.filter(value => value != null),
            tagging_time: (get_millis() - startTaggingTime),
            highlighted_ranges: submitted_ranges,
            answer_text: data
        }
    )
}