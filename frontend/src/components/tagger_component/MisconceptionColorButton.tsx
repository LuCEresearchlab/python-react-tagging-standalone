import React from "react";
import {Brush, FiberManualRecord, FiberManualRecordOutlined} from "@material-ui/icons";
import {Button} from "@material-ui/core";
import stringEquals from "../../util/StringEquals";

interface Input {
    color: string,
    enabled: boolean,
    current_color: string,
    staticColor: boolean,

    setColor(c: string): void
}

function MisconceptionColorButton({color, enabled, current_color, setColor, staticColor}: Input) {

    const disabled: boolean = stringEquals(color, "") || stringEquals(color, "#000000")

    if (disabled) return (<Button disabled={true}/>)

    if (staticColor && !enabled) return (<Button disabled={true}/>)

    if (!enabled) return (<Button disabled={true}><FiberManualRecord style={{color: color}}/></Button>)

    return (
        <Button
            title={"Select Misconception for highlighting"}
            onClick={() => {
                setColor(color)
            }}
            disabled={disabled || !enabled}
        >
            {
                stringEquals(color, current_color) ?
                    <Brush style={{color: color}}/> :
                    <FiberManualRecordOutlined
                        style={{color: color}}
                    />
            }
        </Button>
    )
}

export default MisconceptionColorButton