import React, {useState} from "react"
import {Answer} from "../../../interfaces/Dataset";
import {StyledTableCell} from "../../styled/StyledTable";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange} from "../../../interfaces/HighlightRange";
import {Button} from "@material-ui/core";

import {isNoMisconception} from "../../../helpers/Util";

// @ts-ignore
import Highlightable from "highlightable";
import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {JSONLoader} from "../../../helpers/LoaderHelper";
import TaggingClusterSession from "../../../model/TaggingClusterSession";

const {TAGGING_SERVICE_URL} = require('../../../../config.json')

interface Input {
    cluster: Answer[],
    taggingClusterSession: TaggingClusterSession,
    my_key: number
}

function ClusterView({cluster, taggingClusterSession, my_key}: Input) {

    console.log("cluster", cluster)

    return (
        <div>
            {
                cluster.map((answer: Answer) =>
                    <ClusterItem
                        key={"ClusterItem|Answer|" + answer.answer_id + my_key}
                        answer={answer}
                        taggingClusterSession={taggingClusterSession}
                    />
                )}
        </div>
    )
}

interface ClusterItemInput {
    answer: Answer,
    taggingClusterSession: TaggingClusterSession
}

function ClusterItem({answer, taggingClusterSession}: ClusterItemInput) {


    const get_selected_misc_url = TAGGING_SERVICE_URL +
        '/datasets/tagged-answer/dataset/' + taggingClusterSession.dataset_id +
        '/question/' + taggingClusterSession.question_id +
        '/answer/' + answer.answer_id +
        '/user/' + taggingClusterSession.user_id

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


                const loaded_ranges = previousTaggedAnswer.highlighted_ranges == null ?
                    [] :
                    previousTaggedAnswer.highlighted_ranges

                taggingClusterSession.setTagsAndRangesNoRender(previous_tags, answer, loaded_ranges)
            } else {  // has never been tagged
                taggingClusterSession.setTagsAndRangesNoRender([null], answer, [])
            }
            setLoaded(true)
        })
    }

    const ranges: HighlightRange[] = taggingClusterSession.getRanges(answer)

    return (
        <StyledTableCell component="th" scope="row">
            <Highlightable
                ranges={ranges}
                enabled={true}
                onTextHighlighted={(e: any) => {
                    console.log("highlighted")
                    if (taggingClusterSession.isUsingDefaultColor()) return

                    const newRange = {
                        start: e.start,
                        end: e.end,
                        text: answer.data,
                        color: taggingClusterSession.currentColor
                    }
                    const r = rangesCompressor(ranges, newRange)

                    taggingClusterSession.setRanges(answer, [...r])
                    taggingClusterSession.post()
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
                taggingClusterSession.setRanges(answer, [])
                taggingClusterSession.post()
            }}>Clear
            </Button>
        </StyledTableCell>
    )
}

export default ClusterView