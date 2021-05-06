import React, {useEffect, useState} from "react";
import {Button, Collapse, Grid, Paper, Tab} from "@material-ui/core";
import {StyledPagination} from "../styled/StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";
import QuestionSelect from "../question_component/QuestionSelect";
import TagView from "./tagger_component/TagView";
import ClusterView from "./tagger_component/ClusterView";

import {LIGHT_GREY} from "../../util/Colors"
import {nextQuestion, setCurrentQuestion} from "../../model/TaggingSessionDispatch";
import {
    TaggingClusterSession, TaggingClusterSessionDispatch,
} from "../../model/TaggingClusterSession";
import {TaggingSession, TaggingSessionDispatch} from "../../model/TaggingSession";
import {
    nextCluster,
    setAvailableMisconceptions,
    setClusters,
    setCurrentCluster
} from "../../model/TaggingClusterSessionDispatch";
import ClusterHandler from "./cluster_handler_component/ClusterHandler";
import withKeyboard from "../../hooks/withKeyboard";
import {useFetch} from "../../hooks/useFetch";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    taggingSession: TaggingSession,
    dispatchTaggingSession: React.Dispatch<TaggingSessionDispatch>,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>

}

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
            justifyContent: 'center',
            position: 'sticky',
            top: '100px',
            flexGrow: 1,
            margin: 0
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

function TaggingUI({taggingSession, dispatchTaggingSession, taggingClusterSession, dispatchTaggingClusterSession}
                       : Input) {
    const classes = useStyles()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [page, setPage] = useState<number>(1)
    const [tab, setTab] = useState<string>('1')
    const [showQuestion, setShowQuestion] = useState<boolean>(true)


    const total_clusters = taggingClusterSession.clusters.length

    const [keyHistory] = withKeyboard((command: string) => {
        if (command == '') // two spaces or enter in a row
        {
            const current_cluster = taggingClusterSession.currentCluster
            if (current_cluster + 1 < total_clusters) {
                dispatchTaggingClusterSession(nextCluster())
                setPage(page + 1)  // offset of 1
            } else {
                dispatchTaggingSession(nextQuestion())
                dispatchTaggingClusterSession(setCurrentCluster(0))
                setPage(1)
            }
        }
        if (command == 'c') setTab(tab == '1' ? '2' : '1')
        if (command == 'b') {
            const current_cluster = taggingClusterSession.currentCluster
            if (current_cluster - 1 >= 0) {
                dispatchTaggingClusterSession(setCurrentCluster(current_cluster - 1))
                setPage(page - 1)
            } else {
                const previousQuestion = taggingSession.currentQuestion == 0 ? 0 : taggingSession.currentQuestion - 1
                dispatchTaggingSession(setCurrentQuestion(previousQuestion))
                dispatchTaggingClusterSession(setCurrentCluster(0))
                setPage(1)
            }
        }
        if (command == 'q') {
            setShowQuestion(!showQuestion)
        }
    })


    const paginationChange = (event: any, value: number) => {
        dispatchTaggingClusterSession(setCurrentCluster(value - 1))
        setPage(value);
    };

    const selectedChange = (value: number) => {
        dispatchTaggingSession(setCurrentQuestion(value))
        setPage(1)  // fix page selected on question change
    }

    const clusterFetch = useFetch<any>(
        `${TAGGING_SERVICE_URL}/clusters/dataset/${taggingClusterSession.dataset_id
        }/question/${taggingClusterSession.question_id
        }/user/${taggingClusterSession.user_id}`)

    const clustersData = clusterFetch.data
    const isLoadingClusters = clusterFetch.isLoading


    useEffect(() => {
        if (!isLoadingClusters) dispatchTaggingClusterSession(setClusters(clustersData.clusters))
    }, [clustersData, isLoadingClusters])

    const {data, isLoading} = useFetch<MisconceptionElement[]>(get_available_url)

    useEffect(() => {
        if (!isLoading) dispatchTaggingClusterSession(setAvailableMisconceptions(data))
    }, [isLoading, data])

    if (isLoading || isLoadingClusters) return (<>Loading...</>)

    return (
        <Grid container direction={'row'} className={classes.root} spacing={10}>
            <Grid item xs={showQuestion ? 4 : 1}>
                <Button onClick={() => {
                    setShowQuestion(!showQuestion)
                }}>Q</Button>
                <Collapse in={showQuestion}>
                    <QuestionSelect
                        questions={taggingSession.questions}
                        selectedQuestion={taggingSession.currentQuestion}
                        setQuestionSelect={selectedChange}/>
                </Collapse>
            </Grid>
            <Grid item xs={showQuestion ? 8 : 10}>
                <TabContext value={tab}>
                    <TabList
                        indicatorColor='primary'
                        textColor='primary'
                        centered={true}
                        onChange={(_, e: string) => {
                            setTab(e)
                        }}
                    >
                        <Tab
                            label={'Tagging'}
                            value={'1'}
                        />
                        <Tab
                            label={'Clusters'}
                            value={'2'}
                        />
                    </TabList>
                    <TabPanel value={'1'}>
                        <Grid container direction={'row'} className={classes.taggingMiscBlock} spacing={2}
                              component={Paper}
                              style={{backgroundColor: LIGHT_GREY}}>
                            <Grid item xs={8}>
                                <ClusterView
                                    taggingClusterSession={taggingClusterSession}
                                    dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TagView
                                    misconceptionsAvailable={data}
                                    taggingClusterSession={taggingClusterSession}
                                    dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                />
                            </Grid>
                            <StyledPagination
                                count={total_clusters}
                                page={page}
                                onChange={paginationChange}
                                siblingCount={5}
                            />
                        </Grid>
                    </TabPanel>
                    <TabPanel value={'2'}>
                        <ClusterHandler
                            taggingSession={taggingSession}
                            taggingClusterSession={taggingClusterSession}
                            dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                            setCluster={(value: number) => {
                                setTab('1')
                                paginationChange(null, value)
                            }}
                        />
                    </TabPanel>
                </TabContext>
                <div>
                    {
                        keyHistory == '' ?
                            'space: next cluster, c: cluster view / tagging view' :
                            'command: ' + keyHistory
                    }
                </div>
            </Grid>
            <Grid item xs={showQuestion ? undefined : 1}/>
        </Grid>
    )

}

export default TaggingUI
