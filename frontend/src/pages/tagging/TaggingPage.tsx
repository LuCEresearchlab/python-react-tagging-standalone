import React from 'react';
import {Container} from "@material-ui/core";
import {useFetch} from '../../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import TaggingUI from '../../components/v2/TaggingUI'
import {Dataset} from "../../interfaces/Dataset";
import useTaggingSession, {TaggingSessionActions} from "../../model/TaggingSession";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

function TaggingPage() {

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const {data, isLoading} = useFetch<Dataset>(`${TAGGING_SERVICE_URL}/datasets/get-dataset/dataset/${dataset_id}`)
    const taggingSession = useTaggingSession(null, user_id)


    if (isLoading) return (
        <Container>
            Loading...
        </Container>
    )

    if (!isLoading && taggingSession.state.isLoading)
        taggingSession.dispatch({type: TaggingSessionActions.INIT, payload: data})


    if (taggingSession != undefined) {
        return (
            <TaggingUI taggingSession={taggingSession}/>
        )
    } else {
        return (
            <Container>
                Loading...
            </Container>
        )
    }
}

export default TaggingPage