import {Button, Grid} from '@material-ui/core';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import React, {useState} from 'react';


const TAGGING_SERVICE_URL = process.env.TAGGING_SERVICE_URL

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
    const [fileName, setFileName] = useState("");

    return (
        <Grid container>
            <form
                encType="multipart/form-data"
                action={TAGGING_SERVICE_URL + "/datasets/upload"}
                className={classes.root}
                method="post">
                <Grid item>
                    <input
                        accept="application/json"
                        className={classes.input}
                        id="contained-button-file"
                        name={"file"}
                        type="file"
                        onChange={e => setFileName(e.target.value)}
                    />
                    <label htmlFor="contained-button-file">
                        <Button variant="contained" component="span">
                            Select File
                        </Button>
                    </label>
                    {(() => {
                        if (fileName === "")
                            return (<p>Select a file</p>)
                        else
                            return (<p>Selected {fileName.substring("C:\\fakepath\\".length)}</p>)
                    })()}
                </Grid>
                <Grid item>
                    <Button variant="contained" type="submit">Submit</Button>
                </Grid>
            </form>
        </Grid>
    )
}
