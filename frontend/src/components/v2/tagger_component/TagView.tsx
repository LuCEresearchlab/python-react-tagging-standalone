import React from "react"
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import TaggingClusterSession from "../../../model/TaggingClusterSession";
import MisconceptionView from "./MisconceptionView";
import {Paper, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import {GREY} from "../../../util/Colors";
import HistoryView from "./HistoryView";
import StaticSelectorView from "./StaticSelectorView";
import NoMisconception from "../../../util/NoMisconception";

interface Input {
    misconceptionsAvailable: MisconceptionElement[],
    taggingClusterSession: TaggingClusterSession
}

function TagView({misconceptionsAvailable, taggingClusterSession}: Input) {


    return (
        <Paper style={{padding: '1em', backgroundColor: GREY}}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <StaticSelectorView
                                misconceptionsAvailable={misconceptionsAvailable}
                                taggingClusterSession={taggingClusterSession}
                                misconception={NoMisconception}
                                handledIndex={0}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow style={{display: "flex", flexDirection: "column"}}>
                        <HistoryView
                            misconceptionsAvailable={misconceptionsAvailable}
                            taggingClusterSession={taggingClusterSession}
                        />
                    </TableRow>
                    <TableRow>
                        <TableCell style={{borderBottom: "none"}}>
                            <MisconceptionView
                                misconceptionsAvailable={misconceptionsAvailable}
                                clusterTaggingSession={taggingClusterSession}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    )
}

export default TagView