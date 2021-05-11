import React, {useEffect, useMemo, useState} from "react"
import {Answer, Cluster} from "../../../interfaces/Dataset";
import {rangesCompressor} from "../../../util/RangeCompressor";
import {HighlightRange, HighlightRangeColor} from "../../../interfaces/HighlightRange";
import {Button, Paper, TextField} from "@material-ui/core";
import {GREY, HIGHLIGHT_COLOR_ELEMENT} from "../../../util/Colors"

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
import {
    clusterSessionPost,
    setClusters,
    setRanges,
    setTagsAndRanges
} from "../../../model/TaggingClusterSessionDispatch";
import TruthCircle from "../../tagger_component/TruthCircle";
import {FormatColorReset} from "@material-ui/icons";
import {highlightStyle, nthIndex} from "../../../helpers/Util";
import {useFetch} from "../../../hooks/useFetch";
import withKeyboard from "../../../hooks/withKeyboard";
import stringEquals from "../../../util/StringEquals";
import {postClusters} from "../../../helpers/PostHelper";
import withActiveKeyboard from "../../../hooks/withActiveKeyboard";

const TAGGING_SERVICE_URL = process.env.TAGGING_SERVICE_URL

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}

const sep: string = 'h'
const regExp = new RegExp(/^[1-9]\d*h[1-9](:?-[1-9]\d*)?$/)

function ClusterView({taggingClusterSession, dispatchTaggingClusterSession}: Input) {

    const currentCluster: Cluster = getCurrentCluster(taggingClusterSession)

    return (
        <div>
            <TextField value={currentCluster.name}
                       InputProps={{disableUnderline: true}}
                       onChange={(e) => {
                           const clusters = taggingClusterSession.clusters
                           clusters[taggingClusterSession.currentCluster].name = e.target.value
                           postClusters(
                               taggingClusterSession.dataset_id,
                               taggingClusterSession.question_id,
                               taggingClusterSession.user_id,
                               [...clusters]
                           )
                           dispatchTaggingClusterSession(setClusters([...clusters]))
                       }}/>
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

    const [localCommand, setLocalCommand] = useState<string>('')
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
        if (isUsingDefaultColor(taggingClusterSession)) dispatchTaggingClusterSession(setRanges(answer, []))
        else {
            dispatchTaggingClusterSession(setRanges(answer,
                ranges.filter(range => !stringEquals(range.color, taggingClusterSession.currentColor))
            ))
        }

        dispatchTaggingClusterSession(clusterSessionPost())
    }

    const keyboardAction = useMemo(() => {
        return function (command: string) {
            if (command.startsWith("" + displayKey + sep) && regExp.test(command)) {
                if (command.indexOf('-') == -1) {
                    const from: number = parseInt(command.slice(('' + displayKey).length + 1)) - 1

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
                    const from: number = parseInt(command.slice(('' + displayKey).length + 1, split_index)) - 1
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
        }
    }, [displayKey, regExp, answer, onTextHighlighted])


    withKeyboard((command: string) => keyboardAction(command))

    const activeKeyboardAction = useMemo(() => {
        return function (command: string) {
            setLocalCommand(command)
        }
    }, [displayKey, answer])

    withActiveKeyboard(command => activeKeyboardAction(command))

    if (isLoading) return <div>Loading...</div>


    return (
        <Paper style={{
            padding: '0.5em', backgroundColor: GREY, display: 'flex', flexDirection: 'row',
            marginBottom: '1em'
        }}>
            <KeyIndication
                displayKey={"" + displayKey}
                highlighted={stringEquals('' + displayKey + 'h', localCommand)}
            />
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
            <Button style={{
                marginLeft: 'auto',
                backgroundColor: stringEquals('' + displayKey + 'rc', localCommand) ?
                    HIGHLIGHT_COLOR_ELEMENT : ''
            }}
                    onClick={clear} title={'Clear highlighting'}>
                <FormatColorReset/>
            </Button>

        </Paper>
    )
}

export default ClusterView