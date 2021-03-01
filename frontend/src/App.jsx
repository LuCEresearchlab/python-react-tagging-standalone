import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import taggingUI from "./pages/TaggingUI";
import Home from "./pages/Home"
import NavBar from "./NavBar";
import Uploader from "./pages/FileUploader"


ReactDOM.render(
    <Router>
        <div className={"App"}>
            <NavBar/>
            <Switch>
                <Route exact path={"/"} component={Home}/>
                <Route path={"/taggingUI"} component={taggingUI}/>
                <Route path={"/file_uploader"} component={Uploader}/>
            </Switch>
        </div>
    </Router>,
    document.getElementById('root')
)
