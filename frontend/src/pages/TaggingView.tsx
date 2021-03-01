import React, {useState} from 'react';
import {Container} from "@material-ui/core";
import {JSONLoader} from '../helpers/LoaderHelper';
import {useParams} from "react-router-dom";
import { Dataset } from '../interfaces/Dataset'

const { TAGGING_SERVICE_URL } = require('../../config.json')

function TaggingView(){
    const [dataset, setDataset] = useState<Dataset | undefined>(undefined)
    const [loaded, setLoaded] = useState(false)

    const { dataset_id }: {dataset_id:string} = useParams()

    const url:string = TAGGING_SERVICE_URL + '/datasets/get-dataset/' + dataset_id


    if(!loaded){
        JSONLoader(url, (data: any) => {
            console.log(data)
            setDataset(data)
        })
        setLoaded(true)
    }


    if (dataset != null) {
        return (
            <Container>
                Tagging View {dataset?.name}
            </Container>
        )
    } else {
        return (
            <Container>
                Tagging View
            </Container>
        )
    }
}

export default TaggingView