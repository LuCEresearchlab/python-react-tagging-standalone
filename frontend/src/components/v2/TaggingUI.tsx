import React, {useState} from "react";
import {Grid, Paper} from "@material-ui/core";
import {Question} from "../../interfaces/Dataset";
import {useFetch} from "../../helpers/LoaderHelper";
import {StyledPagination} from "../styled/StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";
import QuestionSelect from "../question_component/QuestionSelect";
import {TaggingSessionWithMethods} from "../../model/TaggingSession";
import TagView from "./tagger_component/TagView";
import ClusterView from "./tagger_component/ClusterView";

import {LIGHT_GREY} from "../../util/Colors"
import {setCurrentCluster, setCurrentQuestion} from "../../model/TaggingSessionDispatch";
import {
    TaggingClusterSessionWithMethods
} from "../../model/TaggingClusterSession";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    taggingSession: TaggingSessionWithMethods
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
        taggingMiscBlock: {
            width: '100%',
            justifyContent: 'center',
            position: 'sticky',
            top: '100px',
            flexGrow: 1,
            minHeight: '500px',
            padding: '1em',
            paddingBottom: 0
        },
    }),
);

function TaggingUI({taggingSession}: Input) {
    const classes = useStyles()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [page, setPage] = useState<number>(1)


    const current_question: Question = taggingSession.getters.getQuestion()
    const total_clusters = current_question.clustered_answers.length

    const paginationChange = (event: any, value: number) => {
        taggingSession.dispatch(setCurrentCluster(value - 1))
        setPage(value);
    };

    const selectedChange = (value: number) => {
        taggingSession.dispatch(setCurrentQuestion(value))
        setPage(1)  // fix page selected on question change
    }

    const {data, isLoading} = useFetch<MisconceptionElement[]>(get_available_url)


    if (isLoading) return (<>Loading...</>)

    const taggingClusterSession: TaggingClusterSessionWithMethods = {
        clusterSession: taggingSession.clusterSession,
        clusterSessionDispatch: taggingSession.clusterSessionDispatch
    }

    return (
        <Grid container direction={'row'} className={classes.root} spacing={10}>
            <Grid item xs={4}>
                <QuestionSelect
                    questions={taggingSession.state.questions}
                    selectedQuestion={taggingSession.state.currentQuestion}
                    setQuestionSelect={selectedChange}/>
            </Grid>
            <Grid item xs={8}>
                <Grid container direction={'row'} className={classes.taggingMiscBlock} spacing={2} component={Paper}
                      style={{backgroundColor: LIGHT_GREY}}>
                    <Grid item xs={6}>
                        <ClusterView
                            taggingClusterSession={taggingClusterSession}
                            getters={taggingSession.getters}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TagView
                            misconceptionsAvailable={data}
                            taggingClusterSession={taggingClusterSession}
                            getters={taggingSession.getters}
                        />
                    </Grid>
                    <StyledPagination
                        count={total_clusters}
                        page={page}
                        onChange={paginationChange}
                        siblingCount={5}
                    />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default TaggingUI
