import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import Home from "./pages/Home"
import NavBar from "./NavBar";
import Uploader from "./pages/FileUploader"

import DatasetSelection from "./pages/DatasetSelection";
import TaggingPage from "./pages/TaggingPage";


ReactDOM.render(
    <Router>
        <div className={"App"}>
            <NavBar/>
            <Switch>
                <Route exact path={"/"} component={Home}/>
                <Route exact path={"/taggingUI/selector"} component={DatasetSelection}/>
                <Route path={"/taggingUI/tagView/:dataset_id"} component={TaggingPage}/>
                <Route path={"/file_uploader"} component={Uploader}/>
            </Switch>
        </div>
    </Router>,
    document.getElementById('root')
)
