import React from "react";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Dataset, Question, Answer} from "../interfaces/Dataset";
import TaggingElement from "./TaggingElement";
import {StyledTableCell, useStyles} from "./StyledTable";

function TaggingUI({dataset_id, questions,}:Dataset) {
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
                            TaggingElement(question, answer, dataset_id)
                        )
                    )
                }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TaggingUI
