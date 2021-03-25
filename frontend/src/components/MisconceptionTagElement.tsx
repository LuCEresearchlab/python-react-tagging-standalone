import React, {useState} from "react"
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {JSONLoader} from "../helpers/LoaderHelper";
import {Button} from "@material-ui/core";
import {HighlightRange} from "../interfaces/HighlightRange";
import {StyledTableCell, StyledTableRow} from "./StyledTable";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import {Answer} from "../interfaces/Dataset";

// @ts-ignore
import Highlightable from "highlightable";

import {rangesCompressor} from "../util/RangeCompressor";
import SingleTagSelector from "./SingleTagSelector";
import MisconceptionInfoButton from "./MisconceptionInfoButton";
import MisconceptionNoteButton from "./MisconceptionNoteButton";
import MisconceptionColorButton from "./MisconceptionColorButton";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";
import stringEquals from "../util/StringEquals";

const {TAGGING_SERVICE_URL} = require('../../config.json')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "min-content",
            '& > * + *': {
                marginTop: theme.spacing(3),
            },
            float: "right"
        },
        divLine: {
            display: "inline-flex",
        }
    }),
);


interface ids_and_misconceptions {
    dataset_id: string,
    question_id: string,
    user_id: string,
    answer: Answer,
    misconceptions_available: MisconceptionElement[],
    enabled: boolean
}


function post(url: string, data: any) {
    console.log('posting to ' + url)
    console.log(data)
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response: Response) => console.log(response.status));
}


function get_millis() {
    return new Date().getTime()
}

function _is_no_misconception(tag: (string | null)): boolean {
    return tag != null && ("NoMisconception".localeCompare(tag) == 0)
}

const NO_COLOR: string = "#000000"


