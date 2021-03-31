import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import Home from "./pages/home/Home"
import NavBar from "./NavBar";
import Uploader from "./pages/upload/FileUploader"

import DatasetSelection from "./pages/tagging/DatasetSelection";
import TaggingPage from "./pages/tagging/TaggingPage";
import TaggingSummaryPage from "./pages/tagging/TaggingSummaryPage";
import TaggingDetailPage from "./pages/tagging/TaggingDetailPage";
import DiffView from "./pages/tagging/DiffView";


ReactDOM.render(
    <Router>
        <div className={"App"}>
            <NavBar/>
            <Switch>
                <Route exact path={"/"} component={Home}/>
                <Route exact path={"/taggingUI/selector"} component={DatasetSelection}/>
                <Route path={"/taggingUI/tagView/:dataset_id/:user_id"} component={TaggingPage}/>
                <Route path={"/taggingUI/summary/:dataset_id/:user_id"} component={TaggingSummaryPage}/>
                <Route path={"/taggingUI/details/:dataset_id/:tag"} component={TaggingDetailPage}/>
                <Route path={"/taggingUI/mergeView/:dataset_id/:user_id"} component={DiffView}/>
                <Route path={"/file_uploader"} component={Uploader}/>
            </Switch>
        </div>
    </Router>,
    document.getElementById('root')
)
