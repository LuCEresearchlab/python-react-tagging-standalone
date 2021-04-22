import React, {useState} from "react"
import {
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import {Answer} from "../../../interfaces/Dataset";
import {
    DragDropContext,
    Draggable, DraggableProvided, DraggableStateSnapshot,
    Droppable,
    DroppableProvided,
    DropResult
} from "react-beautiful-dnd";
import {Button, Container, Paper, TextField} from "@material-ui/core";
import {GREY, LIGHT_GREY} from "../../../util/Colors";
import stringEquals from "../../../util/StringEquals";
import {getDatasetId, getQuestion, TaggingSession} from "../../../model/TaggingSession";
import Fuse from "fuse.js";
import {JSONLoader} from "../../../helpers/LoaderHelper";
import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {postClusters, postHelper} from "../../../helpers/PostHelper";
import {setClusters} from "../../../model/TaggingClusterSessionDispatch";

// @ts-ignore
import Highlightable from "highlightable";
import {Clear} from "@material-ui/icons";

const {TAGGING_SERVICE_URL} = require('../../../../config.json')

interface Input {
    taggingSession: TaggingSession,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,

    setCluster(value: number): void
}

// https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
function uniqueArr(arr: any[]) {
    let u: any = {}, a: any = [];
    for (let i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) { // eslint-disable-line
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

type ExtendedCluster = {
    cluster_idx: number,
    answer_idx: number,
    answer: Answer
}

type ResultCluster = {
    item: {
        answer: Answer
    },
    matches: { indices: number[][] }[]
}

type Result = {
    cluster_idx: number,
    clusters: ResultCluster[]
}

function getSortedClusters(clusters: Answer[][], query: string): Result[] {

    const extended_clusters: ExtendedCluster[] = clusters
        .map((cluster: Answer[], cluster_idx: number) =>
            cluster.map((answer: Answer, answer_idx: number) => {
                return {
                    cluster_idx,
                    answer_idx,
                    answer
                }
            })
        ).flat()


    const options: Fuse.IFuseOptions<ExtendedCluster> = {
        keys: ['answer.data'],
        shouldSort: true,
        includeMatches: true,
        findAllMatches: true,
        ignoreLocation: true,
        threshold: 0.3,
        minMatchCharLength: Math.max(2, query.length - 2)
    }

    const fuse = new Fuse<ExtendedCluster>(extended_clusters, options)

    const results = fuse.search(query)
    extended_clusters.forEach(elem => {
        if (results.findIndex(res => res.item.answer == elem.answer) == -1) // add elements that don't match
            results.push({
                item: elem,
                matches: [],
                refIndex: extended_clusters.findIndex(c => c.cluster_idx == elem.cluster_idx &&
                    c.answer_idx == elem.answer_idx)
            })
    })

    const sorted_clusters: any = [...Array(clusters.length)]

    let order: number[] = []
    results.forEach(elem => {
        order.push(elem.item.cluster_idx)
    })

    order = uniqueArr(order)
    order.forEach((value, idx) => sorted_clusters[idx] = {cluster_idx: value, clusters: []})

    results.forEach(result => {
        const pos: number = order.findIndex(cluster_n => result.item.cluster_idx == cluster_n)
        if (sorted_clusters != null && sorted_clusters[pos] != null && pos != -1)
            sorted_clusters[pos].clusters.push(result)
    })

    return sorted_clusters
}

function getClusterFromExtended(extended_clusters: Result[], idx: number): Answer[] {
    return extended_clusters[extended_clusters.findIndex(v => v.cluster_idx == idx)]
        .clusters
        .map(resultCluster => resultCluster.item.answer)
}

function getItemStyle(isDragging: boolean, draggableStyle: any) {
    return {
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: '1em',
        margin: '2em',
        display: 'inline-flex',

        // change background colour if dragging
        background: isDragging ? 'lightgreen' : LIGHT_GREY,

        // styles we need to apply on draggable
        ...draggableStyle
    }
}

function popAnswer(clusters: Answer[][], result: Result, resultCluster: ResultCluster,
                   taggingSession: TaggingSession,
                   dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>): Answer[][] {
    const cluster = clusters[result.cluster_idx]
    const answer_idx = cluster.findIndex(
        answer => stringEquals(answer.answer_id,
            resultCluster.item.answer.answer_id)
    )
    const popped: Answer[] = cluster.slice(answer_idx, answer_idx + 1)

    const reduced_cluster: Answer[] = cluster.slice(0, answer_idx).concat(cluster.slice(answer_idx + 1))
    let new_clusters = [...clusters]
    new_clusters[result.cluster_idx] = reduced_cluster
    new_clusters.push(popped)
    new_clusters = new_clusters.filter(cluster => cluster.length > 0) // remove empty clusters

    dispatchTaggingClusterSession(setClusters(new_clusters))
    postClusters(
        getDatasetId(taggingSession),
        getQuestion(taggingSession).question_id,
        taggingSession.user_id,
        new_clusters
    )
    return new_clusters
}

function handleClusterChange(
    taggingSession: TaggingSession,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    clusters: Answer[][],
    extended_clusters: Result[],
    result: DropResult): Answer[][] {
    if (result.destination == undefined) return clusters

    const new_clusters: Answer[][] = [...clusters]

    const answer_id = result.draggableId
    const source_cluster = parseInt(result.source.droppableId)
    const source_index = result.source.index

    const target_cluster = parseInt(result.destination?.droppableId)
    const target_idx = result.destination?.index

    // reorder source cluster to match order in extended
    new_clusters[source_cluster] = getClusterFromExtended(extended_clusters, source_cluster)

    const answer: Answer = new_clusters[source_cluster][source_index]

    new_clusters[source_cluster] = new_clusters[source_cluster].filter(elem =>
        !stringEquals(answer_id, elem.answer_id))

    // reorder target cluster to match order in extended
    new_clusters[target_cluster] = getClusterFromExtended(extended_clusters, target_cluster)

    // update tags of moved answer to target cluster ones
    if (new_clusters[target_cluster].length > 0) {

        const get_url = (my_answer_id: string) => TAGGING_SERVICE_URL +
            '/datasets/tagged-answer/dataset/' + taggingClusterSession.dataset_id +
            '/question/' + taggingClusterSession.question_id +
            '/answer/' + my_answer_id +
            '/user/' + taggingClusterSession.user_id


        JSONLoader(get_url(new_clusters[target_cluster][0].answer_id), (tagged_answers: TaggedAnswer[]) => {
            if (tagged_answers.length == 0) {
                return;
            } else {
                const tagged_answer = tagged_answers[0]
                postHelper(
                    taggingClusterSession.dataset_id,
                    taggingClusterSession.question_id,
                    answer.answer_id,
                    taggingClusterSession.user_id,
                    answer.data,
                    -1,
                    [],
                    tagged_answer.tags
                )
            }

        })
    }
    // update target cluster
    new_clusters[target_cluster].splice(target_idx, 0, answer)
    const clean_new_clusters = new_clusters.filter(cluster => cluster.length > 0)

    dispatchTaggingClusterSession(
        setClusters(clean_new_clusters) // remove empty clusters
    )
    postClusters(
        getDatasetId(taggingSession),
        getQuestion(taggingSession).question_id,
        taggingSession.user_id,
        clean_new_clusters
    )
    return clean_new_clusters
}

function ClusterHandler({taggingSession, taggingClusterSession, dispatchTaggingClusterSession, setCluster}: Input) {

    const clusters: Answer[][] = taggingClusterSession.clusters

    const [state, setState] = useState<{ extendedClusters: Result[], query: string }>({
        extendedClusters: getSortedClusters(clusters, ""),
        query: ""
    })

    const extendedClusters = state.extendedClusters

    return (
        <Container>
            <div style={{marginLeft: '2em'}}>
                <TextField id={'search_filter'} type={'text'} value={state.query} onChange={
                    (e) => {
                        e.preventDefault()
                        setState({
                                extendedClusters: getSortedClusters(clusters, e.target.value),
                                query: e.target.value
                            }
                        )
                    }
                } label={"Search"}/>
                <Button style={{height: 48, width: 48}} onClick={(e) => {
                    e.preventDefault()
                    setState({
                            extendedClusters: getSortedClusters(clusters, ""),
                            query: ""
                        }
                    )
                }
                }>
                    <Clear/>
                </Button>
            </div>

            <DragDropContext onDragEnd={(result: DropResult) => {
                const new_clusters = handleClusterChange(
                    taggingSession,
                    taggingClusterSession,
                    dispatchTaggingClusterSession,
                    clusters,
                    extendedClusters,
                    result
                )
                setState({
                        ...state,
                        extendedClusters: getSortedClusters(new_clusters, state.query),
                    }
                )
            }}>
                {
                    extendedClusters.map((result: Result) =>
                        <Droppable
                            key={`droppable|${result.cluster_idx}`}
                            droppableId={'' + result.cluster_idx}
                        >
                            {
                                (provided: DroppableProvided) => (
                                    <Paper
                                        style={{
                                            backgroundColor: GREY, padding: '2em', margin: '2em', display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        <Button
                                            variant={'outlined'}
                                            title={`Switch to cluster ${result.cluster_idx + 1}`}
                                            onClick={() => setCluster(result.cluster_idx + 1)}
                                            style={{margin: '2em', marginTop: 0}}
                                        >
                                            Switch to
                                        </Button>
                                        {
                                            result.clusters.map((resultCluster: ResultCluster, idx: number) =>
                                                <Draggable
                                                    key={resultCluster.item.answer.answer_id}
                                                    draggableId={'' + resultCluster.item.answer.answer_id}
                                                    index={idx}
                                                >
                                                    {(provided1: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                        <Paper
                                                            ref={provided1.innerRef}
                                                            {...provided1.draggableProps}
                                                            {...provided1.dragHandleProps}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided1.draggableProps.style
                                                            )}
                                                        >
                                                            {
                                                                resultCluster.matches.length != 0 ?
                                                                    <Highlightable
                                                                        ranges={resultCluster.matches[0].indices.map(
                                                                            interval => {
                                                                                return {
                                                                                    start: interval[0],
                                                                                    end: interval[1],
                                                                                }
                                                                            })}
                                                                        enabled={false}
                                                                        text={resultCluster.item.answer.data}
                                                                        highlightStyle={{backgroundColor: '#EE000044'}}
                                                                        style={{width: '95%'}}
                                                                    /> :
                                                                    <div style={{width: '95%'}}>
                                                                        {resultCluster.item.answer.data}
                                                                    </div>
                                                            }
                                                            <Button style={{height: 48, width: 48, justifySelf: 'end'}}
                                                                    onClick={() => {
                                                                        const new_clusters = popAnswer(
                                                                            clusters,
                                                                            result,
                                                                            resultCluster,
                                                                            taggingSession,
                                                                            dispatchTaggingClusterSession
                                                                        )
                                                                        setState({
                                                                                ...state,
                                                                                extendedClusters:
                                                                                    getSortedClusters(
                                                                                        new_clusters,
                                                                                        state.query
                                                                                    ),
                                                                            }
                                                                        )
                                                                    }}>
                                                                <Clear/>
                                                            </Button>
                                                        </Paper>
                                                    )}
                                                </Draggable>
                                            )
                                        }
                                        {provided.placeholder}
                                    </Paper>
                                )
                            }
                        </Droppable>
                    )
                }
            </DragDropContext>
        </Container>
    )
}

export default ClusterHandler