import React, {useState} from "react";
import {Grid, List, ListItem, Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import {Question, Answer} from "../interfaces/Dataset";
import {JSONLoader} from "../helpers/LoaderHelper";
import MisconceptionTagElement from "./MisconceptionTagElement";
import {StyledPagination} from "./StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";
import QuestionSelect from "./QuestionSelect";
import stringEquals from "../util/StringEquals";

const {TAGGING_SERVICE_URL} = require('../../config.json')

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

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
            justifyContent: 'center',
            position: 'sticky',
            top: '100px',
            flexGrow: 1
        },
    }),
);

function TaggingUI({dataset_id, questions, user_id}: Input) {
    const classes = useStyles()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [misconceptions_available, setMisconceptionsAvailable] = useState<MisconceptionElement[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0)
    const [page, setPage] = useState<number>(1)

    const answers_per_page: number = 10


    const current_question_id: string = questions[selectedQuestion].question_id
    const filtered_questions: Question[] = questions
        .filter(question => stringEquals(question.question_id, current_question_id))


    const total_answers = filtered_questions
        .reduce((total: number, current: Question) => {
            return total + current.clustered_answers.length
        }, 0)

    const all_answers: AnswerExtended[] = filtered_questions
        .reduce((answers: AnswerExtended[], current: Question) => {
            const flattened = current.clustered_answers.reduce(
                (accumulator: Answer[], value: Answer[]) => accumulator.concat(value), []
            )
            const extended: AnswerExtended[] = flattened.map(answer => {
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

    const selectedChange = (value: number) => {
        setSelectedQuestion(value)
        setPage(1)  // fix page selected on question change
    }

    const endIndex = (page: number) => {
        if (page * answers_per_page >= total_answers)
            return total_answers
        return page * answers_per_page
    }

    if (!loaded) {  // load once per dataset
        JSONLoader(get_available_url, (avail_misconceptions: []) => {
            setMisconceptionsAvailable(
                avail_misconceptions
            )
            setLoaded(true)
        })
    }

    return (
        <Grid container direction={'row'} className={classes.root} spacing={10}>
            <Grid item xs={6}>
                <QuestionSelect
                    questions={questions}
                    selectedQuestion={selectedQuestion}
                    setQuestionSelect={selectedChange}/>
            </Grid>
            <Grid item xs={6}>
                <List key={'list|answers|'+ selectedQuestion}>
                    {
                        all_answers
                            .slice(answers_per_page * (page - 1), endIndex(page))
                            .map((answerExtended: AnswerExtended) =>
                                <ListItem key={answerExtended.answer.answer_id + '|' + answerExtended.answer.user_id}>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="customized table">
                                            <TableBody>
                                                <MisconceptionTagElement
                                                    key={dataset_id + "|" + answerExtended.question_id + "|" + answerExtended.answer.answer_id}
                                                    dataset_id={dataset_id}
                                                    question_id={answerExtended.question_id}
                                                    user_id={user_id}
                                                    enabled={true}
                                                    answer={answerExtended.answer}
                                                    misconceptions_available={misconceptions_available}/>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </ListItem>
                            )
                    }
                </List>
                <StyledPagination
                    count={
                        Math.trunc(total_answers / answers_per_page) +
                        (total_answers % answers_per_page == 0 ? 0 : 1)
                    }
                    page={page}
                    onChange={paginationChange}
                    siblingCount={5}
                />
            </Grid>
        </Grid>

    )
}

export default TaggingUI
