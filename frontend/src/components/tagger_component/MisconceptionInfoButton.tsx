import React, {useMemo, useRef, useState} from "react"
import HelpIcon from "@material-ui/icons/Help";
import {Button, Popover} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import stringEquals from "../../util/StringEquals";
import NoMisconception from "../../util/NoMisconception";
import withKeyboard from "../../hooks/withKeyboard";
import {HIGHLIGHT_COLOR_ELEMENT} from "../../util/Colors";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            "min-width": "48px"
        }
    }),
);

interface Input {
    handled_element: number,
    tags: (string | null)[],
    keyboardIndex?: string,
    highlighted?: boolean
}

function MisconceptionInfoButton({tags, handled_element, keyboardIndex, highlighted}: Input) {
    const classes = useStyles()

    const ref = useRef<HTMLButtonElement>(null)

    const tag: (string | null) = tags[handled_element]

    const should_display = () => {
        return tags != null && tag != null && !stringEquals(tag, NoMisconception)
    }

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

    const keyboardAction = useMemo(() => {
            return function (command: string) {
                if (keyboardIndex != undefined && (command == '' + keyboardIndex + '?')) ref.current?.click()
            }
        },
        [keyboardIndex])

    withKeyboard((command: string) => keyboardAction(command))

    return (
        !should_display() ?
            <>
                <Button disabled={true} className={classes.root}>
                </Button>
            </> :
            <>
                <Button title={"Definition"} ref={ref} onClick={handle_click_popup}
                        className={classes.root}
                        style={{backgroundColor: (highlighted ? HIGHLIGHT_COLOR_ELEMENT : '')}}>
                    <HelpIcon/>
                </Button>
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
                    <iframe title={tag != null ? tag : "Error"} width="800" height="800"
                            src={"https://progmiscon.org/iframe/misconceptions/Java/" + tag}/>
                </Popover>
            </>
    )
}

export default MisconceptionInfoButton