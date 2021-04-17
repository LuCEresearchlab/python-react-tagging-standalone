import React from "react"
import {TaggingClusterSession, TaggingClusterSessionDispatch} from "../../../model/TaggingClusterSession";
import {Answer} from "../../../interfaces/Dataset";
import {
    DragDropContext,
    Draggable, DraggableProvided, DraggableStateSnapshot,
    Droppable,
    DroppableProvided,
    DropResult
} from "react-beautiful-dnd";
import {Paper} from "@material-ui/core";
import {GREY, LIGHT_GREY} from "../../../util/Colors";
import stringEquals from "../../../util/StringEquals";
import {setClusters} from "../../../model/TaggingClusterSessionDispatch";
import {postClusters} from "../../../helpers/PostHelper";
import {getDatasetId, getQuestion, TaggingSession} from "../../../model/TaggingSession";


interface Input {
    taggingSession: TaggingSession,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}

function ClusterHandler({taggingSession, taggingClusterSession, dispatchTaggingClusterSession}: Input) {

    const clusters: Answer[][] = taggingClusterSession.clusters

    const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        padding: '1em',
        margin: '2em',

        // change background colour if dragging
        background: isDragging ? 'lightgreen' : LIGHT_GREY,

        // styles we need to apply on draggables
        ...draggableStyle
    });

    const handleClusterChange = (result: DropResult) => {
        if (result.destination == undefined) return

        const new_clusters: Answer[][] = [...clusters]

        const answer_id = result.draggableId
        const source_cluster = parseInt(result.source.droppableId)
        const source_index = result.source.index

        const target_cluster = parseInt(result.destination?.droppableId)
        const target_idx = result.destination?.index

        const answer: Answer = new_clusters[source_cluster][source_index]

        new_clusters[source_cluster] = new_clusters[source_cluster].filter(elem =>
            !stringEquals(answer_id, elem.answer_id))

        new_clusters[target_cluster].splice(target_idx, 0, answer)

        dispatchTaggingClusterSession(setClusters(new_clusters))
        postClusters(
            getDatasetId(taggingSession),
            getQuestion(taggingSession).question_id,
            taggingSession.user_id,
            new_clusters
        )
    }

    return (
        <DragDropContext onDragEnd={handleClusterChange}>
            {
                clusters.map((cluster: Answer[], index: number) =>
                    <Droppable
                        key={`droppable|${index}`}
                        droppableId={'' + index}
                    >
                        {
                            (provided: DroppableProvided) => (
                                <Paper
                                    style={{backgroundColor: GREY, padding: '2em', margin: '2em'}}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {
                                        cluster.map((answer: Answer, answer_index: number) =>
                                            <Draggable
                                                key={answer.answer_id}
                                                draggableId={'' + answer.answer_id}
                                                index={answer_index}
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
                                                        {answer.data}
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
    )
}

export default ClusterHandler