import React from "react";
import {Grid, Select} from "@material-ui/core";
import {Question} from "../interfaces/Dataset";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import QuestionView from "./QuestionView";

interface SetQuestionSelectFunction {
    setQuestionSelect(value: number): void,

    selectedQuestion: number,
    questions: Question[]
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            justifyContent: 'center',
            position: 'sticky',
            top: '100px',
            flexGrow: 1
        },
        paper: {
            padding: theme.spacing(2),
            position: 'sticky',
            textAlign: 'left',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: theme.palette.text.secondary,
            border: 1,
            width: 'max-content'
        },
    }),
);

function QuestionSelect({selectedQuestion, setQuestionSelect, questions}: SetQuestionSelectFunction) {

    const classes = useStyles();


    return (
        <Grid container spacing={5} className={classes.root} direction={'column'}>
            <Grid container spacing={0} className={classes.root} direction={'row'}>
                <Grid item className={classes.paper} xs={3}>
                    <p>Select Question</p>
                </Grid>
                <Grid item className={classes.paper} xs={3}>
                    <Select
                        native
                        label={'Select Question'}
                        id={'question-select'}
                        value={selectedQuestion}
                        onChange={(event) => {
                            const newValue: number = typeof (event.target.value) == "string" ? parseInt(event.target.value) : 0
                            setQuestionSelect(newValue)
                        }}
                    >{
                        questions.map((question, index) =>
                            <option key={question.question_id} value={index}>
                                {index + 1}
                            </option>
                        )
                    }
                    </Select>
                </Grid>
            </Grid>
            <Grid item className={classes.paper} xs={11}>
                <QuestionView question_text={questions[selectedQuestion].text}/>
            </Grid>
        </Grid>
    )
}

export default QuestionSelect