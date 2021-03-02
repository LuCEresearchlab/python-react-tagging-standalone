import React from "react";
import {Container} from "@material-ui/core";
import {Answer, Question} from "../interfaces/Dataset";

function TaggingElement({question_id, text}:Question,{answer_id, data, user_id}:Answer, dataset_id:string){

    return(
        <Container key={dataset_id + "|" + question_id + "|" + answer_id }>
            {
                "dataset_id " + dataset_id + "\n" +
                "question_id " + question_id + "\n" +
                "answer_id " + answer_id + "\n" +
                "text " + text + "\n" +
                "answer " + data + "\n" +
                "user_id " + user_id+ "\n"
            }
        </Container>)
}

export default TaggingElement