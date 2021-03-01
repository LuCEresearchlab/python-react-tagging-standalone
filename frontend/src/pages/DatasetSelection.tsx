import React, {useState} from 'react';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@material-ui/core';
import {JSONLoader} from '../helpers/LoaderHelper';
import {useHistory} from 'react-router-dom'


const {TAGGING_SERVICE_URL} = require('../../config.json')

const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
        head: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        body: {
            fontSize: 14,
        },
    }),
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            '&:nth-of-type(odd)': {
                backgroundColor: theme.palette.action.hover,
            },
        },
    }),
)(TableRow);

const useStyles = makeStyles({
    table: {
        minWidth: 700,
    },
});

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
