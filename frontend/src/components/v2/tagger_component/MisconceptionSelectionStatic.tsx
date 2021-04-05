import React from "react"
import TaggingClusterSession from "../../../model/TaggingClusterSession";

interface Input {
    taggingClusterSession: TaggingClusterSession
}

function MisconceptionSelectionStatic({taggingClusterSession}: Input) {

    console.log(taggingClusterSession.history)


    return (
        <>
            Misconception Selection Static
        </>
    )
}

export default MisconceptionSelectionStatic