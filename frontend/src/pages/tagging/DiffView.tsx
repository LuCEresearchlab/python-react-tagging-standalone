import React, {useState} from "react";
import {useParams} from "react-router-dom";
import {Container, Grid} from "@material-ui/core";
import {Dataset, Question} from "../../interfaces/Dataset";
import {JSONLoader} from "../../helpers/LoaderHelper";
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

    const [questions, setQuestions] = useState<Question[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0)
    const [misconceptionsAvailable, setMisconceptionsAvailable] = useState<MisconceptionElement[]>([])
    const [loaded, setLoaded] = useState<boolean[]>([false, false])


    const url = TAGGING_SERVICE_URL + '/datasets/get-dataset/dataset/' + dataset_id
    const misconceptions_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    if (!loaded[0]) {
        JSONLoader(url, (data: Dataset) => {
            setQuestions(data.questions)
            setSelectedQuestion(0)
            setLoaded([true, loaded[1]])
        })
    }

    if(!loaded[1]){
        JSONLoader(misconceptions_url, (data: MisconceptionElement[]) => {
            setMisconceptionsAvailable(data)
            setLoaded([loaded[0], true])
        })
    }

    if (!(loaded[0] && loaded[1]))
        return (
            <Container>
                Loading...
            </Container>
        )
    else
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