import React from 'react';
import {getSessionCookie} from "./Cookie";

export interface User {
    username: string,
    password: string,
    loggedIn: boolean
}


let initial_state = getSessionCookie()

if (initial_state == null) {
    initial_state = {username: '', password: '', loggedIn: false}
}


const userContext = React.createContext<User>(initial_state);

console.log('created new context', initial_state)

export {userContext, initial_state};