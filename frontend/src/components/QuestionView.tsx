import React from "react"
import parseString from "../helpers/ParseString";

interface Input {
    question_text: string
}


function QuestionView({question_text}: Input) {

    return (
        <>
            {
                parseString(question_text).map(e => e)
            }
        </>
    )

}

export default QuestionView