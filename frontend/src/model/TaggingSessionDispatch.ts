import {TaggingSessionActions} from "./TaggingSession";

function basic(type: TaggingSessionActions, payload: any) {
    return {type: type, payload: payload}
}

const nextQuestion = () => basic(TaggingSessionActions.NEXT_QUESTION, {})
const setCurrentQuestion = (idx: number) => basic(TaggingSessionActions.SET_CURRENT_QUESTION, idx)

export {
    nextQuestion,
    setCurrentQuestion
}