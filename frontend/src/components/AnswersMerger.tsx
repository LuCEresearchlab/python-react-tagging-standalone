import React from "react";
import {Grid} from "@material-ui/core";

interface Input {
    dataset_id: string,
    question_id: string,
    user_id: string
}

function AnswersMerger({dataset_id, question_id, user_id}: Input){
    return(
        <Grid container>
            Answers Merger for {user_id} in dataset {dataset_id} and question {question_id}
        </Grid>
    )
}

export default AnswersMerger