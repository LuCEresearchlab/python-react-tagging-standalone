// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React, {useContext} from 'react'
import {Redirect, Route} from 'react-router-dom'
import {userContext} from "../../util/UserContext";

interface Props {
    component: React.FC,
    path: string,
    exact: boolean
}


const LoginRoute: React.FC<{
    component: React.FC;
    path: string;
    exact: boolean;
}> = (props: Props) => {

    // Add your own authentication on the below line.
    const {loggedIn} = useContext(userContext)

    return !loggedIn ? (<Route path={props.path} exact={props.exact} component={props.component}/>) :
        (<Redirect to="/taggingUI/selector"/>);
};
export default LoginRoute