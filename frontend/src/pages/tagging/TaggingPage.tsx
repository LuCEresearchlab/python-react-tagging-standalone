import React, {useState} from 'react';
import {Container} from "@material-ui/core";
import {JSONLoader} from '../../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import {Dataset} from '../../interfaces/Dataset'
import TaggingUI from '../../components/v2/TaggingUI'

const {TAGGING_SERVICE_URL} = require('../../../config.json')

function TaggingPage() {
    const [dataset, setDataset] = useState<Dataset | undefined>(undefined)
    const [loaded, setLoaded] = useState<boolean>(false)

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const url: string = TAGGING_SERVICE_URL + '/datasets/get-dataset/dataset/' + dataset_id


    if (!loaded) {
        JSONLoader(url, (data: Dataset) => {
            setDataset(data)
        })
        setLoaded(true)
    }


    if (dataset != null) {
        return (
            <TaggingUI
                questions={dataset.questions}
                dataset_id={dataset_id}
                user_id={user_id}/>
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