import React from 'react';
import {Container} from "@material-ui/core";
import {useFetch} from '../../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import TaggingUI from '../../components/v2/TaggingUI'
import {Dataset} from "../../interfaces/Dataset";
import useTaggingSession, {TaggingSessionActions} from "../../model/TaggingSession";
import useTaggingClusterSession from "../../model/TaggingClusterSession";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

function TaggingPage() {

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const {data, isLoading} = useFetch<Dataset>(`${TAGGING_SERVICE_URL}/datasets/get-dataset/dataset/${dataset_id}`)

    const [taggingClusterSession, dispatchTaggingClusterSession] = useTaggingClusterSession()
    const [taggingSession, dispatchTaggingSession] =
        useTaggingSession(null, user_id, dispatchTaggingClusterSession)


    if (isLoading) return (
        <Container>
            Loading...
        </Container>
    )

    if (!isLoading && taggingSession.isLoading) {
        console.log(taggingClusterSession)
        dispatchTaggingSession({type: TaggingSessionActions.INIT, payload: data})
    }


    if (isLoading || taggingSession == undefined && taggingClusterSession.user_id == null)
        return (
            <Container>
                Loading...
            </Container>
        )

    return (
        <TaggingUI taggingSession={taggingSession}
                   dispatchTaggingSession={dispatchTaggingSession}
                   taggingClusterSession={taggingClusterSession}
                   dispatchTaggingClusterSession={dispatchTaggingClusterSession}
        />
    )
}

export default TaggingPage