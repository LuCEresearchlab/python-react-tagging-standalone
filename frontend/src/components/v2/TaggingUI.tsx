import React, {useEffect, useState} from "react";
import {Grid, Paper, Tab} from "@material-ui/core";
import {useFetch} from "../../helpers/LoaderHelper";
import {StyledPagination} from "../styled/StyledPagination";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import {MisconceptionElement} from "../../interfaces/MisconceptionElement";
import QuestionSelect from "../question_component/QuestionSelect";
import TagView from "./tagger_component/TagView";
import ClusterView from "./tagger_component/ClusterView";

import {LIGHT_GREY} from "../../util/Colors"
import {setCurrentQuestion} from "../../model/TaggingSessionDispatch";
import {
    TaggingClusterSession, TaggingClusterSessionDispatch,
} from "../../model/TaggingClusterSession";
import {TaggingSession, TaggingSessionDispatch} from "../../model/TaggingSession";
import {setAvailableMisconceptions, setClusters, setCurrentCluster} from "../../model/TaggingClusterSessionDispatch";
import ClusterHandler from "./cluster_handler_component/ClusterHandler";

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

function TaggingUI({taggingSession, dispatchTaggingSession, taggingClusterSession, dispatchTaggingClusterSession}
                       : Input) {
    const classes = useStyles()

    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'

    const [page, setPage] = useState<number>(1)
    const [tab, setTab] = useState<string>('1')


    const paginationChange = (event: any, value: number) => {
        dispatchTaggingClusterSession(setCurrentCluster(value - 1))
        setPage(value);
    };

    const selectedChange = (value: number) => {
        dispatchTaggingSession(setCurrentQuestion(value))
        setPage(1)  // fix page selected on question change
    }

    const clusterFetch = useFetch<any>(
        `${TAGGING_SERVICE_URL}/datasets/clusters/dataset/${taggingClusterSession.dataset_id
        }/question/${taggingClusterSession.question_id
        }/user/${taggingClusterSession.user_id}`)

    const clustersData = clusterFetch.data
    const isLoadingClusters = clusterFetch.isLoading


    const total_clusters = taggingClusterSession.clusters.length

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
            <Grid item xs={4}>
                <QuestionSelect
                    questions={taggingSession.questions}
                    selectedQuestion={taggingSession.currentQuestion}
                    setQuestionSelect={selectedChange}/>
            </Grid>
            <Grid item xs={8}>
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
                            <Grid item xs={6}>
                                <ClusterView
                                    taggingClusterSession={taggingClusterSession}
                                    dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                />
                            </Grid>
                            <Grid item xs={6}>
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
            </Grid>
        </Grid>
    )
}

export default TaggingUI
