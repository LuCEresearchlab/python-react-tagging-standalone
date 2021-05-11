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
                    setTimeout(() => setCommand(''), 0)
                    return
                }  // some element is selected (typing)

                const key = event.key

                console.log('withKeyboard', command + key)
                if (key == ' ') event.preventDefault() // prevent scroll on space in case of scrollable page

                if (key == 'Escape') {
                    setTimeout(() => setCommand(''), 0)
                } else if (key == 'Enter' || key == ' ') {
                    try {
                        const c_copy = command
                        setTimeout(() => action(c_copy), 0)
                    } catch (e) {
                        console.log(e)
                    }
                    setTimeout(() => setCommand(''), 0)
                } else if (key === "Backspace" || key === "Delete") {
                    setTimeout(() => setCommand(command.substring(0, command.length - 1)), 0)
                } else if (key.length == 1 && allowedInputs.test(key)) {
                    setTimeout(() => setCommand(command + key), 0)
                }
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