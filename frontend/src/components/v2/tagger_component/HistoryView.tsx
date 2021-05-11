import React, {useMemo} from "react"
import {TableCell} from "@material-ui/core";
import StaticSelectorView from "./StaticSelectorView";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {getHistory, TaggingClusterSession, TaggingClusterSessionDispatch} from "../../../model/TaggingClusterSession";

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    misconceptionsAvailable: MisconceptionElement[]
}

function HistoryView({taggingClusterSession, dispatchTaggingClusterSession, misconceptionsAvailable}: Input) {

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
                        <TableCell key={"static|selector|view|" + tag} style={{borderBottom: "none"}}>
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
                    <TableCell key={"static|selector|view|last"}>Empty History</TableCell> :
                    <TableCell key={"static|selector|view|last" + historyPart2[0]}>
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