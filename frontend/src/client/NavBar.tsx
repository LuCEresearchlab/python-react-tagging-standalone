import React from 'react';
import {makeStyles, Link, Container, AppBar, Toolbar, List, ListItem, ListItemText} from "@material-ui/core";

const useStyles = makeStyles({
    navDisplayFlex: {
        display: `flex`,
        justifyContent: `space-between`
    },
    linkText: {
        textDecoration: `none`,
        color: `white`
    }
});

const navLinks = [
    { title: `Home`, path: `/` },
    { title: `Upload File`, path: `/file_uploader` },
    { title: `Tagging UI`, path: `/taggingUI` },
]

function NavBar(){
    const classes = useStyles();
    return (
        <AppBar position="static">
            <Toolbar>
                <Container>
                    <List
                        component="nav"
                        aria-labelledby="main navigation"
                        className={classes.navDisplayFlex}>
                        {navLinks.map(({ title, path }) => (
                            <Link href={path} key={title} className={classes.linkText}>
                                <ListItem button>
                                    <ListItemText primary={title} />
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                </Container>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar
