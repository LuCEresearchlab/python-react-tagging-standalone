import React, {useEffect} from "react"
import {Answer} from "../../../interfaces/Dataset";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange} from "../../../interfaces/HighlightRange";
import {Button, Paper} from "@material-ui/core";
import {GREY} from "../../../util/Colors"

// @ts-ignore
import Highlightable from "highlightable";

import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {useFetch} from "../../../helpers/LoaderHelper";
import {
    getCurrentCluster,
    getRanges, isUsingDefaultColor,
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import KeyIndication from "./KeyIndication";
import {clusterSessionPost, setRanges, setTagsAndRanges} from "../../../model/TaggingClusterSessionDispatch";
import TruthCircle from "../../tagger_component/TruthCircle";
import {FormatColorReset} from "@material-ui/icons";

const {TAGGING_SERVICE_URL} = require('../../../../config.json')

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}

function ClusterView({taggingClusterSession, dispatchTaggingClusterSession}: Input) {

    return (
        <div>
            {
                getCurrentCluster(taggingClusterSession).map((answer: Answer, index: number) =>
                    <ClusterItem
                        key={"ClusterItem|Answer|" + answer.answer_id}
                        answer={answer}
                        taggingClusterSession={taggingClusterSession}
                        dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                        displayKey={index + 1}
                    />
                )}
        </div>
    )
}

interface ClusterItemInput {
    answer: Answer,
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    displayKey: number
}

function ClusterItem({answer, taggingClusterSession, dispatchTaggingClusterSession, displayKey}: ClusterItemInput) {


    const get_selected_misc_url = TAGGING_SERVICE_URL +
        '/datasets/tagged-answer/dataset/' + taggingClusterSession.dataset_id +
        '/question/' + taggingClusterSession.question_id +
        '/answer/' + answer.answer_id +
        '/user/' + taggingClusterSession.user_id

    const {data, isLoading} = useFetch<TaggedAnswer[]>(get_selected_misc_url)

    useEffect(() => {
        if (isLoading) return
        if (data.length > 0) {
            const previousTaggedAnswer: TaggedAnswer = data[0]
            const previous_tags = previousTaggedAnswer.tags == null || previousTaggedAnswer.tags.length == 0 ?
                [] :
                previousTaggedAnswer.tags

            const loaded_ranges = previousTaggedAnswer.highlighted_ranges == null ?
                [] :
                previousTaggedAnswer.highlighted_ranges

            dispatchTaggingClusterSession(setTagsAndRanges(previous_tags, answer, loaded_ranges))
        } else {  // has never been tagged
            dispatchTaggingClusterSession(setRanges(answer, []))
        }
    }, [isLoading, data])

    const ranges: HighlightRange[] = getRanges(taggingClusterSession, answer)

    const onTextHighlighted = (e: any) => {
        if (isUsingDefaultColor(taggingClusterSession)) return

        const newRange = {
            start: e.start,
            end: e.end,
            text: answer.data,
            color: taggingClusterSession.currentColor
        }
        const r = rangesCompressor(ranges, newRange)

        dispatchTaggingClusterSession(setRanges(answer, [...r]))
        dispatchTaggingClusterSession(clusterSessionPost())
    }

    const highlightStyle = (range: HighlightRange) => {
        return {
            backgroundColor: range.color + "C8",
        }
    }

    const clear = () => {
        dispatchTaggingClusterSession(setRanges(answer, []))
        dispatchTaggingClusterSession(clusterSessionPost())
    }

    if (isLoading) return <div>Loading...</div>


    return (
        <Paper style={{
            padding: '1em', backgroundColor: GREY, display: 'flex', flexDirection: 'row',
            marginBottom: '2em'
        }}>
            <KeyIndication displayKey={"" + displayKey}/>
            <TruthCircle value={answer.picked}/>
            <Highlightable
                ranges={ranges}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                text={answer.data}
                highlightStyle={highlightStyle}
                style={{padding: 'inherit'}}
            />
            <Button style={{marginLeft: 'auto'}} onClick={clear}>
                <FormatColorReset/>
            </Button>

        </Paper>
    )
}

export default ClusterView