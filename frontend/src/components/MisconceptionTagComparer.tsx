import React, {useState} from "react";
import {Collapse, List, ListItem} from "@material-ui/core";
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

    console.log(answerGroup)
    console.log(user_id, handleClick)
    return (
        <List>
            <ListItem button onClick={handleClick}>Open</ListItem>
            <Collapse in={open} timeout={"auto"} unmountOnExit>
                <List>
                    {
                        answerGroup.map(answer =>
                            <ListItem key={answer.answer_id + '|' + answer.user_id}><MisconceptionTagElement
                                dataset_id={answer.dataset_id}
                                question_id={answer.question_id}
                                user_id={user_id}
                                answer={
                                    {
                                        answer_id:answer.answer_id,
                                        data:answer.answer_text,
                                        user_id: answer.user_id
                                    }}
                                question_text={answer.answer_text}
                                misconceptions_available={[]}/></ListItem>
                        )
                    }
                </List>
            </Collapse>
        </List>
    )
}

export default MisconceptionTagComparer