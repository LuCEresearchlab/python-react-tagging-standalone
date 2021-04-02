import React, {useEffect, useState} from "react"
import {Answer} from "../../../interfaces/Dataset";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange} from "../../../interfaces/HighlightRange";
import {Button, Paper} from "@material-ui/core";

import {isNoMisconception} from "../../../helpers/Util";
import {GREY} from "../../../util/Colors"

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

    useEffect(() => {
        let isMounted = true; // note this flag denote mount status
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

                taggingClusterSession.setTagsAndRanges(previous_tags, answer, loaded_ranges)
            } else {  // has never been tagged
                taggingClusterSession.setTagsAndRanges([null], answer, [])
            }
        })
        if (isMounted) {
            setLoaded(true)
        }
        return () => {
            isMounted = false
        } // use effect cleanup to set flag false, if unmounted
    });

    const ranges: HighlightRange[] = taggingClusterSession.getRanges(answer)

    if (!loaded) return <div>Loading...</div>

    return (
        <Paper style={{padding: '1em', backgroundColor: GREY}}>
            <Highlightable
                ranges={ranges}
                enabled={true}
                onTextHighlighted={(e: any) => {
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
        </Paper>
    )
}

export default ClusterView