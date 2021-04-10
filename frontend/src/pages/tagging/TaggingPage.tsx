import React, {useState} from 'react';
import {Container} from "@material-ui/core";
import {useFetch} from '../../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import TaggingUI from '../../components/v2/TaggingUI'
import TaggingSession from "../../model/TaggingSession";
import {Dataset} from "../../interfaces/Dataset";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

function TaggingPage() {
    const [taggingSession, setTaggingSession] = useState<TaggingSession | undefined>(undefined)

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const [key, setKey] = useState<number>(0)

    const {data, isLoading} = useFetch<Dataset>(`${TAGGING_SERVICE_URL}/datasets/get-dataset/dataset/${dataset_id}`)


    if (!isLoading) {
        setTaggingSession(new TaggingSession(data, user_id, setKey))
    }


    if (taggingSession != undefined) {
        return (
            <TaggingUI my_key={key} taggingSession={taggingSession}/>
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