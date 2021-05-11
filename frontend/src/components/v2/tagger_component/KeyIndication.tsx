import React from "react"
import {Button} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {HIGHLIGHT_COLOR_ELEMENT} from "../../../util/Colors";

interface Input {
    displayKey: string,
    highlighted?: boolean
}

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            paddingLeft: 0,
            paddingRight: 0,
            'min-width': '36px'
        }
    }),
);

function KeyIndication({displayKey, highlighted}: Input) {

    const classes = useStyles()

    return (
        <Button disabled={true} className={classes.root}
                style={{backgroundColor: highlighted ? HIGHLIGHT_COLOR_ELEMENT : ''}}
        >
            {displayKey}
        </Button>
    )
}

export default KeyIndication