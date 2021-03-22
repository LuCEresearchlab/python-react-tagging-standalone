import React, {useState} from "react"
import HelpIcon from "@material-ui/icons/Help";
import {Button, Popover} from "@material-ui/core";

interface Input {
    handled_element: number,
    tags: (string | null)[],
}

function MisconceptionInfoButton({tags, handled_element}: Input){
    const tag: (string | null) = tags[handled_element]

    const should_display = () => {
        return tags != null && tag != null && tag.localeCompare("NoMisconception") != 0
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

    return (
        !should_display() ?
            <>
                <Button disabled={true}>
                </Button>
            </> :
            <>
                <Button onClick={handle_click_popup}>
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