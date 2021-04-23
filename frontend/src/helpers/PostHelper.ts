import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";


const {TAGGING_SERVICE_URL} = require('../../config.json')

const post_answer_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'


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

export function postHelper(dataset_id: string,
                           question_id: string,
                           answer_id: string,
                           user_id: string,
                           data: string,
                           taggingTime: number,
                           submitted_ranges: HighlightRange[],
                           given_tags: (string | null)[]) {
    post(post_answer_url,
        {
            dataset_id: dataset_id,
            question_id: question_id,
            answer_id: answer_id,
            user_id: user_id,
            tags: given_tags.filter(value => value != null),
            tagging_time: taggingTime,
            highlighted_ranges: submitted_ranges,
            answer_text: data
        }
    )
}

export function postClusters(dataset_id: string,
                             question_id: string,
                             user_id: string,
                             clusters: Answer[][]) {
    post(`${TAGGING_SERVICE_URL}/clusters/dataset/${dataset_id}/question/${question_id}/user/${user_id}`,
        clusters)
}