import React, {useState} from "react";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Question, Answer} from "../interfaces/Dataset";
import {StyledTableCell, StyledTableRow, useStyles} from "./StyledTable";
import MisconceptionTagElement from "./MisconceptionTagElement";
import {JSONLoader} from "../helpers/LoaderHelper";

const {TAGGING_SERVICE_URL} = require('../../config.json')

interface MiscElem {
    name:string,
    description:string
}

interface Input {
    dataset_id: string,
    questions: Question[],
    user_id: string
}

function TaggingUI({dataset_id, questions, user_id}:Input) {
    const classes = useStyles();

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [misconceptions_available, setMisconceptionsAvailable] = useState<string[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    if(!loaded){  // load once per dataset
        JSONLoader(get_available_url, (avail_misconceptions: []) => {
            setMisconceptionsAvailable(
                avail_misconceptions.map<string>((elem:MiscElem) => elem.name)
            )
            setLoaded(true)
        })
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Question</StyledTableCell>
                        <StyledTableCell align="right">Answer</StyledTableCell>
                        <StyledTableCell align="right">Misconceptions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        questions.map((question: Question) =>
                            question.answers.map((answer: Answer) =>
                                <StyledTableRow key={dataset_id + "|" + question.question_id + "|" + answer.answer_id}>
                                    <StyledTableCell component="th" scope="row">{question.text}</StyledTableCell>
                                    <StyledTableCell align="right">{answer.data}</StyledTableCell>
                                    <StyledTableCell align="right"><MisconceptionTagElement
                                        dataset_id={dataset_id}
                                        question_id={question.question_id}
                                        answer_id={answer.answer_id}
                                        user_id={user_id}
                                        misconceptions_available={misconceptions_available}
                                    /></StyledTableCell>
                                </StyledTableRow>)
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TaggingUI
