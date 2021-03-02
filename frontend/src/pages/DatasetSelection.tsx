import React, {useState} from 'react';
import {Table, TableBody, TableContainer, TableHead, TableRow, Paper} from '@material-ui/core';
import {JSONLoader} from '../helpers/LoaderHelper';
import {useHistory} from 'react-router-dom'
import {StyledTableRow, StyledTableCell, useStyles} from "../components/StyledTable";


const {TAGGING_SERVICE_URL} = require('../../config.json')

const selectDataset = (id: string, router: any) => {
    router.push("/taggingUI/tagView/" + id)
}


function DatasetSelection() {
    const router = useHistory() // TODO: use router from next once integrated, fix import

    const [datasets, setDatasets] = useState([]);
    const [loaded, setLoaded] = useState(false)

    const classes = useStyles();
    const url = TAGGING_SERVICE_URL + "/datasets/list"

    if(!loaded) {
        JSONLoader(url, (data:[]) => {
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {datasets.map((row: { id:string, name: string, date: string }) => (
                        <StyledTableRow key={row.id} onClick={() => selectDataset(row.id, router)}>
                            <StyledTableCell component="th" scope="row">
                                {row.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{row.date}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DatasetSelection
