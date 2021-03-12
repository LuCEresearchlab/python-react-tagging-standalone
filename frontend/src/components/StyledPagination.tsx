import {Pagination} from "@material-ui/lab";
import {createStyles, withStyles} from "@material-ui/core/styles";


export const StyledPagination = withStyles(() =>
    createStyles({
        root: {
            width: '100%'
        },
        ul: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center'
        }
    })
)(Pagination)
