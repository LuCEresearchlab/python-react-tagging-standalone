import React from "react"
import parseString from "../helpers/ParseString";

interface Input {
    question_text: string
}

// const re = /!\[(\d+px)\]\(([^\)]+)\)/.compile() // returns (size, src)

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