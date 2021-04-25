import React, {useContext, useEffect, useState} from 'react';
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper, Button, LinearProgress} from '@material-ui/core';
import {JSONLoader} from '../../helpers/LoaderHelper';
import {useHistory} from 'react-router-dom'
import {StyledTableRow, StyledTableCell, useStyles} from "../../components/styled/StyledTable";
import {downloadDatasetHelper} from "../../helpers/DownloadHelper";
import {Assignment, AssignmentLate, CloudDownload} from "@material-ui/icons";
import {DatasetDesc} from "../../interfaces/Dataset";
import {userContext} from "../../util/UserContext";


const {TAGGING_SERVICE_URL} = require('../../../config.json')


const redirect = (id: string, url: string, user_id: string, router: any) => {
    router.push(url + id + '/' + user_id)
}


function DatasetSelection() {
    const router = useHistory() // TODO: use router from next once integrated, fix import

    const [datasets, setDatasets] = useState<DatasetDesc[]>([])
    const [loaded, setLoaded] = useState<boolean>(false)

    const {username} = useContext(userContext)

    const classes = useStyles();
    const url = TAGGING_SERVICE_URL + "/datasets/list"

    if (!loaded) {
        JSONLoader(url, (data: []) => {
            setDatasets(data)
        })
        setLoaded(true)
    }

    useEffect(() => {
        const interval = setInterval(() => setLoaded(false), 10000);
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
                        const needed_time_s = 1000 * 60 * 2 * dataset.nr_questions
                        const started = new Date(dataset.creation_data)
                        const now = new Date()

                        const time_left = needed_time_s - (now.getTime() - started.getTime())

                        const time_left_minutes = Math.max(Math.floor(time_left / (60 * 1000)), 0)
                        const seconds = Math.floor((time_left - time_left_minutes * (60 * 1000)) / (1000))

                        const time_left_seconds = seconds < 10 ? '0' + seconds : seconds

                        const displayed_time = time_left_minutes < 1 ?
                            '<1m' :
                            `~${time_left_minutes}:${time_left_seconds}`

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
                                        {`${dataset.clusters_computed}/${dataset.nr_questions} Time Left: ${
                                            displayed_time}`}
                                    </StyledTableCell>
                                </StyledTableRow>
                            )
                        }

                        return (
                            <StyledTableRow key={dataset.dataset_id}>
                                <StyledTableCell component="th" scope="row" onClick={
                                    () => redirect(dataset.dataset_id, "/taggingUI/tagView/", username, router)}>
                                    {dataset.name}
                                </StyledTableCell>
                                <StyledTableCell align="right" onClick={
                                    () => redirect(dataset.dataset_id, "/taggingUI/tagView/", username, router)
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
                                            () => redirect(
                                                dataset.dataset_id, "/taggingUI/summary/", username, router
                                            )
                                        }>
                                        <Assignment/>
                                    </Button>
                                    <Button
                                        title={"Diff Data"}
                                        variant="outlined"
                                        disabled={loading_cluster}
                                        color="primary"
                                        onClick={
                                            () => redirect(
                                                dataset.dataset_id, "/taggingUI/mergeView/", username, router
                                            )
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
