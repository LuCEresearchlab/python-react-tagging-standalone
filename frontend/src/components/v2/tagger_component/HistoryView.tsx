import React from "react"
import {TaggingClusterSessionWithMethods} from "../../../model/TaggingClusterSession";
import {TableCell} from "@material-ui/core";
import StaticSelectorView from "./StaticSelectorView";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {GettersTaggingSession} from "../../../model/TaggingSession";

interface Input {
    taggingClusterSession: TaggingClusterSessionWithMethods,
    misconceptionsAvailable: MisconceptionElement[],
    getters: GettersTaggingSession
}

function HistoryView({taggingClusterSession, misconceptionsAvailable, getters}: Input) {

    const history = getters.getHistory()
    const historyPart1 = history.slice(0, history.length - 1)
    const historyPart2 = history.slice(history.length - 1)

    return (
        <>
            {
                historyPart1.length === 0 ?
                    <></> :
                    historyPart1.map((tag: string, index: number) =>
                        <TableCell key={"static|selector|view|" + tag} style={{borderBottom: "none"}}>
                            <StaticSelectorView
                                misconceptionsAvailable={misconceptionsAvailable}
                                taggingClusterSessionWithMethods={taggingClusterSession}
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
                            taggingClusterSessionWithMethods={taggingClusterSession}
                            misconception={historyPart2[0]}
                            handledIndex={history.length}
                        />
                    </TableCell>
            }
        </>
    )
}

export default HistoryView