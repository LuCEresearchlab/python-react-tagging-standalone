import React, {useState} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Switch} from "react-router-dom"

import NavBar from "./NavBar";
import Uploader from "./pages/upload/FileUploader"

import DatasetSelection from "./pages/tagging/DatasetSelection";
import TaggingPage from "./pages/tagging/TaggingPage";
import TaggingSummaryPage from "./pages/tagging/TaggingSummaryPage";
import TaggingDetailPage from "./pages/tagging/TaggingDetailPage";
import DiffView from "./pages/tagging/DiffView";
import {userContext} from "./util/UserContext";
import Login from "./pages/auth/Login";
import {getSessionCookie, setSessionCookie} from "./util/Cookie";
import Logout from "./pages/auth/Logout";
import PrivateRoute from "./pages/auth/PrivateRoute";
import LoginRoute from "./pages/auth/LoginRoute";


function App() {
    const [session, setSession] = useState(getSessionCookie())

    const update_session = (data) => {
        setSession(data)
        setSessionCookie(data)
        console.log('save cookies')
    }


    return (
        <Router>
            <div className={"App"}>
                <NavBar/>
                <userContext.Provider value={session}>
                    <Switch>
                        <LoginRoute exact path={"/"} component={() => <Login setSession={update_session}/>}/>
                        <LoginRoute exact path={"/login"} component={() => <Login setSession={update_session}/>}/>
                        <PrivateRoute exact path={"/logout"} component={() => <Logout setSession={update_session}/>}/>
                        <PrivateRoute exact path={"/taggingUI/selector"} component={DatasetSelection}/>
                        <PrivateRoute exact path={"/taggingUI/tagView/:dataset_id/:user_id"} component={TaggingPage}/>
                        <PrivateRoute exact path={"/taggingUI/summary/:dataset_id/:user_id"}
                                      component={TaggingSummaryPage}/>
                        <PrivateRoute exact path={"/taggingUI/details/:dataset_id/:tag"} component={TaggingDetailPage}/>
                        <PrivateRoute exact path={"/taggingUI/mergeView/:dataset_id/:user_id"} component={DiffView}/>
                        <PrivateRoute exact path={"/file_uploader"} component={Uploader}/>
                    </Switch>
                </userContext.Provider>
            </div>
        </Router>
    )
}

ReactDOM.render(<App/>, document.getElementById('root'))
