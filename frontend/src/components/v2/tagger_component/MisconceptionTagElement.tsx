import React, {useState} from "react"
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {JSONLoader} from "../../../helpers/LoaderHelper";
import {Button} from "@material-ui/core";
import {HighlightRange} from "../../../interfaces/HighlightRange";
import {StyledTableCell, StyledTableRow} from "../../styled/StyledTable";
import {TaggedAnswer} from "../../../interfaces/TaggedAnswer";
import {Answer} from "../../../interfaces/Dataset";
import {
    computeMiscList,
    filteredMisconceptions,
    getColor,
    getMillis,
    NO_COLOR,
    highlightRangesColorUpdating,
    isNoMisconception,
    isUsingDefaultColor
} from "../../../helpers/Util";

// @ts-ignore
import Highlightable from "highlightable";

import {rangesCompressor} from "../../../util/RangeCompressor";
import SingleTagSelector from "./SingleTagSelector";
import MisconceptionInfoButton from "./MisconceptionInfoButton";
import MisconceptionNoteButton from "./MisconceptionNoteButton";
import MisconceptionColorButton from "./MisconceptionColorButton";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import TruthCircle from "./TruthCircle";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

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
        JSONLoader(get_selected_misc_url, (prev_tagged_answers: TaggedAnswer[]) => {
            // has existing value
            if (prev_tagged_answers.length > 0) {
                const previousTaggedAnswer: TaggedAnswer = prev_tagged_answers[0]
                const previous_tags = previousTaggedAnswer.tags == null || previousTaggedAnswer.tags.length == 0 ?
                    [null] :
                    isNoMisconception(previousTaggedAnswer.tags[0]) || !enabled ?
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


    // time taken setup
    const tagging_time_handler = () => {
        if (startTaggingTime == 0)
            setStartTaggingTime(getMillis())
    }


    const post = (url: string, data: any) => {
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

    const post_answer = (submitted_ranges: HighlightRange[], given_tags: (string | null)[]) => {
        post(post_answer_url,
            {
                dataset_id: dataset_id,
                question_id: question_id,
                answer_id: answer.answer_id,
                user_id: user_id,
                tags: given_tags.filter(value => value != null),
                tagging_time: (getMillis() - startTaggingTime),
                highlighted_ranges: submitted_ranges,
                answer_text: answer.data
            }
        )
    }


    return (
        <StyledTableRow onClick={tagging_time_handler}>
            <StyledTableCell component="th" scope="row" style={{width: "24px", paddingRight: 0}}>
                <TruthCircle value={answer.picked}/>
            </StyledTableCell>
            <StyledTableCell component="th" scope="row">
                <Highlightable
                    ranges={ranges}
                    enabled={enabled}
                    onTextHighlighted={(e: any) => {
                        if (isUsingDefaultColor(currentColor)) return

                        const newRange = {start: e.start, end: e.end, text: answer.data, color: currentColor}
                        const r = rangesCompressor(ranges, newRange)

                        setRanges([...r])
                        post_answer(r, tags)
                    }}
                    text={answer.data}
                    highlightStyle={(range: HighlightRange) => {
                        return {
                            backgroundColor: range.color + "C8",
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
                                    color={getColor(misconceptions_available, tags[0])}
                                    enabled={enabled}
                                    current_color={currentColor}
                                    setColor={setCurrentColor}

                                />
                                <SingleTagSelector
                                    key={"tag-selector-0"}
                                    misconceptions_available={
                                        filteredMisconceptions(tags,
                                            misconceptions_string_list, 0)
                                    }
                                    enabled={enabled}
                                    handled_element={0}
                                    tags={tags}
                                    setTagElement={(element: (string | null), index: number) => {
                                        const new_ranges = highlightRangesColorUpdating(
                                            misconceptions_available,
                                            tags,
                                            ranges,
                                            element,
                                            index)

                                        let tmp_tags: (string | null)[] = computeMiscList(tags, element, index)
                                        // handle specific case of NoMisconception, only possible in first tag
                                        if (element != null && isNoMisconception(element))
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
                                            const handled_element = index + 1


                                            return (
                                                <div key={"tag-selector-" + handled_element} className={classes.divLine}>
                                                    <MisconceptionColorButton
                                                        color={(() => getColor(misconceptions_available,
                                                            tags[handled_element]))()}
                                                        enabled={enabled}
                                                        current_color={currentColor}
                                                        setColor={setCurrentColor}
                                                    />
                                                    <SingleTagSelector
                                                        misconceptions_available={
                                                            filteredMisconceptions(tags,
                                                                misconceptions_string_list, handled_element)
                                                        }
                                                        enabled={enabled}
                                                        handled_element={handled_element}
                                                        tags={tags}
                                                        setTagElement={(element: (string | null), index: number) => {
                                                            const new_ranges = highlightRangesColorUpdating(
                                                                misconceptions_available,
                                                                tags,
                                                                ranges,
                                                                element,
                                                                index)

                                                            const tmp_tags: (string | null)[] =
                                                                computeMiscList(tags, element, index)

                                                            setTags(tmp_tags)
                                                            setRanges(new_ranges)
                                                            post_answer(new_ranges, tmp_tags)
                                                        }}
                                                    />
                                                    <MisconceptionInfoButton
                                                        tags={tags}
                                                        handled_element={handled_element}
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