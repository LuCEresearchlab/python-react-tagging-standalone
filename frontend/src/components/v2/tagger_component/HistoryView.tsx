import React, {useMemo} from "react"
import {TableCell} from "@material-ui/core";
import StaticSelectorView from "./StaticSelectorView";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {getHistory, TaggingClusterSession, TaggingClusterSessionDispatch} from "../../../model/TaggingClusterSession";
import {createStyles, makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() =>
    createStyles({
        divLine: {
            paddingLeft: 0,
            paddingRight: 0
        }
    }),
);

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    misconceptionsAvailable: MisconceptionElement[]
}

function HistoryView({taggingClusterSession, dispatchTaggingClusterSession, misconceptionsAvailable}: Input) {

    const classes = useStyles()

    const history = getHistory(taggingClusterSession)
    const historyPart1 = useMemo(() => history.slice(0, history.length - 1), [history])
    const historyPart2 = useMemo(() => history.slice(history.length - 1), [history])

    if (history.length === 0) return (<TableCell>Empty History</TableCell>)

    return (
        <>
            {
                historyPart1.length === 0 ?
                    <></> :
                    historyPart1.map((tag: string, index: number) =>
                        <TableCell key={"static|selector|view|" + tag} style={{borderBottom: "none", paddingLeft: 0,
                            paddingRight: 0}}>
                            <StaticSelectorView
                                misconceptionsAvailable={misconceptionsAvailable}
                                taggingClusterSession={taggingClusterSession}
                                dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                                misconception={tag}
                                handledIndex={index + 1}
                            />
                        </TableCell>
                    )
            }
            {
                historyPart2.length === 0 ?
                    <TableCell key={"static|selector|view|last"} className={classes.divLine}>Empty History</TableCell> :
                    <TableCell key={"static|selector|view|last" + historyPart2[0]} className={classes.divLine}>
                        <StaticSelectorView
                            misconceptionsAvailable={misconceptionsAvailable}
                            taggingClusterSession={taggingClusterSession}
                            dispatchTaggingClusterSession={dispatchTaggingClusterSession}
                            misconception={historyPart2[0]}
                            handledIndex={history.length}
                        />
                    </TableCell>
            }
        </>
    )
}

export default HistoryView