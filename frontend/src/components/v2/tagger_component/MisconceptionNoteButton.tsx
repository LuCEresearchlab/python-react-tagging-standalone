import React from "react";
import {Button} from "@material-ui/core";

import CommentIcon from '@material-ui/icons/Comment';
import {createStyles, makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            "min-width": "48px"
        }
    }),
);

function MisconceptionNoteButton() {

    const classes = useStyles()

    return (
        <Button title={"Note"} disabled={true} className={classes.root}>
            <CommentIcon/>
        </Button>
    )
}

export default MisconceptionNoteButton