import {useEffect, useState} from "react";


function withKeyboard(action: (command: string) => void) {

    const [command, setCommand] = useState<string>("")


    useEffect(() => {

            const func = (event: KeyboardEvent) => {
                const key = event.key
                console.log(key)
                if (key == 'Enter' || key == ' ') {
                    action(command)
                    setCommand('')
                } else if (key === "Backspace" || key === "Delete") {
                    setCommand('')
                } else {
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