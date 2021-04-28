import {GREY} from "../../../util/Colors";
import {Button, Card, CardContent, Collapse, TextField} from "@material-ui/core";
import {ExpandLess, ExpandMore, ZoomIn} from "@material-ui/icons";
import {DroppableProvided} from "react-beautiful-dnd";
import React, {useEffect, useState} from "react";
import {Result, ResultCluster} from "./ClusterHandler";

import {Cluster} from "../../../interfaces/Dataset";
import {getDatasetId, getQuestion, TaggingSession} from "../../../model/TaggingSession";
import {TaggingClusterSessionDispatch} from "../../../model/TaggingClusterSession";
import {setClusters} from "../../../model/TaggingClusterSessionDispatch";
import {postClusters} from "../../../helpers/PostHelper";
import DraggableCluster from "./DraggableCluster";


interface Input {
    taggingSession: TaggingSession,
    provided: DroppableProvided,
    clusters: Cluster[],
    result: Result,
    query: string,
    extendedClusters: Result[],

    setCluster(value: number): void,

    setExtendedClusters(value: Result[]): void,

    getSortedClusters(clusters: Cluster[], query: string): Result[],

    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}


function shouldCollapse(query: string, result: Result): boolean {
    console.log('shouldNotCollapse')
    console.log(query, query.length == 0)
    for (let c of result.clusters) {
        if (c.matches.length != 0) return false
    }
    return query.length != 0
}

function DroppableCluster({
                              taggingSession,
                              dispatchTaggingClusterSession,
                              clusters,
                              query,
                              provided,
                              extendedClusters,
                              result,
                              setCluster,
                              setExtendedClusters,
                              getSortedClusters
                          }: Input) {

    const [collapse, setCollapse] = useState<boolean>(false)

    useEffect(() => {
        setCollapse(shouldCollapse(query, result))
    }, [extendedClusters])

    const flipCollapse = () => {
        setCollapse(!collapse)
    }

    return (
        <Card
            style={{
                backgroundColor: GREY, marginTop: '2.5em', display: 'flex',
                flexDirection: 'column'
            }}
            {...provided.droppableProps}
            ref={provided.innerRef}
        >
            <CardContent style={{
                paddingLeft: '0.5em', paddingRight: '0.5em', paddingBottom: '1em', display: 'flex',
                flexDirection: 'row'
            }}>
                <TextField style={{margin: 'auto', marginLeft: '2em'}} value={result.name}
                           onChange={(e) => {
                               clusters[result.cluster_idx].name = e.target.value
                               postClusters(
                                   getDatasetId(taggingSession),
                                   getQuestion(taggingSession).question_id,
                                   taggingSession.user_id,
                                   [...clusters]
                               )
                               dispatchTaggingClusterSession(setClusters([...clusters]))
                               setExtendedClusters(getSortedClusters([...clusters], query))
                           }}/>
                <Button
                    variant={'outlined'}
                    title={`Switch to cluster ${result.cluster_idx + 1}`}
                    onClick={() => setCluster(result.cluster_idx + 1)}
                >
                    <ZoomIn/>
                </Button>
                <Button>
                    {
                        collapse ?
                            <ExpandMore onClick={() => flipCollapse()}/> :
                            <ExpandLess onClick={() => flipCollapse()}/>
                    }
                </Button>
            </CardContent>
            <Collapse in={!collapse} timeout={0}>
                <CardContent style={{display: 'flex', flexDirection: 'column'}}>
                    {
                        result.clusters.map((resultCluster: ResultCluster, idx: number) =>
                            <DraggableCluster
                                key={'ClusterHandler|DraggableCluster|' + idx}
                                taggingSession={taggingSession}
                                clusters={clusters}
                                result={result}
                                resultCluster={resultCluster}
                                idx={idx}
                                query={query}
                                getSortedClusters={getSortedClusters}
                                setExtendedClusters={setExtendedClusters}
                                dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                            />
                        )
                    }
                    {provided.placeholder}
                </CardContent>
            </Collapse>
        </Card>
    )
}

export default DroppableCluster