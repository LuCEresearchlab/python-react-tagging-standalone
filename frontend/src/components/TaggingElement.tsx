import React from "react";
import {Answer, Question} from "../interfaces/Dataset";
import {StyledTableCell, StyledTableRow} from "./StyledTable";

const {TAGGING_SERVICE_URL} = require('../../config.json')



function TaggingElement({question_id, text}:Question,{answer_id, data, user_id}:Answer, dataset_id:string){

    const get_url = TAGGING_SERVICE_URL + '/datasets/' + dataset_id + '/' + question_id + '/' + answer_id + '/' + user_id
    const post_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'

    const misconceptions = 'misc'

    console.log("dataset_id " + dataset_id + "\n" +
        "question_id " + question_id + "\n" +
        "answer_id " + answer_id + "\n" +
        "text " + text + "\n" +
        "answer " + data + "\n" +
        "user_id " + user_id+ "\n")
    console.log('get_url')
    console.log(get_url)
    console.log('post_url')
    console.log(post_url)


    return(
        <StyledTableRow key={dataset_id + "|" + question_id + "|" + answer_id } onClick={() => console.log(text)}>
            <StyledTableCell component="th" scope="row">{text}</StyledTableCell>
            <StyledTableCell align="right">{data}</StyledTableCell>
            <StyledTableCell align="right">{misconceptions}</StyledTableCell>
        </StyledTableRow>)

}

export default TaggingElement