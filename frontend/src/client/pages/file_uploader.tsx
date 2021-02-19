import { Button } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > *': {
                margin: theme.spacing(1),
            },
        },
        input: {
            display: 'none',
        },
    }),
);

export default function Uploader() {
    const classes = useStyles();
    return (
        <div>
        <form
            encType="multipart/form-data"
            action={"http://localhost:5000/upload"}
            method="post">
            <input
                accept="application/json"
                className={classes.input}
                id="contained-button-file"
                name={"file"}
                type="file"
            />
            <label htmlFor="contained-button-file">
                <Button variant="contained" component="span">
                    Select File
                </Button>
            </label>
            <input type="submit" value="Submit" />
        </form>
        </div>
    )
}
