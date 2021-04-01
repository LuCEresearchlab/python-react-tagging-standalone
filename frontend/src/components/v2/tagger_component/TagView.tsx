import React from "react"
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";

interface Input {
    misconceptionsAvailable: MisconceptionElement[]
}

function TagView({misconceptionsAvailable}: Input) {

    console.log(misconceptionsAvailable)

    return (
        <>
            TagView
        </>
    )
}

export default TagView