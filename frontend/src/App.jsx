import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import Home from "./pages/Home"
import NavBar from "./NavBar";
import Uploader from "./pages/FileUploader"

import DatasetSelection from "./pages/DatasetSelection";
import TaggingPage from "./pages/TaggingPage";
import TaggingSummaryPage from "./pages/TaggingSummaryPage";
import TaggingDetailPage from "./pages/TaggingDetailPage";
import MergeView from "./pages/MergeView";


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
                <Route path={"/taggingUI/mergeView/:dataset_id/:user_id"} component={MergeView}/>
                <Route path={"/file_uploader"} component={Uploader}/>
            </Switch>
        </div>
    </Router>,
    document.getElementById('root')
)
