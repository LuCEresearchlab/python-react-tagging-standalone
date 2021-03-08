import React, {useState} from "react"
import {useParams} from "react-router-dom";
import {JSONLoader} from "../helpers/LoaderHelper";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import {Paper, Table, TableBody, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {StyledTableCell, StyledTableRow, useStyles} from "../components/StyledTable";


const {TAGGING_SERVICE_URL} = require('../../config.json')

interface Stats {
    count: number,
    answers: taggedAnswer[]
}

/**
 * return a map from misconception to stats
 * Stats contain a count of how many answers contain the misconception, and a list of all answers with the misconception
 * @param data list of all tagged answers in the dataset
 */
function computeStats(data: taggedAnswer[]): Map<string, Stats> {
    const stats = new Map<string, Stats>()
    for (let taggedAnswer of data) {
        const tags: string[] = taggedAnswer.tags
        for (let tag of tags) {
            let stat = stats.has(tag) ? stats.get(tag) : {count: 0, answers: []}
            if (stat) {
                stat.count = stat.count + 1
                stat.answers.push(taggedAnswer)
                stats.set(tag, stat)
            }
        }

    }

    return stats
}

function TaggingSummaryPage() {

    const classes = useStyles();

    const {dataset_id, user_id}: { dataset_id: string, user_id: string } = useParams()

    const [taggingData, setTaggingData] = useState(undefined)
    const [stats, setStats] = useState<Map<string, Stats>>(new Map<string, Stats>())
    const [loaded, setLoaded] = useState<boolean>(false)


    const get_url = TAGGING_SERVICE_URL + '/datasets/download/' + dataset_id

    if (!loaded) {
        JSONLoader(get_url, (data: any) => {
            setTaggingData(data)
            setLoaded(true)
            setStats(computeStats(data))
        })
    }

    console.log(user_id)
    console.log(stats)
    console.log(taggingData)


    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Misconception</StyledTableCell>
                        <StyledTableCell align="right">Occurrences</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Array.from(stats)
                            .sort((a: [string, Stats], b: [string, Stats]) => a[0].localeCompare(b[0]))  // sort alphabetically
                            .sort((a: [string, Stats], b: [string, Stats]) => b[1].count - a[1].count)  // sort most common first
                            .map((entry: [string, Stats]) => {
                                    let key = entry[0]
                                    let stat = entry[1]

                                    return (
                                        <StyledTableRow key={key}>
                                            <StyledTableCell align={"left"}>{key}</StyledTableCell>
                                            <StyledTableCell align={"right"}>{stat.count}</StyledTableCell>
                                        </StyledTableRow>
                                    )
                                }
                            )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TaggingSummaryPage