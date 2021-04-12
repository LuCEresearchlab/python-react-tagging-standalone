import React from "react"
import {Button} from "@material-ui/core";
import {createStyles, makeStyles} from "@material-ui/core/styles";

interface Input {
    displayKey: string
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

function KeyIndication({displayKey}: Input) {

    const classes = useStyles()

    return (
        <Button disabled={true} className={classes.root}>
            {displayKey}
        </Button>
    )
}

export default KeyIndication