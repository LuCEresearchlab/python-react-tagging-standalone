import React, {useState} from "react";
import {Collapse, List, ListItem, Paper, Table, TableBody, TableContainer} from "@material-ui/core";
import {taggedAnswer} from "../interfaces/TaggedAnswer";
import MisconceptionTagElement from "./MisconceptionTagElement";

interface Input {
    answerGroup: taggedAnswer[],
    user_id: string,
    available_misconceptions: string[]
}

function _get_conflicts(answerGroup: taggedAnswer[], user_id: string): taggedAnswer[] {
    const has_my_answer: boolean = answerGroup.some(
        (element: taggedAnswer) => element.user_id.localeCompare(user_id) === 0
    )
    if (!has_my_answer || answerGroup.length === 1) // only tagged by user or not tagged by user
        return []

    const my_answer: taggedAnswer = answerGroup[0]
    const other_answers = answerGroup.slice(1)

    const conflicts: taggedAnswer[] = other_answers.filter(answer => {
        const shared_tags: string[] = answer.tags.filter(x => my_answer.tags.indexOf(x) !== -1)
        return shared_tags.length != my_answer.tags.length || shared_tags.length != answer.tags.length
    })

    return [my_answer, ...conflicts]
}

function MisconceptionTagComparer({answerGroup, user_id, available_misconceptions}: Input) {

    const [open, setOpen] = useState<boolean>(true);

    const handleClick = () => {
        setOpen(!open);
    };

    const conflicts: taggedAnswer[] = _get_conflicts(answerGroup, user_id)

    if (conflicts.length === 0)
        return <></>

    return (
        <List>
            <ListItem button onClick={handleClick}>Answer {conflicts[0].answer_id}</ListItem>
            <Collapse in={open} timeout={0} unmountOnExit>
                <List>
                    {
                        conflicts.map(answer =>
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
                                                misconceptions_available={available_misconceptions}/>
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