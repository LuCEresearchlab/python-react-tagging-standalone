import React, {useState} from 'react';
import {Container} from "@material-ui/core";
import {JSONLoader} from '../../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import {Dataset} from '../../interfaces/Dataset'
import TaggingUI from '../../components/v2/TaggingUI'
import TaggingSession from "../../model/TaggingSession";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

function TaggingPage() {
    const [taggingSession, setTaggingSession] = useState<TaggingSession | undefined>(undefined)
    const [loaded, setLoaded] = useState<boolean>(false)

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const [key, setKey] = useState<number>(0)

    const url: string = TAGGING_SERVICE_URL + '/datasets/get-dataset/dataset/' + dataset_id


    if (!loaded) {
        JSONLoader(url, (data: Dataset) => {
            setTaggingSession(new TaggingSession(data, user_id, setKey))
        })
        setLoaded(true)
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