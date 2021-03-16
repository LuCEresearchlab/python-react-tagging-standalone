import React, {useState} from "react"
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {JSONLoader} from "../helpers/LoaderHelper";
import {Button, Chip, Popover} from "@material-ui/core";
import {HighlightRange} from "../interfaces/HighlightRange";
import {StyledTableCell, StyledTableRow} from "./StyledTable";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import {Answer} from "../interfaces/Dataset";


// @ts-ignore
import Highlightable from "highlightable";
import {rangesCompressor} from "../util/RangeCompressor";

const {TAGGING_SERVICE_URL} = require('../../config.json')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: 500,
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
    question_text: string,
    misconceptions_available: string[],
    enabled: boolean
}


function post(url: string, data: any){
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


function get_millis(){
    return new Date().getTime()
}


function MisconceptionTagElement({dataset_id, question_id, user_id, question_text, answer, misconceptions_available, enabled}: ids_and_misconceptions) {

    const classes = useStyles();
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/dataset/' + dataset_id + '/question/'
        + question_id + '/answer/' + answer.answer_id + '/user/' + user_id
    const post_answer_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'

    const [tags, setTags] = useState<string[]>([])
    const [ranges, setRanges] = useState<HighlightRange[]>([])

    const [startTaggingTime, setStartTaggingTime] = useState<number>(0)

    const [loaded, setLoaded] = useState<boolean>(false)


    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_answers: taggedAnswer[]) => {
            if(prev_tagged_answers.length > 0){
                const previousTaggedAnswer: taggedAnswer = prev_tagged_answers[0]

                setTags(previousTaggedAnswer.tags == null ? [] : previousTaggedAnswer.tags)
                setRanges(previousTaggedAnswer.highlighted_ranges == null ? [] : previousTaggedAnswer.highlighted_ranges)
            }
            setLoaded(true)
        })
    }

    // popup stuff
    const [anchorEl, setAnchorEl] = useState(null);

    const handle_click_popup = (event:any) => {
        setAnchorEl(event.currentTarget);
    };

    const handle_close_popup = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    // end popup stuff


    // time taken setup
    const tagging_time_handler = () => {
        if (startTaggingTime == 0)
            setStartTaggingTime(get_millis())
    }


    const post_answer = (submitted_ranges: HighlightRange[], given_tags: string[]) => {
        post(post_answer_url,
            {
                dataset_id,
                question_id,
                answer_id: answer.answer_id,
                user_id: user_id,
                tags: given_tags,
                tagging_time: (get_millis() - startTaggingTime),
                highlighted_ranges: submitted_ranges,
                question_text,
                answer_text: answer.data
            }
        )
    }

    return (
        <StyledTableRow onClick={tagging_time_handler}>
            <StyledTableCell align="right">{question_text}</StyledTableCell>
            <StyledTableCell component="th" scope="row"><Highlightable
                ranges={ranges}
                enabled={enabled}
                onTextHighlighted={(e: any) => {
                    const newRange = {start:e.start, end:e.end, text:answer.data}
                    const r = rangesCompressor(ranges, newRange)

                    setRanges([...r])
                    post_answer(r, tags)
                }}
                text={answer.data}
                highlightStyle={{
                    backgroundColor: '#ffcc80'
                }}
            /><Button onClick={() => {
                if(enabled){
                    setRanges([])
                    post_answer([], tags)
                }
            }}>Clear</Button></StyledTableCell>
            <StyledTableCell align="right"><Autocomplete
                className={classes.root}
                multiple
                limitTags={2}
                options={misconceptions_available}
                disabled={!enabled}
                value={tags}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Misconceptions" placeholder="Misconceptions"/>
                )}
                onChange={(_, values) => {
                    if (enabled && loaded) {
                        setTags(values)
                        post_answer(ranges, values)
                    }
                }}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <div key={option}>
                            <Chip
                                label={option}
                                {...getTagProps({index})}
                                onClick={handle_click_popup}
                            />
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handle_close_popup}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center"
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "center"
                                }}
                            >
                                <iframe title={option} width="800" height="800"
                                        src={"https://progmiscon.org/iframe/misconceptions/Java/" + option}/>
                            </Popover></div>
                    ))
                }
            /></StyledTableCell>
        </StyledTableRow>
    )
}


export default MisconceptionTagElement