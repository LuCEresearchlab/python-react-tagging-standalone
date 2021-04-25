import React, {useContext, useState} from "react"
import {Button, TextField} from "@material-ui/core";
import {JSONLoader} from "../../helpers/LoaderHelper";
import {User, userContext} from "../../util/UserContext";
import {FiberManualRecord} from "@material-ui/icons";
import {useHistory} from "react-router-dom";

const {TAGGING_SERVICE_URL} = require('../../../config.json')

interface Input {
    setSession(session: User): void
}

function Login({setSession}: Input) {

    const [available, setAvailable] = useState<boolean>(false)
    const [username_local, setUsername] = useState<string>('')
    const [password_local, setPassword] = useState<string>('')


    const router = useHistory()
    const url: string = `${TAGGING_SERVICE_URL}/auth`

    const {loggedIn} = useContext(userContext)
    if (loggedIn != undefined && loggedIn) router.push('/taggingUI/selector')


    const check_available = (name: string) => JSONLoader(`${url}/exists/${name}`,
        (isAvailable: boolean) => setAvailable(!isAvailable)
    )


    const register = (action: string, next: Function) => {
        fetch(url + action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({username: username_local, password: password_local})
        })
            .then(response => {
                    return response.json()
                }
            )
            .then(body => {
                console.log(body)
                next(body)
            })
    }

    const handle_button = (available: boolean) => {
        if (available) {
            register('/register', (user: User) => {
                setSession({
                    username: user.username,
                    password: user.password,
                    loggedIn: true
                })
            })
        } else {
            register('/login', (success: boolean) => {
                if (success) {
                    setSession({
                        username: username_local,
                        password: password_local,
                        loggedIn: true
                    })
                }
            })
        }
    }


    return (
        <>
            <TextField
                value={username_local}
                label={"Username"}
                onChange={(e) => {
                    setUsername(e.target.value)
                    if (e.target.value.length > 0) check_available(e.target.value)
                    else setAvailable(false)
                }}/>
            <TextField
                type={'password'}
                value={password_local}
                label={"Password"}
                onChange={(e) => setPassword(e.target.value)}/>
            <Button onClick={() => handle_button(available)}>
                Login
            </Button>
            <FiberManualRecord style={{color: available ? 'green' : 'red'}}/>
        </>
    )

}

export default Login