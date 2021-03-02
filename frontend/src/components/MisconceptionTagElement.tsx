import React, {useState} from "react"
import {JSONLoader} from "../helpers/LoaderHelper";

const {TAGGING_SERVICE_URL} = require('../../config.json')

interface ids_and_misconceptions {
    dataset_id: string,
    question_id: string,
    answer_id: string,
    user_id: string | undefined,
    misconceptions_available: string[]
}

function MisconceptionTagElement({dataset_id, question_id, answer_id, user_id, misconceptions_available}: ids_and_misconceptions) {
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/' + dataset_id + '/' + question_id + '/' + answer_id + '/' + user_id

    const [tags, setTags] = useState([])
    const [loaded, setLoaded] = useState(false)


    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_misconceptions: []) => {
            setTags(prev_tagged_misconceptions)
            setLoaded(true)

            console.log(misconceptions_available)
            console.log("loaded current tags")
            console.log(tags)
        })
    }

    return (
        <p>misconceptions</p>
    )
}

export default MisconceptionTagElement