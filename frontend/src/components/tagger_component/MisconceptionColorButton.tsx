import React from "react";
import {Brush, FiberManualRecord, FiberManualRecordOutlined} from "@material-ui/icons";
import {Button} from "@material-ui/core";
import stringEquals from "../../util/StringEquals";
import {HIGHLIGHT_COLOR_ELEMENT} from "../../util/Colors";

interface Input {
    color: string,
    enabled: boolean,
    current_color: string,
    staticColor: boolean,
    highlighted?: boolean,

    setColor(c: string): void
}

function MisconceptionColorButton({color, enabled, current_color, setColor, staticColor, highlighted}: Input) {

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
            style={{backgroundColor: highlighted ? HIGHLIGHT_COLOR_ELEMENT : ''}}
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