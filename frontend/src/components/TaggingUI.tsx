import React, {useState} from "react";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Question, Answer} from "../interfaces/Dataset";
import {StyledTableCell, useStyles} from "./StyledTable";
import {JSONLoader} from "../helpers/LoaderHelper";
import MisconceptionTagElement from "./MisconceptionTagElement";
import {StyledPagination} from "./StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";

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

interface AnswerExtended {
    answer: Answer,
    question_id: string,
    text: string
}

const useTable = makeStyles(() =>
    createStyles({
        table: {
            width: '90%',
            textAlign: 'left',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    }),
);

function TaggingUI({dataset_id, questions, user_id}:Input) {
    const classes = useStyles()
    const tableStyle= useTable()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [misconceptions_available, setMisconceptionsAvailable] = useState<string[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)

    const answers_per_page: number = 10


    const total_answers = questions.reduce((total: number, current: Question) => {
        return total + current.answers.length
    }, 0)

    const all_answers: AnswerExtended[] = questions.reduce((answers:AnswerExtended[], current: Question) => {
        const extended: AnswerExtended[] = current.answers.map(answer => {
            return {
                answer: answer,
                question_id: current.question_id,
                text: current.text
            }
        })
        return answers.concat(extended)
    }, [])


    const paginationChange = (event: any, value: number) => {
        setPage(value);
    };

    const endIndex = (page:number) => {
        if (page * answers_per_page >= total_answers)
            return total_answers
        return page* answers_per_page
    }

    if(!loaded){  // load once per dataset
        JSONLoader(get_available_url, (avail_misconceptions: []) => {
            setMisconceptionsAvailable(
                avail_misconceptions.map<string>((elem:MiscElem) => elem.name)
            )
            setLoaded(true)
        })
    }

    console.log(questions.slice(answers_per_page*(page-1), endIndex(page)))

    return (
        <TableContainer component={Paper} className={tableStyle.table}>
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
                        all_answers
                                .slice(answers_per_page*(page-1), endIndex(page))
                                .map((answerExtended: AnswerExtended) =>
                                    <MisconceptionTagElement
                                        key={dataset_id + "|" + answerExtended.question_id + "|" + answerExtended.answer.answer_id}
                                        dataset_id={dataset_id}
                                        question_id={answerExtended.question_id}
                                        user_id={user_id}
                                        enabled={true}
                                        question_text={answerExtended.text}
                                        answer={answerExtended.answer}
                                        misconceptions_available={misconceptions_available}/>
                            )
                    }
                </TableBody>
            </Table>
            <StyledPagination count={
                Math.trunc(total_answers / answers_per_page) +
                (total_answers % answers_per_page == 0 ? 0 : 1)
            } page={page} onChange={paginationChange} siblingCount={5}/>
        </TableContainer>
    )
}

export default TaggingUI
