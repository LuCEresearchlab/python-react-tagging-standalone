import React, {useState} from "react";
import {Grid} from "@material-ui/core";
import {JSONLoader} from "../helpers/LoaderHelper";
import {taggedAnswer} from "../interfaces/TaggedAnswer";


const { TAGGING_SERVICE_URL } = require('../../config.json')

interface Input {
    dataset_id: string,
    question_id: string,
    user_id: string,
    selectedQuestion: number
}

function AnswersMerger({dataset_id, user_id, selectedQuestion}: Input){

    const url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/' + dataset_id

    const [answers, setAnswers] = useState<taggedAnswer[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    if(!loaded){
        JSONLoader(url, (data: taggedAnswer[]) => {
            setAnswers(data)
            setLoaded(true)
        })
    }

    console.log(user_id, selectedQuestion)



    if(!loaded) return (<Grid container>Loading...</Grid>)

    return(
        <Grid container direction={'column'}>
            {
                answers.map(answer =>
                    <Grid item key={answer.answer_id + '|' + answer.user_id}>{answer.answer_text}</Grid>
                )
            }
        </Grid>
    )
}

export default AnswersMerger