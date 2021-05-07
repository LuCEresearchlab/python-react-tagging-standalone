import React, {useState} from "react"
import {
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import {Answer, Cluster} from "../../../interfaces/Dataset";
import {
    DragDropContext,
    Droppable,
    DroppableProvided,
    DropResult
} from "react-beautiful-dnd";
import {Button, Container, TextField} from "@material-ui/core";
import stringEquals from "../../../util/StringEquals";
import {getDatasetId, getQuestion, TaggingSession} from "../../../model/TaggingSession";
import Fuse from "fuse.js";
import {JSONLoader} from "../../../helpers/LoaderHelper";
import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {postClusters, postHelper} from "../../../helpers/PostHelper";
import {setClusters} from "../../../model/TaggingClusterSessionDispatch";
import {Clear, Search} from "@material-ui/icons";
import DroppableCluster from "./DroppableCluster";

const TAGGING_SERVICE_URL = process.env.TAGGING_SERVICE_URL

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

export type ExtendedCluster = {
    cluster_idx: number,
    answer_idx: number,
    answer: Answer
}

export type ResultCluster = {
    item: {
        answer: Answer
    },
    matches: { indices: number[][] }[]
}

export type Result = {
    cluster_idx: number,
    name: string,
    clusters: ResultCluster[]
}

function getSortedClusters(clusters: Cluster[], query: string): Result[] {

    const extended_clusters: ExtendedCluster[] = clusters
        .map((cluster: Cluster, cluster_idx: number) =>
            cluster.answers.map((answer: Answer, answer_idx: number) => {
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
    order.forEach((value, idx) => sorted_clusters[idx] = {
        cluster_idx: value, clusters: [],
        name: clusters[value].name
    })

    results.forEach(result => {
        const pos: number = order.findIndex(cluster_n => result.item.cluster_idx == cluster_n)
        if (sorted_clusters != null && sorted_clusters[pos] != null && pos != -1)
            sorted_clusters[pos].clusters.push(result)
    })

    return sorted_clusters
}

function getClusterFromExtended(extended_clusters: Result[], idx: number): Cluster {
    const r: Result = extended_clusters[extended_clusters.findIndex(v => v.cluster_idx == idx)]
    return {name: r.name, answers: r.clusters.map(resultCluster => resultCluster.item.answer)}
}


function handleClusterChange(
    taggingSession: TaggingSession,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    clusters: Cluster[],
    extended_clusters: Result[],
    result: DropResult): Cluster[] {
    if (result.destination == undefined) return clusters

    const new_clusters: Cluster[] = [...clusters]

    const answer_id = result.draggableId
    const source_cluster = parseInt(result.source.droppableId)
    const source_index = result.source.index

    const target_cluster = parseInt(result.destination?.droppableId)
    const target_idx = result.destination?.index

    // reorder source cluster to match order in extended
    new_clusters[source_cluster] = getClusterFromExtended(extended_clusters, source_cluster)

    const answer: Answer = new_clusters[source_cluster].answers[source_index]

    new_clusters[source_cluster].answers = new_clusters[source_cluster].answers.filter(elem =>
        !stringEquals(answer_id, elem.answer_id))

    // reorder target cluster to match order in extended
    new_clusters[target_cluster] = getClusterFromExtended(extended_clusters, target_cluster)

    // update tags of moved answer to target cluster ones
    if (new_clusters[target_cluster].answers.length > 0) {

        const get_url = (my_answer_id: string) => TAGGING_SERVICE_URL +
            '/datasets/tagged-answer/dataset/' + taggingClusterSession.dataset_id +
            '/question/' + taggingClusterSession.question_id +
            '/answer/' + my_answer_id +
            '/user/' + taggingClusterSession.user_id


        JSONLoader(get_url(new_clusters[target_cluster].answers[0].answer_id), (tagged_answers: TaggedAnswer[]) => {
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
    new_clusters[target_cluster].answers.splice(target_idx, 0, answer)
    const clean_new_clusters: Cluster[] = new_clusters.filter(cluster => cluster.answers.length > 0)

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

    const clusters: Cluster[] = taggingClusterSession.clusters

    const [query, setQuery] = useState<string>('')
    const [extendedClusters, setExtendedClusters] = useState<Result[]>(
        getSortedClusters(clusters, "")
    )

    return (
        <Container>
            <div style={{marginLeft: '2em'}}>
                <TextField id={'search_filter'} type={'text'} value={query} label={"Search"}
                           onChange={(e) => setQuery(e.target.value)}
                           onKeyDown={(e) => {
                               if (e.key == 'Enter') setExtendedClusters(getSortedClusters(clusters, query))
                           }}
                />
                <Button onClick={() => setExtendedClusters(getSortedClusters(clusters, query))}>
                    <Search/>
                </Button>
                <Button onClick={(e) => {
                    e.preventDefault()
                    setQuery("")
                    setExtendedClusters(getSortedClusters(clusters, ""))
                }}>
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
                setExtendedClusters(getSortedClusters(new_clusters, query))
            }}>
                {
                    extendedClusters.map((result: Result) =>
                        <Droppable
                            key={`droppable|${result.cluster_idx}`}
                            droppableId={'' + result.cluster_idx}
                        >
                            {
                                (provided: DroppableProvided) => (
                                    <DroppableCluster
                                        taggingSession={taggingSession}
                                        dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                        clusters={clusters}
                                        query={query}
                                        provided={provided}
                                        result={result}
                                        extendedClusters={extendedClusters}
                                        setCluster={setCluster}
                                        setExtendedClusters={setExtendedClusters}
                                        getSortedClusters={getSortedClusters}
                                    />
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