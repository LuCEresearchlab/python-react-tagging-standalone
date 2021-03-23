import React from "react";
import {FiberManualRecord, FiberManualRecordOutlined} from "@material-ui/icons";
import {Button} from "@material-ui/core";

interface Input {
    color: string,
    enabled: boolean,
    current_color: string,

    setColor(c: string): void
}

function MisconceptionColorButton({color, enabled, current_color, setColor}: Input) {

    const disabled: boolean = (color.localeCompare("") == 0) || (color.localeCompare("#000000") == 0)

    if (disabled) return (<Button disabled={true}/>)

    return (
        <Button
            title={"Select Misconception for highlighting"}
            onClick={() => {
                setColor(color)
            }}
            disabled={disabled || !enabled}
        >
            {
                color.localeCompare(current_color) == 0 || !enabled ?
                    <FiberManualRecord style={{color: color}}/> :
                    <FiberManualRecordOutlined
                        style={{color: color}}
                    />
            }
        </Button>
    )
}

export default MisconceptionColorButton