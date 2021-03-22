import React from "react";
import {FiberManualRecord} from "@material-ui/icons";
import {Button} from "@material-ui/core";

interface Input {
    color: string
}

function MisconceptionColorButton({color}: Input){

    return(
        <Button title={"Select Misconception for highlighting"} disabled={true}>
            <FiberManualRecord style={{color: color}}/>
        </Button>
    )
}

export default MisconceptionColorButton