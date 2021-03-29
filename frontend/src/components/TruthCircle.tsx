import React from "react";
import {FiberManualRecord} from "@material-ui/icons";


interface Input {
    value: boolean
}

function TruthCircle({value}: Input) {
    const color: string = value ? "green" : "red"

    return (
        <FiberManualRecord style={{color: color, float: "left"}}/>
    )

}

export default TruthCircle