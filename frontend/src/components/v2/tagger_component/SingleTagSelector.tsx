import React, {useState} from "react"
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {Chip, Popover} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";


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

    setTagElement(element: (string | null), index: number): void,
}


function SingleTagSelector({misconceptions_available, enabled, handled_element, tags, setTagElement}: Input) {
    const classes = useStyles()

    // popup stuff
    const [anchorEl, setAnchorEl] = useState(null);

    const handle_click_popup = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handle_close_popup = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    // end popup stuff

    return (
        <Autocomplete
            className={classes.root}
            options={misconceptions_available}
            disabled={!enabled}
            value={tags[handled_element]}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Misconceptions" placeholder="Misconceptions"/>
            )}
            onChange={(_, tag) => {
                setTagElement(tag, handled_element)
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
        />
    )
}

export default SingleTagSelector