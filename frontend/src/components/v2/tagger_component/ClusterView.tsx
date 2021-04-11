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
import {TaggingClusterSessionWithMethods} from "../../../model/TaggingClusterSession";
import KeyIndication from "./KeyIndication";
import {clusterSessionPost, setRanges, setTagsAndRanges} from "../../../model/TaggingClusterSessionDispatch";
import {GettersTaggingSession} from "../../../model/TaggingSession";

const {TAGGING_SERVICE_URL} = require('../../../../config.json')

interface Input {
    taggingClusterSession: TaggingClusterSessionWithMethods,
    getters: GettersTaggingSession
}

function ClusterView({taggingClusterSession, getters}: Input) {

    return (
        <div>
            {
                getters.getCluster().map((answer: Answer, index: number) =>
                    <ClusterItem
                        key={"ClusterItem|Answer|" + answer.answer_id}
                        answer={answer}
                        taggingClusterSessionWithMethods={taggingClusterSession}
                        getters={getters}
                        displayKey={index + 1}
                    />
                )}
        </div>
    )
}

interface ClusterItemInput {
    answer: Answer,
    taggingClusterSessionWithMethods: TaggingClusterSessionWithMethods,
    getters: GettersTaggingSession,
    displayKey: number
}

function ClusterItem({answer, taggingClusterSessionWithMethods, getters, displayKey}: ClusterItemInput) {

    const taggingClusterSession = taggingClusterSessionWithMethods.clusterSession
    const dispatch = taggingClusterSessionWithMethods.clusterSessionDispatch


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

            dispatch(setTagsAndRanges(previous_tags, answer, loaded_ranges))
        } else {  // has never been tagged
            dispatch(setRanges(answer, []))
        }
    }, [isLoading, data])

    const ranges: HighlightRange[] = getters.getRanges(answer)

    const problem = displayKey == undefined || ranges == undefined || answer == undefined || answer.data == undefined

    const onTextHighlighted = (e: any) => {
        if (getters.isUsingDefaultColor()) return

        const newRange = {
            start: e.start,
            end: e.end,
            text: answer.data,
            color: taggingClusterSession.currentColor
        }
        const r = rangesCompressor(ranges, newRange)

        dispatch(setRanges(answer, [...r]))
        dispatch(clusterSessionPost())
    }

    const highlightStyle = (range: HighlightRange) => {
        return {
            backgroundColor: range.color + "C8",
        }
    }

    const clear = () => {
        dispatch(setRanges(answer, []))
        dispatch(clusterSessionPost())
    }

    if (problem) {
        console.log("problem")
    }

    if (isLoading) return <div>Loading...</div>


    return (
        <Paper style={{padding: '1em', backgroundColor: GREY, display: 'flex', flexDirection: 'row'}}>
            <KeyIndication displayKey={"" + displayKey}/>
            <Highlightable
                ranges={ranges}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                text={answer.data}
                highlightStyle={highlightStyle}
            />
            <Button onClick={clear}>Clear
            </Button>
        </Paper>
    )
}

export default ClusterView