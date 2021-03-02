import React from "react";
import {Container} from "@material-ui/core";
import {Dataset, Question, Answer} from "../interfaces/Dataset";
import TaggingElement from "./TaggingElement";

function TaggingUI({dataset_id, questions,}:Dataset) {
    return (
        <Container>
            {
                questions.map((question: Question) =>
                    question.answers.map((answer: Answer) =>
                        TaggingElement(question, answer, dataset_id)
                    )
                )
            }
        </Container>
    )
}

export default TaggingUI
