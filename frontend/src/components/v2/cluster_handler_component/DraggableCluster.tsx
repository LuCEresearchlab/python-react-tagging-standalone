import {Draggable, DraggableProvided, DraggableStateSnapshot} from "react-beautiful-dnd";
import {Button, Paper} from "@material-ui/core";
import {Eject} from "@material-ui/icons";
import React from "react";
import {Result, ResultCluster} from "./ClusterHandler";
import {Answer, Cluster} from "../../../interfaces/Dataset";
import {getDatasetId, getQuestion, TaggingSession} from "../../../model/TaggingSession";
import {TaggingClusterSessionDispatch} from "../../../model/TaggingClusterSession";
import stringEquals from "../../../util/StringEquals";
import {setClusters} from "../../../model/TaggingClusterSessionDispatch";
import {postClusters} from "../../../helpers/PostHelper";
import {LIGHT_GREY} from "../../../util/Colors";


// @ts-ignore
import Highlightable from "highlightable";

interface Input {
    resultCluster: ResultCluster,
    idx: number,
    taggingSession: TaggingSession,
    clusters: Cluster[],
    result: Result,
    query: string,

    setExtendedClusters(value: Result[]): void,

    getSortedClusters(clusters: Cluster[], query: string): Result[],

    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>


}


function getItemStyle(isDragging: boolean, draggableStyle: any) {
    return {
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: '1em',
        margin: '1.5em',
        marginTop: 0,
        display: 'inline-flex',

        // change background colour if dragging
        background: isDragging ? 'lightgreen' : LIGHT_GREY,

        // styles we need to apply on draggable
        ...draggableStyle
    }
}

function popAnswer(clusters: Cluster[], result: Result, resultCluster: ResultCluster,
                   taggingSession: TaggingSession,
                   dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>): Cluster[] {
    const cluster: Cluster = clusters[result.cluster_idx]
    const answer_idx = cluster.cluster.findIndex(
        answer => stringEquals(answer.answer_id,
            resultCluster.item.answer.answer_id)
    )
    const popped: Answer[] = cluster.cluster.slice(answer_idx, answer_idx + 1)

    const reduced_cluster: Answer[] = cluster.cluster.slice(0, answer_idx).concat(cluster.cluster.slice(answer_idx + 1))
    let new_clusters = [...clusters]
    new_clusters[result.cluster_idx] = {name: cluster.name, cluster: reduced_cluster}
    new_clusters.push({name: 'Cluster ' + new_clusters.length, cluster: popped})
    new_clusters = new_clusters.filter(cluster => cluster.cluster.length > 0) // remove empty clusters

    dispatchTaggingClusterSession(setClusters(new_clusters))
    postClusters(
        getDatasetId(taggingSession),
        getQuestion(taggingSession).question_id,
        taggingSession.user_id,
        new_clusters
    )
    return new_clusters
}

function DraggableCluster({
                              taggingSession, resultCluster, idx, clusters, result, query, getSortedClusters,
                              setExtendedClusters, dispatchTaggingClusterSession
                          }: Input) {
    return (
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
                    <Button
                        style={{padding: 0}}
                        onClick={() => {
                            const new_clusters = popAnswer(
                                clusters,
                                result,
                                resultCluster,
                                taggingSession,
                                dispatchTaggingClusterSession
                            )
                            setExtendedClusters(getSortedClusters(
                                new_clusters,
                                query
                            ))
                        }}>
                        <Eject/>
                    </Button>
                </Paper>
            )}
        </Draggable>
    )
}

export default DraggableCluster