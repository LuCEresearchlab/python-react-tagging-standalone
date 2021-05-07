import React from "react";
import {Grid} from "@material-ui/core";
import {TaggedAnswer} from "../../interfaces/TaggedAnswer";
import MisconceptionTagComparer from "./MisconceptionTagComparer";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";
import stringEquals from "../../util/StringEquals";
import {useFetch} from "../../hooks/useFetch";


const TAGGING_SERVICE_URL = process.env.TAGGING_SERVICE_URL

interface Input {
    dataset_id: string,
    question_id: string,
    user_id: string,
    available_misconceptions: MisconceptionElement[]
}

function AnswersMerger({dataset_id, question_id, user_id, available_misconceptions}: Input) {

    const {data, isLoading} = useFetch<TaggedAnswer[]>(
        `${TAGGING_SERVICE_URL}/datasets/tagged-answer/dataset/${dataset_id}/question/${question_id}`
    )


    if (isLoading) return (<Grid container>Loading...</Grid>)

    const answers: TaggedAnswer[] = data
        .filter((answer: TaggedAnswer) => answer.question_id == question_id) // only keep needed answers


    const groupedAnswers = answers
        .reduce((map: Map<string, TaggedAnswer[]>, currentValue: TaggedAnswer) => {
            if (!map.has(currentValue.answer_id)) {
                map.set(currentValue.answer_id, [currentValue])
            } else {
                const group = map.get(currentValue.answer_id)
                if (group != undefined) {
                    if (stringEquals(user_id, currentValue.user_id)) // put current user in first position
                        map.set(currentValue.answer_id, [currentValue, ...group])
                    else group.push(currentValue)
                }
            }
            return map
        }, new Map<string, TaggedAnswer[]>())


    return (
        <Grid container direction={'column'}>
            {
                Array.from(groupedAnswers.entries()).map((entry: [string, TaggedAnswer[]]) => {
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