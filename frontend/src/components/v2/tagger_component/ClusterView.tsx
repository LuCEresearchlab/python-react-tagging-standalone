import React, {useEffect} from "react"
import {Answer, Cluster} from "../../../interfaces/Dataset";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange, HighlightRangeColor} from "../../../interfaces/HighlightRange";
import {Button, Paper} from "@material-ui/core";
import {GREY} from "../../../util/Colors"

// @ts-ignore
import Highlightable from "highlightable";

import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {
    getCurrentCluster, getCurrentMisconception,
    getRanges, isUsingDefaultColor,
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import KeyIndication from "./KeyIndication";
import {clusterSessionPost, setRanges, setTagsAndRanges} from "../../../model/TaggingClusterSessionDispatch";
import TruthCircle from "../../tagger_component/TruthCircle";
import {FormatColorReset} from "@material-ui/icons";
import {highlightStyle, nthIndex} from "../../../helpers/Util";
import {useFetch} from "../../../hooks/useFetch";
import withKeyboard from "../../../hooks/withKeyboard";

const {TAGGING_SERVICE_URL} = require('../../../../config.json')

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}

const regExp = new RegExp(/^[1-9]h[1-9](:?-[1-9]\d*)?$/)

function ClusterView({taggingClusterSession, dispatchTaggingClusterSession}: Input) {

    const currentCluster: Cluster = getCurrentCluster(taggingClusterSession)

    return (
        <div>
            {
                currentCluster
                    .answers
                    .map((answer: Answer, index: number) =>
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

    const ranges: HighlightRangeColor[] = getRanges(taggingClusterSession, answer)

    const onTextHighlighted = (e: any) => {
        if (isUsingDefaultColor(taggingClusterSession)) return
        const misconception = getCurrentMisconception(taggingClusterSession)
        if (misconception == null) return

        const newRange: HighlightRangeColor = {
            start: e.start,
            end: e.end,
            misconception: misconception,
            color: taggingClusterSession.currentColor
        }


        const r = rangesCompressor(ranges, newRange)

        dispatchTaggingClusterSession(setRanges(answer, [...r]))
        dispatchTaggingClusterSession(clusterSessionPost())
    }

    const clear = () => {
        dispatchTaggingClusterSession(setRanges(answer, []))
        dispatchTaggingClusterSession(clusterSessionPost())
    }


    withKeyboard((command: string) => {
        if (command.startsWith("" + displayKey) && regExp.test(command)) {
            if (command.indexOf('-') == -1) {
                const from: number = parseInt(command.slice(2)) - 1

                if (isNaN(from)) return

                let relative_start = nthIndex(answer.data, ' ', from)
                relative_start = relative_start == -1 ? 0 : relative_start

                let relative_end = nthIndex(answer.data, ' ', from + 1)
                relative_end = relative_end == -1 ? answer.data.length : relative_end - 1

                onTextHighlighted({
                    start: relative_start,
                    end: relative_end
                })
            } else {
                const split_index: number = command.indexOf('-')
                const from: number = parseInt(command.slice(2, split_index)) - 1
                const to: number = parseInt(command.slice(split_index + 1))

                if (isNaN(from) || isNaN(to)) return

                let relative_start = nthIndex(answer.data, ' ', from)
                relative_start = relative_start == -1 ? 0 : relative_start

                let relative_end = nthIndex(answer.data, ' ', to)
                relative_end = relative_end == -1 ? answer.data.length : relative_end - 1

                onTextHighlighted({
                    start: relative_start,
                    end: relative_end
                })
            }
        }
        if (command == "" + displayKey + 'rc') {
            clear()
        }
    })

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
                highlightStyle={(range: HighlightRange) =>
                    highlightStyle(range, taggingClusterSession.availableMisconceptions)
                }
                style={{padding: 'inherit'}}
            />
            <Button style={{marginLeft: 'auto'}} onClick={clear} title={'Clear highlighting'}>
                <FormatColorReset/>
            </Button>

        </Paper>
    )
}

export default ClusterView