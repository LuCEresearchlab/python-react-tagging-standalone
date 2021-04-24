import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper, Button, LinearProgress} from '@material-ui/core';
import {JSONLoader} from '../../helpers/LoaderHelper';
import {useHistory} from 'react-router-dom'
import {StyledTableRow, StyledTableCell, useStyles} from "../../components/styled/StyledTable";
import {downloadDatasetHelper} from "../../helpers/DownloadHelper";
import {Assignment, AssignmentLate, CloudDownload} from "@material-ui/icons";
import {DatasetDesc} from "../../interfaces/Dataset";


const {TAGGING_SERVICE_URL} = require('../../../config.json')


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

    const [datasets, setDatasets] = useState<DatasetDesc[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    const classes = useStyles();
    const url = TAGGING_SERVICE_URL + "/datasets/list"

    if (!loaded) {
        JSONLoader(url, (data: []) => {
            setDatasets(data)
        })
        setLoaded(true)
    }

    useEffect(() => {
        const interval = setInterval(() => setLoaded(false), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);


    return (
        <TableContainer component={Paper} style={{
            width: '98%',
            margin: 'auto'
        }}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Title</StyledTableCell>
                        <StyledTableCell align="right">Creation Date</StyledTableCell>
                        <StyledTableCell align={"right"}>Utilities</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {datasets.map((dataset: DatasetDesc) => {
                        const loading_cluster = dataset.clusters_computed != dataset.nr_questions
                        const needed_time_s = new Date(2 * 1000 * 60 * dataset.nr_questions)
                        const time_left = new Date(
                            new Date(dataset.creation_data).getTime() +
                            needed_time_s.getTime() -
                            new Date().getTime()
                        )


                        if (dataset.clusters_computed != dataset.nr_questions) {
                            return (
                                <StyledTableRow key={dataset.dataset_id}>
                                    <StyledTableCell component={'th'} scope={'row'}>
                                        {dataset.name}
                                    </StyledTableCell>
                                    <StyledTableCell component={'th'} scope={'row'}>
                                        <LinearProgress
                                            variant={'determinate'}
                                            value={Math.ceil(100 * dataset.clusters_computed / dataset.nr_questions)}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell component={'th'} scope={'row'} style={{textAlign: 'end'}}>
                                        {`${dataset.clusters_computed}/${dataset.nr_questions}\tTime Left: ~${
                                            time_left.getMinutes()}:${time_left.getSeconds()}`}
                                    </StyledTableCell>
                                </StyledTableRow>
                            )
                        }

                        return (
                            <StyledTableRow key={dataset.dataset_id}>
                                <StyledTableCell component="th" scope="row" onClick={
                                    () => redirect(dataset.dataset_id, "/taggingUI/tagView/", router)}>
                                    {dataset.name}
                                </StyledTableCell>
                                <StyledTableCell align="right" onClick={
                                    () => redirect(dataset.dataset_id, "/taggingUI/tagView/", router)
                                }>
                                    {dataset.creation_data}
                                </StyledTableCell>
                                <StyledTableCell align={"right"}>
                                    <Button
                                        title={"Download"}
                                        variant="outlined" color="primary"
                                        href="#outlined-buttons"
                                        disabled={loading_cluster}
                                        onClick={() => downloadDatasetHelper(dataset.dataset_id, dataset.name)}>
                                        <CloudDownload/>
                                    </Button>
                                    <Button
                                        title={"Summary"}
                                        variant="outlined"
                                        disabled={loading_cluster}
                                        color="primary"
                                        onClick={
                                            () => redirect(dataset.dataset_id, "/taggingUI/summary/", router)
                                        }>
                                        <Assignment/>
                                    </Button>
                                    <Button
                                        title={"Diff Data"}
                                        variant="outlined"
                                        disabled={loading_cluster}
                                        color="primary"
                                        onClick={
                                            () => redirect(dataset.dataset_id, "/taggingUI/mergeView/", router)
                                        }>
                                        <AssignmentLate/>
                                    </Button>
                                </StyledTableCell>
                            </StyledTableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DatasetSelection
