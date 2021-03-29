import React from "react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
// https://www.npmjs.com/package/react-syntax-highlighter

function parseString(text: string) {
    const tokens: JSX.Element[] = []
    let temp_string: string = text
    let index: number = 0

    const get_next_type = () => {
        if (temp_string.startsWith("```java\n"))
            return "java"
        if (temp_string.startsWith("!["))
            return "image"

        return "text"
    }

    const insert_next_token = (element_type: string) => {
        if (element_type == "java") {
            let end = temp_string.indexOf("```", 8)
            let code_block = temp_string.slice(8, end)
            tokens.push(
                <SyntaxHighlighter language={"java"} key={"code" + index}>{code_block}</SyntaxHighlighter>
            )
            temp_string = temp_string.slice(end + 3)
        } else if (element_type == "image") {
            const size: string = temp_string.slice(2, temp_string.indexOf("]"))
            let position = temp_string.indexOf("]") + 2
            let end = temp_string.indexOf(")")
            let img = temp_string.slice(position, end)
            temp_string = temp_string.slice(end + 1)
            tokens.push(
                <img alt={"retrieved-from-server"} src={img} width={size} key={"image" + index}/>
            )
        } else if (element_type == "text") {
            let end = 0
            if (temp_string.indexOf("```") != -1) {
                end = temp_string.indexOf("```")
                tokens.push(
                    <pre key={"text" + index} style={{overflow: "auto"}}>
                        <code>
                            {temp_string.slice(0, end)}
                        </code>
                    </pre>
                )
                temp_string = temp_string.slice(end)
            } else if (temp_string.indexOf("![") != -1) {
                end = temp_string.indexOf("![")
                tokens.push(
                    <pre key={"text" + index} style={{overflow: "auto"}}>
                        <code>
                            {temp_string.slice(0, end)}
                        </code>
                    </pre>
                )
                temp_string = temp_string.slice(end)
            } else {
                tokens.push(
                    <pre key={"text" + index} style={{overflow: "auto"}}>
                        <code>
                            {temp_string}
                        </code>
                    </pre>
                )
                temp_string = ""
            }
        }
        index++
    }

    while (temp_string.length > 0) insert_next_token(get_next_type())

    return tokens
}

export default parseString