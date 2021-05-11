import React, {useMemo} from "react"
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import MisconceptionView from "./MisconceptionView";
import {Paper, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import {GREY} from "../../../util/Colors";
import HistoryView from "./HistoryView";
import StaticSelectorView from "./StaticSelectorView";
import NoMisconception from "../../../util/NoMisconception";
import stringEquals from "../../../util/StringEquals";

interface Input {
    misconceptionsAvailable: MisconceptionElement[],
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>
}

function TagView({misconceptionsAvailable, taggingClusterSession, dispatchTaggingClusterSession}: Input) {


    const misconceptionsAvailableNoMisc = useMemo(() => misconceptionsAvailable.filter(
        misc => !stringEquals(misc.name, NoMisconception)
    ), [misconceptionsAvailable])

    return (
        <Paper style={{
            padding: '1em', backgroundColor: GREY, marginTop: '2em', paddingTop: 0, position: 'sticky',
            top: '10em'
        }}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <StaticSelectorView
                                misconceptionsAvailable={misconceptionsAvailable}
                                taggingClusterSession={taggingClusterSession}
                                dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                misconception={NoMisconception}
                                handledIndex={0}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow style={{display: "flex", flexDirection: "column"}}>
                        <HistoryView
                            misconceptionsAvailable={misconceptionsAvailableNoMisc}
                            taggingClusterSession={taggingClusterSession}
                            dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                        />
                    </TableRow>
                    <TableRow>
                        <TableCell style={{borderBottom: "none"}}>
                            <MisconceptionView
                                misconceptionsAvailable={misconceptionsAvailableNoMisc}
                                taggingClusterSession={taggingClusterSession}
                                dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    )
}

export default TagView