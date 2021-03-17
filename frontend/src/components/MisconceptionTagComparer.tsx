import React, {useState} from "react";
import {Collapse, List, ListItem, Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import MisconceptionTagElement from "./MisconceptionTagElement";

interface Input {
    answerGroup: taggedAnswer[],
    user_id: string
}

function MisconceptionTagComparer({answerGroup, user_id}: Input) {

    const [open, setOpen] = useState<boolean>(true);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <List>
            <ListItem button onClick={handleClick}>Open</ListItem>
            <Collapse in={open} timeout={0} unmountOnExit>
                <List>
                    {
                        answerGroup.map(answer =>
                            <ListItem key={answer.answer_id + '|' + answer.user_id}>
                                <TableContainer component={Paper}>
                                    <Table aria-label="customized table">
                                        <TableBody>
                                            <MisconceptionTagElement
                                                dataset_id={answer.dataset_id}
                                                question_id={answer.question_id}
                                                user_id={answer.user_id}
                                                enabled={answer.user_id.localeCompare(user_id) === 0}
                                                answer={
                                                    {
                                                        answer_id: answer.answer_id,
                                                        data: answer.answer_text,
                                                        user_id: answer.user_id
                                                    }}
                                                question_text={""}
                                                misconceptions_available={[]}/>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </ListItem>
                        )
                    }
                </List>
            </Collapse>
        </List>
    )
}

export default MisconceptionTagComparer