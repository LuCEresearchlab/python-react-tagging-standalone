import React, {useState} from "react"
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {JSONLoader} from "../helpers/LoaderHelper";
import {Chip, Popover} from "@material-ui/core";

const {TAGGING_SERVICE_URL} = require('../../config.json')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: 500,
            '& > * + *': {
                marginTop: theme.spacing(3),
            },
        },
    }),
);


interface ids_and_misconceptions {
    dataset_id: string,
    question_id: string,
    answer_id: string,
    user_id: string,
    misconceptions_available: string[]
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


function getMillis(){
    return new Date().getTime()
}


function MisconceptionTagElement({dataset_id, question_id, answer_id, user_id, misconceptions_available}: ids_and_misconceptions) {

    const classes = useStyles();
    const get_selected_misc_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer/tags/' + dataset_id + '/' + question_id + '/' + answer_id + '/' + user_id
    const post_answer_url = TAGGING_SERVICE_URL + '/datasets/tagged-answer'

    const [tags, setTags] = useState<string[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)
    const [startTaggingTime, setStartTaggingTime] = useState<number>(0)


    if (!loaded) {
        JSONLoader(get_selected_misc_url, (prev_tagged_misconceptions: []) => {
            setTags(prev_tagged_misconceptions)
            setLoaded(true)
        })
    }

    // popup stuff
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClickPopup = (event:any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopup = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    // end popup stuff

    return (
        <div className={classes.root}>
            <Autocomplete
                multiple
                limitTags={2}
                id="multiple-limit-tags"
                options={misconceptions_available}
                // getOptionLabel={(option) => option.name}
                value={tags}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Misconceptions" placeholder="Misconceptions"/>
                )}
                onChange={(_, values) => {
                    if(loaded){
                    setTags(values)
                    post(post_answer_url,
                        {
                            dataset_id,
                            question_id,
                            answer_id,
                            user_id,
                            tags: values,
                            tagging_time: (getMillis() - startTaggingTime)
                        }
                    )
                    }
                }}
                onFocus={()=>{
                    if(startTaggingTime == 0) {
                        setStartTaggingTime(getMillis())
                    }
                }}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <div key={option}>
                        <Chip
                            label={option}
                            {...getTagProps({ index })}
                            onClick={handleClickPopup}
                        />
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClosePopup}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center"
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "center"
                                }}
                            >
                                <iframe title={option} width="800" height="800" src={"https://progmiscon.org/iframe/misconceptions/Java/"+ option}/>
                            </Popover></div>
                    ))
                }

            />
        </div>
    )
}


export default MisconceptionTagElement