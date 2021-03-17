import React from "react";
import {Grid} from "@material-ui/core";
import {useFetch} from "../helpers/LoaderHelper";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import MisconceptionTagComparer from "./MisconceptionTagComparer";


const {TAGGING_SERVICE_URL} = require('../../config.json')

interface Input {
    dataset_id: string,
    question_id: string,
    user_id: string,
    selectedQuestion: number
}

function AnswersMerger({dataset_id, question_id, user_id, selectedQuestion}: Input) {

    const url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + '/question/' + question_id

    const response = useFetch<taggedAnswer[]>(url)

    console.log(user_id, selectedQuestion)


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

    console.log(groupedAnswers)

    return (
        <Grid container direction={'column'}>
            {
                Array.from(groupedAnswers.entries()).map((entry) => {
                        const answer_id = entry[0]
                        const answer_group = entry[1]
                        return <Grid item key={answer_id}><MisconceptionTagComparer
                            answerGroup={answer_group}
                            user_id={user_id}
                        /></Grid>
                    }
                )
            }
        </Grid>
    )
}

export default AnswersMerger