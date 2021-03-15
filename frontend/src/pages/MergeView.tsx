import React, {useState} from "react";
import {useParams} from "react-router-dom";
// import {useStyles} from "../components/StyledTable";
import {Container, Grid} from "@material-ui/core";
import {Dataset, Question} from "../interfaces/Dataset";
import {JSONLoader} from "../helpers/LoaderHelper";
import QuestionSelect from "../components/QuestionSelect";
import AnswersMerger from "../components/AnswersMerger";


const { TAGGING_SERVICE_URL } = require('../../config.json')

function MergeView() {

    // const classes = useStyles();

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const [questions, setQuestions] = useState<Question[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0)
    const [loaded, setLoaded] = useState<boolean>(false)


    const url = TAGGING_SERVICE_URL + '/datasets/get-dataset/' + dataset_id

    if (!loaded) {
        JSONLoader(url, (data: Dataset) => {
            console.log(data)
            setQuestions(data.questions)
            setSelectedQuestion(0)
            setLoaded(true)
        })
    }

    if (!loaded)
        return (
            <Container>
                Loading...
            </Container>
        )
    else
        return (
            <Container>
                <Grid container direction={'row'}>
                    <Grid item xs={6}>
                        <QuestionSelect
                            questions={questions}
                            selectedQuestion={selectedQuestion}
                            setQuestionSelect={(value:number) => setSelectedQuestion(value)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <AnswersMerger
                            dataset_id={dataset_id}
                            question_id={questions[selectedQuestion].question_id}
                            user_id={user_id}
                        />
                    </Grid>
                </Grid>

            </Container>
        )
}

export default MergeView