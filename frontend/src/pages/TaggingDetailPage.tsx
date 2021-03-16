import React, {useState} from "react"
import {extendedTaggedAnswer} from "../interfaces/TaggedAnswer";
import {useParams} from "react-router-dom";
import {JSONLoader} from "../helpers/LoaderHelper";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {StyledTableCell, StyledTableRow, useStyles} from "../components/StyledTable";

// @ts-ignore
import Highlightable from "highlightable";

const {TAGGING_SERVICE_URL} = require('../../config.json')

function TaggingDetailPage(){

    const {dataset_id, tag} : {dataset_id:string, tag: string} = useParams()

    const classes = useStyles();

    const get_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + "/tag/" + tag

    const [answers, setAnswers] = useState<extendedTaggedAnswer[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    if (!loaded) {
        JSONLoader(get_url, (data: extendedTaggedAnswer[]) => {
            setLoaded(true)
            setAnswers(data)
        })
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Question</StyledTableCell>
                        <StyledTableCell align="left">Answer</StyledTableCell>
                        <StyledTableCell align="left">Tagger</StyledTableCell>
                        <StyledTableCell align="left">Tags</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        answers
                            .sort((a: extendedTaggedAnswer, b: extendedTaggedAnswer) => a.user_id.localeCompare(b.user_id))  // sort same user
                            .map(answer =>
                                <StyledTableRow key={answer.answer_id + "|" + answer.user_id}>
                                    <StyledTableCell align={"left"}>{answer.question_text}</StyledTableCell>
                                    <StyledTableCell align={"left"}><Highlightable
                                        ranges={answer.highlighted_ranges}
                                        enabled={false}
                                        text={answer.data}
                                        highlightStyle={{
                                            backgroundColor: '#ffcc80'
                                        }}/></StyledTableCell>
                                    <StyledTableCell align={"left"}>{answer.user_id}</StyledTableCell>
                                    <StyledTableCell align={"left"}>{answer.tags.join(", ")}</StyledTableCell>
                                </StyledTableRow>
                                )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TaggingDetailPage