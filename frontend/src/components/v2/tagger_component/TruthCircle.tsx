import React from "react";
import {FiberManualRecord} from "@material-ui/icons";


interface Input {
    value: boolean
}

function TruthCircle({value}: Input) {
    const color: string = value ? "green" : "red"

    return (
        <div title={"Student Answer: " + value} style={{width: "inherit"}}>
            <FiberManualRecord style={{color: color, float: "left"}}/>
        </div>
    )

}

export default TruthCircle