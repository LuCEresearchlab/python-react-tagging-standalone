import React from "react";
import {FiberManualRecord} from "@material-ui/icons";
import {Button} from "@material-ui/core";


function MisconceptionColorButton(){
    return(
        <Button title={"Select Misconception for highlighting"} disabled={true}>
            <FiberManualRecord style={{color: "red"}}/>
        </Button>
    )
}

export default MisconceptionColorButton