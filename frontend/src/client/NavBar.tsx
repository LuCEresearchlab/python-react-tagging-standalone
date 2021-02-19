import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import {Link} from "@material-ui/core";

function NavBar(){
    return (
        <AppBar position="static">
            <div>
                <Link href="/"  color="inherit">Home</Link>
                <Link href="/file_uploader" color="inherit">Upload File</Link>
                <Link href="/taggingUI" color="inherit">TaggingUI</Link>
            </div>
        </AppBar>
    )
}

export default NavBar
