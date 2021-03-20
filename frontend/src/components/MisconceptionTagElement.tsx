import React, {useState} from "react"
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
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

const {TAGGING_SERVICE_URL} = require('../../config.json')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: 300,
            '& > * + *': {
                marginTop: theme.spacing(3),
            },
            float: "right"
        },
    }),
);


interface ids_and_misconceptions {
    dataset_id: string,
    question_id: string,
    user_id: string,
    answer: Answer,
    misconceptions_available: string[],
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

    const [startTaggingTime, setStartTaggingTime] = useState<number>(0)

    const [loaded, setLoaded] = useState<boolean>(false)


    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_answers: taggedAnswer[]) => {
            if (prev_tagged_answers.length > 0) {
                const previousTaggedAnswer: taggedAnswer = prev_tagged_answers[0]
                const previous_tags = previousTaggedAnswer.tags == null || previousTaggedAnswer.tags.length == 0 ?
                    [null] :
                    previousTaggedAnswer.tags

                setTags(previous_tags)
                setRanges(previousTaggedAnswer.highlighted_ranges == null ? [] : previousTaggedAnswer.highlighted_ranges)
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

    return (
        <StyledTableRow onClick={tagging_time_handler}>
            <StyledTableCell component="th" scope="row"><Highlightable
                ranges={ranges}
                enabled={enabled}
                onTextHighlighted={(e: any) => {
                    const newRange = {start: e.start, end: e.end, text: answer.data}
                    const r = rangesCompressor(ranges, newRange)

                    setRanges([...r])
                    post_answer(r, tags)
                }}
                text={answer.data}
                highlightStyle={{
                    backgroundColor: '#ffcc80'
                }}
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
                    [...Array( (tags.length) > 0 ? tags.length : 1)].map((_, index) =>
                        <SingleTagSelector
                            key={"tag-selector-" + index}
                            misconceptions_available={misconceptions_available}
                            enabled={enabled}
                            handled_element={index}
                            tags={tags}
                            setTagElement={(element: (string | null), index: number) => {
                                let tmp_tags: (string | null)[] = [...tags]
                                tmp_tags.splice(index, 1, element)
                                setTags(tmp_tags)
                                post_answer(ranges, tmp_tags)
                            }}
                        />
                    )
                    : <></>
                }
            </StyledTableCell>
        </StyledTableRow>
    )
}


export default MisconceptionTagElement