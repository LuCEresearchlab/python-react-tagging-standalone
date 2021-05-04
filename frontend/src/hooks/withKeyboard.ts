import {useEffect, useState} from "react";


const allowedInputs = /^[0-9a-zA-Z]$/.compile();

function withKeyboard(action: (command: string) => void) {

    const [command, setCommand] = useState<string>("")


    useEffect(() => {

            const func = (event: KeyboardEvent) => {

                const target: any = event.target

                if (
                    document.activeElement != null &&
                    document.activeElement.localName != 'body' ||
                    (target != null && target.id != 'body')
                ) {
                    setCommand('')
                    return
                }  // some element is selected (typing)

                event.preventDefault() // prevent scroll on space in case of scrollable page
                const key = event.key
                if (key == 'Escape') {
                    setCommand('')
                } else if (key == 'Enter' || key == ' ') {
                    try {
                        action(command)
                    } catch (e) {
                        console.log(e)
                    }
                    setCommand('')
                } else if (key === "Backspace" || key === "Delete") {
                    setCommand(command.substring(0, command.length - 1))
                } else if (key.length == 1 && allowedInputs.test(key)) {
                    console.log(key, allowedInputs.test(key))
                    setCommand(command + key)
                } else setCommand('')
            }

            document.addEventListener('keydown', func)

            return () => {
                document.removeEventListener('keydown', func)
            }
        },
        [action])

    return [command]
}

export default withKeyboard