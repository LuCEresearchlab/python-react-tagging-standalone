import React, {useState} from "react";
import {useParams} from "react-router-dom";
import {Container, Grid} from "@material-ui/core";
import {Dataset} from "../../interfaces/Dataset";
import {useFetch} from "../../helpers/LoaderHelper";
import QuestionSelect from "../../components/question_component/QuestionSelect";
import AnswersMerger from "../../components/diff_component/AnswersMerger";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";


const {TAGGING_SERVICE_URL} = require('../../../config.json')


const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '90%',
            textAlign: 'center',
            marginLeft: 'auto',
            marginRight: 'auto'
        },
    }),
);

function DiffView() {

    const classes = useStyles();

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const [selectedQuestion, setSelectedQuestion] = useState<number>(0)

    const response_dataset = useFetch<Dataset>(
        `${TAGGING_SERVICE_URL}/datasets/get-dataset/dataset/${dataset_id}`
    )
    const response_available_misconceptions = useFetch<MisconceptionElement[]>(
        `${TAGGING_SERVICE_URL}/progmiscon_api/misconceptions`
    )

    if (response_dataset.isLoading || response_available_misconceptions.isLoading)
        return (
            <Container>
                Loading...
            </Container>
        )

    const questions = response_dataset.data.questions
    const misconceptionsAvailable = response_available_misconceptions.data

    return (
        <Grid container direction={'row'} className={classes.root} spacing={10}>
            <Grid item xs={6}>
                <QuestionSelect
                    questions={questions}
                    selectedQuestion={selectedQuestion}
                    setQuestionSelect={(value: number) => setSelectedQuestion(value)}/>
            </Grid>
            <Grid item xs={6}>
                <AnswersMerger
                    dataset_id={dataset_id}
                    question_id={questions[selectedQuestion].question_id}
                    user_id={user_id}
                    available_misconceptions={misconceptionsAvailable}
                />
            </Grid>
        </Grid>
    )
}

export default DiffView