import React, {useContext} from "react"
import {Button} from "@material-ui/core";
import {User, userContext} from "../../util/UserContext";
import {useHistory} from "react-router-dom";

interface Input {
    setSession(session: User): void
}

function Logout({setSession}: Input) {

    const router = useHistory()

    const {username} = useContext(userContext)

    if (username == undefined || username.length == 0) router.push('/login')

    return (
        <Button
            variant={'contained'}
            onClick={() => {
                setSession({username: '', password: '', loggedIn: false})
                router.push('/login')
            }}
            style={{marginLeft: '50%'}}>
            Logout
        </Button>
    )
}

export default Logout