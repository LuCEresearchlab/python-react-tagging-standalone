import React from "react";
import {Grid} from "@material-ui/core";
import {useFetch} from "../../helpers/LoaderHelper";
import {taggedAnswer} from "../../interfaces/TaggedAnswer";
import MisconceptionTagComparer from "./MisconceptionTagComparer";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";


const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    dataset_id: string,
    question_id: string,
    user_id: string,
    available_misconceptions: MisconceptionElement[]
}

function AnswersMerger({dataset_id, question_id, user_id, available_misconceptions}: Input) {

    const url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + '/question/' + question_id

    const response = useFetch<taggedAnswer[]>(url)


    if (response.isLoading) return (<Grid container>Loading...</Grid>)

    const answers: taggedAnswer[] = response.response == undefined ? [] : response.response
        .filter(answer => answer.question_id == question_id) // only keep needed answers

    const groupedAnswers = answers
        .reduce((map: Map<string, taggedAnswer[]>, currentValue: taggedAnswer) => {
            if (!map.has(currentValue.answer_id)) {
                map.set(currentValue.answer_id, [currentValue])
            } else {
                // @ts-ignore
                map.get(currentValue.answer_id).push(currentValue)
            }
            return map
        }, new Map<string, taggedAnswer[]>())


    return (
        <Grid container direction={'column'}>
            {
                Array.from(groupedAnswers.entries()).map((entry: [string, taggedAnswer[]]) => {
                        const answer_id = entry[0]
                        const answer_group = entry[1]
                        return <Grid item key={answer_id}><MisconceptionTagComparer
                            answerGroup={answer_group}
                            user_id={user_id}
                            available_misconceptions={available_misconceptions}
                        /></Grid>
                    }
                )
            }
        </Grid>
    )
}

export default AnswersMerger