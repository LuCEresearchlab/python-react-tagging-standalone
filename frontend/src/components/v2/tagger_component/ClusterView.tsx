import React, {useState} from "react"
import {Answer} from "../../../interfaces/Dataset";
import {StyledTableCell, StyledTableRow} from "../../styled/StyledTable";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange} from "../../../interfaces/HighlightRange";
import {Button} from "@material-ui/core";

import postAnswer from "../../../helpers/PostAnswer"
import {isNoMisconception, isUsingDefaultColor, getMillis} from "../../../helpers/Util";

// @ts-ignore
import Highlightable from "highlightable";
import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {JSONLoader} from "../../../helpers/LoaderHelper";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    cluster: Answer[],
    dataset_id: string,
    question_id: string,
    user_id: string,
    currentColor: string,
}

function ClusterView({cluster, dataset_id, question_id, user_id, currentColor}: Input) {

    console.log("cluster", cluster)

    return (
        cluster.map(answer =>
            <ClusterItem
                answer={answer}
                dataset_id={dataset_id}
                question_id={question_id}
                user_id={user_id}
                currentColor={currentColor}
            />
        )
    )
}

interface ClusterItemInput {
    answer: Answer,
    dataset_id: string,
    question_id: string,
    user_id: string,
    currentColor: string
}

function ClusterItem({answer, dataset_id, question_id, user_id, currentColor}: ClusterItemInput) {
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + '/question/'
        + question_id + '/answer/' + answer.answer_id + '/user/' + user_id

    const [tags, setTags] = useState<(string | null)[]>([])
    const [ranges, setRanges] = useState<HighlightRange[]>([])
    const [startTaggingTime] = useState<number>(getMillis())

    const [loaded, setLoaded] = useState<boolean>(false)

    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_answers: TaggedAnswer[]) => {
            // has existing value
            if (prev_tagged_answers.length > 0) {
                const previousTaggedAnswer: TaggedAnswer = prev_tagged_answers[0]
                const previous_tags = previousTaggedAnswer.tags == null || previousTaggedAnswer.tags.length == 0 ?
                    [null] :
                    isNoMisconception(previousTaggedAnswer.tags[0]) ?
                        previousTaggedAnswer.tags :
                        [...previousTaggedAnswer.tags, null]  // append null to allow inserting


                setTags(previous_tags)
                setRanges(previousTaggedAnswer.highlighted_ranges == null ? [] : previousTaggedAnswer.highlighted_ranges)
            } else {  // has never been tagged
                setTags([null])
                setRanges([])
            }
            setLoaded(true)
        })
    }

    const answer_id: string = answer.answer_id
    const data: string = answer.data


    return (
        <StyledTableCell component="th" scope="row">
            <Highlightable
                ranges={ranges}
                onTextHighlighted={(e: any) => {
                    if (isUsingDefaultColor(currentColor)) return

                    const newRange = {start: e.start, end: e.end, text: answer.data, color: currentColor}
                    const r = rangesCompressor(ranges, newRange)

                    setRanges([...r])
                    postAnswer(
                        dataset_id,
                        question_id,
                        answer_id,
                        user_id,
                        data,
                        startTaggingTime,
                        r,
                        tags
                    )
                }}
                text={answer.data}
                highlightStyle={(range: HighlightRange) => {
                    return {
                        backgroundColor: range.color + "C8",
                    }
                }
                }
            />
            <Button onClick={() => {
                setRanges([])
                postAnswer(
                    dataset_id,
                    question_id,
                    answer_id,
                    user_id,
                    data,
                    startTaggingTime,
                    [],
                    tags
                )
            }}>Clear
            </Button>
        </StyledTableCell>
    )
}

export default ClusterView