function MisconceptionTagElement(
    {
        dataset_id,
        question_id,
        user_id,
        answer,
        misconceptions_available,
        enabled
    }: ids_and_misconceptions) {

    const classes = useStyles();
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + '/question/'
        + question_id + '/answer/' + answer.answer_id + '/user/' + user_id
    const post_answer_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'

    const [tags, setTags] = useState<(string | null)[]>([])
    const [ranges, setRanges] = useState<HighlightRange[]>([])

    const [currentColor, setCurrentColor] = useState<string>(NO_COLOR)
    const [startTaggingTime, setStartTaggingTime] = useState<number>(0)

    const [loaded, setLoaded] = useState<boolean>(false)

    const misconceptions_string_list: string[] = misconceptions_available.map<string>(misc => misc.name)



    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_answers: taggedAnswer[]) => {
            // has existing value
            if (prev_tagged_answers.length > 0) {
                const previousTaggedAnswer: taggedAnswer = prev_tagged_answers[0]
                const previous_tags = previousTaggedAnswer.tags == null || previousTaggedAnswer.tags.length == 0 ?
                    [null] :
                    _is_no_misconception(previousTaggedAnswer.tags[0]) || !enabled ?
                        previousTaggedAnswer.tags :
                        [...previousTaggedAnswer.tags, null]  // append null to allow inserting


                setTags(previous_tags)
                setRanges(previousTaggedAnswer.highlighted_ranges == null ? [] : previousTaggedAnswer.highlighted_ranges)
            }
            else {  // has never been tagged
                setTags([null])
                setRanges([])
            }
            setLoaded(true)
        })
    }


    // time taken setup
    const tagging_time_handler = () => {
        if (startTaggingTime == 0)
            setStartTaggingTime(get_millis())
    }


    const post_answer = (submitted_ranges: HighlightRange[], given_tags:  (string | null)[]) => {
        post(post_answer_url,
            {
                dataset_id,
                question_id,
                answer_id: answer.answer_id,
                user_id: user_id,
                tags: given_tags.filter(value => value != null),
                tagging_time: (get_millis() - startTaggingTime),
                highlighted_ranges: submitted_ranges,
                answer_text: answer.data
            }
        )
    }

    // computes updates for the whole misconception list to handle common functionality of increase/decrease of size
    const compute_misc_list = (tags: (string | null)[], element: (string | null), index: number): (string | null)[] => {
        let tmp_tags: (string | null)[] = [...tags]
        tmp_tags.splice(index, 1, element)
        if(tmp_tags.length == (index+1) && element != null)
            tmp_tags.push(null)
        // removed tag, should decrease
        if(tmp_tags.length >= (index+2) && element == null)
            tmp_tags.splice(index, 1)
        return tmp_tags
    }

    const get_color = (misc: (string | null)) => {
        if (misc == null)
            return ""
        const found = misconceptions_available.find((elem: MisconceptionElement) => stringEquals(elem.name, misc))
        return found ? found.color : ""
    }

    const using_default_color = () => currentColor.localeCompare(NO_COLOR) == 0

    const highlight_ranges_color_updating = (tags: (string | null)[], element: (string | null), index: number) => {
        if (_is_no_misconception(element)) return []
        if (element == null || tags[index] != null) {
            let removed_color: string = NO_COLOR
            if (tags[index] != null) removed_color = get_color(tags[index])

            return [...ranges]
                .filter((elem: HighlightRange) => !stringEquals(elem.color, removed_color))
        }
        return ranges
    }


    return (
        <StyledTableRow onClick={tagging_time_handler}>
            <StyledTableCell component="th" scope="row"><Highlightable
                ranges={ranges}
                enabled={enabled}
                onTextHighlighted={(e: any) => {
                    if (using_default_color()) return

                    const newRange = {start: e.start, end: e.end, text: answer.data, color: currentColor}
                    const r = rangesCompressor(ranges, newRange)

                    setRanges([...r])
                    post_answer(r, tags)
                }}
                text={answer.data}
                highlightStyle={(range: HighlightRange) => {
                    return {
                        backgroundColor: range.color
                    }
                }
                }
            />{
                enabled ?
                    <Button hidden={!enabled} onClick={() => {
                        if (enabled) {
                            setRanges([])
                            post_answer([], tags)
                        }
                    }}>Clear</Button> :
                    <></>
            }</StyledTableCell>
            <StyledTableCell align="right" className={classes.root}>
                {
                    loaded ?
                        <>
                            <div className={classes.divLine}>
                                <MisconceptionColorButton
                                    color={get_color(tags[0])}
                                    enabled={enabled}
                                    current_color={currentColor}
                                    setColor={setCurrentColor}

                                />
                                <SingleTagSelector
                                    key={"tag-selector-0"}
                                    misconceptions_available={misconceptions_string_list}
                                    enabled={enabled}
                                    handled_element={0}
                                    tags={tags}
                                    setTagElement={(element: (string | null), index: number) => {
                                        const new_ranges = highlight_ranges_color_updating(tags, element, index)

                                        let tmp_tags: (string | null)[] = compute_misc_list(tags, element, index)
                                        // handle specific case of NoMisconception, only possible in first tag
                                        if (element != null && _is_no_misconception(element))
                                            tmp_tags = ["NoMisconception"]
                                        setTags(tmp_tags)
                                        setRanges(new_ranges)
                                        post_answer(new_ranges, tmp_tags)
                                    }}
                                />
                                <MisconceptionInfoButton
                                    tags={tags}
                                    handled_element={0}
                                />
                                <MisconceptionNoteButton/>
                            </div>
                            {
                                [...Array(Math.min(tags.length - 1, 4))]
                                    .map((_, index) => {
                                            let filtered_misconceptions = misconceptions_string_list
                                            // only allow misconceptions that aren't already present
                                            tags.forEach(tag => {
                                                filtered_misconceptions = filtered_misconceptions
                                                    .filter(misc => !stringEquals(misc, tag))
                                            })

                                            return (
                                                <div key={"tag-selector-" + (index + 1)} className={classes.divLine}>
                                                    <MisconceptionColorButton
                                                        color={(() => get_color(tags[index + 1]))()}
                                                        enabled={enabled}
                                                        current_color={currentColor}
                                                        setColor={setCurrentColor}
                                                    />
                                                    <SingleTagSelector
                                                        misconceptions_available={filtered_misconceptions}
                                                        enabled={enabled}
                                                        handled_element={(index + 1)}
                                                        tags={tags}
                                                        setTagElement={(element: (string | null), index: number) => {
                                                            const new_ranges = highlight_ranges_color_updating(tags, element, index)

                                                            const tmp_tags: (string | null)[] =
                                                                compute_misc_list(tags, element, index)

                                                            setTags(tmp_tags)
                                                            setRanges(new_ranges)
                                                            post_answer(new_ranges, tmp_tags)
                                                        }}
                                                    />
                                                    <MisconceptionInfoButton
                                                        tags={tags}
                                                        handled_element={(index + 1)}
                                                    />
                                                    <MisconceptionNoteButton/>
                                                </div>)
                                        }
                                    )
                            }
                        </>
                        : <></>
                }
            </StyledTableCell>
        </StyledTableRow>
    )
}


export default MisconceptionTagElement