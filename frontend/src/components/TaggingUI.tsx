import React from "react";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Dataset, Question, Answer} from "../interfaces/Dataset";
import {StyledTableCell, StyledTableRow, useStyles} from "./StyledTable";
import MisconceptionTagElement from "./MisconceptionTagElement";

function TaggingUI({dataset_id, questions,}: Dataset) {
    const classes = useStyles();

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
                                        user_id={answer.user_id}/></StyledTableCell>
                                </StyledTableRow>)
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TaggingUI
