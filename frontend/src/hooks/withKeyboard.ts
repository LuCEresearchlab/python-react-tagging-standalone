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
                console.log(key)
                if (key == 'Enter' || key == ' ') {
                    action(command)
                    setCommand('')
                } else if (key === "Backspace" || key === "Delete") {
                    setCommand('')
                } else if (key.length == 1 && allowedInputs.test(key)) {
                    setCommand(command + key)
                }
            }

            window.addEventListener('keydown', func)

            return () => {
                window.removeEventListener('keydown', func)
            }
        },
        [action])

    return [command]
}

export default withKeyboard