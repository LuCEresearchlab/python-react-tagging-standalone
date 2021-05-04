import React, {useRef, useState} from "react"
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {Chip, Popover} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {
    getHistory,
    MAX_HISTORY_SIZE,
    PRE_DYNAMIC_SIZE,
    TaggingClusterSession
} from "../../../model/TaggingClusterSession";
import withKeyboard from "../../../hooks/withKeyboard";


const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '50%'
        }
    }),
);

interface Input {
    misconceptions_available: string[],
    enabled: boolean,
    handled_element: number,
    tags: (string | null)[],
    taggingClusterSession: TaggingClusterSession,

    setTagElement(element: (string | null), index: number): void,
}


function SingleTagSelector({
                               misconceptions_available, enabled, handled_element, tags, setTagElement,
                               taggingClusterSession
                           }: Input) {
    const classes = useStyles()

    const autocomplete = useRef<HTMLDivElement>(null)

    withKeyboard((command: string) => {
        if (command == 't' + (handled_element - PRE_DYNAMIC_SIZE)) {
            const input: any = autocomplete.current?.childNodes?.item(1)?.firstChild
            input.focus()
            input.select()
        }
        if (command == 't' + (handled_element - PRE_DYNAMIC_SIZE) + 'c') {
            onChange(null, null)
        }
    })

    // popup stuff
    const [anchorEl, setAnchorEl] = useState(null);
    const value = useRef<string>("")


    const new_value = tags[handled_element]  // garbage type-checker
    value.current = new_value == null ? "" : new_value

    const handle_click_popup = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handle_close_popup = () => {
        setAnchorEl(null);
    };

    const onChange = (_: any, tag: any) => {
        if (getHistory(taggingClusterSession).length != MAX_HISTORY_SIZE) value.current = ""

        setTagElement(tag, handled_element)
    }

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    // end popup stuff

    return (
        <Autocomplete
            key={'autocomplete|' + handled_element + value.current}
            className={classes.root}
            blurOnSelect={true}
            clearOnBlur={true}
            options={misconceptions_available}
            inputValue={value.current}
            value={value.current}
            disabled={!enabled}
            renderInput={(params) => (
                <TextField {...params}
                           ref={autocomplete}
                           variant="outlined"
                           label="Misconceptions"
                           placeholder="Misconceptions"
                />
            )}
            onChange={onChange}
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
        />
    )
}

export default SingleTagSelector