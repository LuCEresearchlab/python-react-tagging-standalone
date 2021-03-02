import React, {useState} from "react"
import {JSONLoader} from "../helpers/LoaderHelper";

const {TAGGING_SERVICE_URL} = require('../../config.json')

interface ids {
    dataset_id: string,
    question_id: string,
    answer_id: string,
    user_id: string | undefined
}

function MisconceptionTagElement({dataset_id, question_id, answer_id, user_id}: ids) {
    const get_available_url = TAGGING_SERVICE_URL + '/progmiscon_api/misconceptions'
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/' + dataset_id + '/' + question_id + '/' + answer_id + '/' + user_id

    const [misconceptions_available, setMisconceptionsAvailable] = useState([])
    const [tags, setTags] = useState([])
    const [loaded, setLoaded] = useState([false, false])

    if (!loaded[0]) {
        JSONLoader(get_available_url, (avail_misconceptions: []) => {
            setMisconceptionsAvailable(avail_misconceptions)
            setLoaded([true, loaded[1]])
            console.log("loaded available misconceptions")
            console.log(misconceptions_available)
        })
    }
    if (!loaded[1]) {
        JSONLoader(get_selected_misc_url, (prev_tagged_misconceptions: []) => {
            setTags(prev_tagged_misconceptions)
            setLoaded([loaded[0], true])
            console.log("loaded current tags")
            console.log(tags)
        })
    }

    return (
        <p>misconceptions</p>
    )
}

export default MisconceptionTagElement