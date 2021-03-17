import React, {useState} from 'react';
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper, Button} from '@material-ui/core';
import {JSONLoader} from '../helpers/LoaderHelper';
import {useHistory} from 'react-router-dom'
import {StyledTableRow, StyledTableCell, useStyles} from "../components/StyledTable";
import {downloadDatasetHelper} from "../helpers/DownloadHelper";


const {TAGGING_SERVICE_URL} = require('../../config.json')


const redirect = (id: string, url: string, router: any) => {
    // request user input
    let temp = requestUserId()
    while (temp == null || temp == '') {
        temp = requestUserId()
    }
    router.push(url + id + '/' + temp)
}

function requestUserId() {
    const user_id: string | null = prompt("Enter your username", "user_id");
    if (user_id == null || user_id == "") {
        console.log("No user_id entered")
    }
    return user_id
}

function DatasetSelection() {
    const router = useHistory() // TODO: use router from next once integrated, fix import

    const [datasets, setDatasets] = useState([])
    const [loaded, setLoaded] = useState(false)

    const classes = useStyles();
    const url = TAGGING_SERVICE_URL + "/datasets/list"

    if (!loaded) {
        JSONLoader(url, (data: []) => {
            setDatasets(data)
        })
        setLoaded(true)
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Title</StyledTableCell>
                        <StyledTableCell align="right">Creation Date</StyledTableCell>
                        <StyledTableCell align={"right"}>Utilities</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {datasets.map((row: { id: string, name: string, date: string }) => (
                        <StyledTableRow key={row.id}>
                            <StyledTableCell component="th" scope="row" onClick={
                                () => redirect(row.id, "/taggingUI/tagView/", router)
                            }>
                                {row.name}
                            </StyledTableCell>
                            <StyledTableCell align="right" onClick={
                                () => redirect(row.id, "/taggingUI/tagView/", router)
                            }>{row.date}</StyledTableCell>
                            <StyledTableCell align={"right"}><Button variant="outlined" color="primary"
                                                                     href="#outlined-buttons"
                                                                     onClick={() => downloadDatasetHelper(row.id, row.name)}>
                                Download
                            </Button><Button variant="outlined" color="primary" onClick={
                                () => redirect(row.id, "/taggingUI/summary/", router)
                            }>
                                Summary
                            </Button><Button variant="outlined" color="primary" onClick={
                                () => redirect(row.id, "/taggingUI/mergeView/", router)
                            }>
                                Merge Data
                            </Button></StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DatasetSelection
