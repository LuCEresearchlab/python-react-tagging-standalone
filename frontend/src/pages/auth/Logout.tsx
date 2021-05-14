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
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <Button
                style={{alignSelf: 'center'}}
                variant={'contained'}
                onClick={() => {
                    setSession({username: '', password: '', loggedIn: false})
                    router.push('/login')
                }}>
                Logout
            </Button>
        </div>
    )
}

export default Logout