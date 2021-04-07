import React, {useState} from "react";
import {Grid, Paper} from "@material-ui/core";
import {Question} from "../../interfaces/Dataset";
import {JSONLoader} from "../../helpers/LoaderHelper";
import {StyledPagination} from "../styled/StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";
import QuestionSelect from "../question_component/QuestionSelect";
import TaggingSession from "../../model/TaggingSession";
import TagView from "./tagger_component/TagView";
import ClusterView from "./tagger_component/ClusterView";

import {LIGHT_GREY} from "../../util/Colors"

const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    my_key: number,
    taggingSession: TaggingSession
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

function TaggingUI({taggingSession, my_key}: Input) {
    const classes = useStyles()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [misconceptions_available, setMisconceptionsAvailable] = useState<MisconceptionElement[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)


    const current_question: Question = taggingSession.getQuestion()
    const total_clusters = current_question.clustered_answers.length

    const paginationChange = (event: any, value: number) => {
        taggingSession.setCurrentCluster(value - 1)
        setPage(value);
    };

    const selectedChange = (value: number) => {
        taggingSession.setCurrentQuestion(value)
        setPage(1)  // fix page selected on question change
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
            <Grid item xs={4}>
                <QuestionSelect
                    key={"QuestionSelect|" + my_key}
                    questions={taggingSession.questions}
                    selectedQuestion={taggingSession.currentQuestion}
                    setQuestionSelect={selectedChange}/>
            </Grid>
            <Grid item xs={8}>
                <Grid container direction={'row'} className={classes.taggingMiscBlock} spacing={2} component={Paper}
                      style={{backgroundColor: LIGHT_GREY}}>
                    <Grid item xs={6}>
                        <ClusterView
                            key={"ClusterView|" + my_key}
                            cluster={taggingSession.getCluster()}
                            taggingClusterSession={taggingSession.getTaggingClusterSession()}
                            my_key={my_key}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TagView
                            key={"TagView|" + my_key}
                            misconceptionsAvailable={misconceptions_available}
                            taggingClusterSession={taggingSession.getTaggingClusterSession()}
                            my_key={my_key}
                        />
                    </Grid>
                    <StyledPagination
                        key={"StyledPagination|" + my_key}
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