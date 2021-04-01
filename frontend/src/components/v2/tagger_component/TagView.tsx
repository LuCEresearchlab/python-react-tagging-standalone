import React from "react"
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import TaggingClusterSession from "../../../model/TaggingClusterSession";
import MisconceptionView from "./MisconceptionView";

interface Input {
    misconceptionsAvailable: MisconceptionElement[],
    taggingClusterSession: TaggingClusterSession,
    my_key: number
}

function TagView({misconceptionsAvailable, taggingClusterSession, my_key}: Input) {


    return (
        <MisconceptionView
            key={"MisconceptionView|" + my_key}
            clusterTaggingSession={taggingClusterSession}
            misconceptionsAvailable={misconceptionsAvailable}
        />
    )
}

export default TagView