import React from "react"
import TaggingClusterSession from "../../../model/TaggingClusterSession";
import {TableCell} from "@material-ui/core";
import StaticSelectorView from "./StaticSelectorView";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";

interface Input {
    taggingClusterSession: TaggingClusterSession,
    misconceptionsAvailable: MisconceptionElement[],
    my_key: number
}

function HistoryView({taggingClusterSession, misconceptionsAvailable, my_key}: Input) {

    const history = taggingClusterSession.getHistory()
    const historyPart1 = history.slice(0, history.length - 1)
    const historyPart2 = history.slice(history.length - 1)

    return (
        <>
            {
                historyPart1.length === 0 ?
                    <></> :
                    historyPart1.map((tag: string, index: number) =>
                        <TableCell key={"static|selector|view|" + tag + my_key} style={{borderBottom: "none"}}>
                            <StaticSelectorView
                                misconceptionsAvailable={misconceptionsAvailable}
                                taggingClusterSession={taggingClusterSession}
                                misconception={tag}
                                handledIndex={index + 1}
                            />
                        </TableCell>
                    )
            }
            {
                historyPart2.length === 0 ?
                    <TableCell key={"static|selector|view|last" + my_key}>Empty History</TableCell> :
                    <TableCell key={"static|selector|view|last" + my_key}>
                        <StaticSelectorView
                            misconceptionsAvailable={misconceptionsAvailable}
                            taggingClusterSession={taggingClusterSession}
                            misconception={historyPart2[0]}
                            handledIndex={history.length}
                        />
                    </TableCell>
            }
        </>
    )
}

export default HistoryView