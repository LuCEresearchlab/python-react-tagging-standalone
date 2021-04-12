import {TaggingSessionActions} from "./TaggingSession";

function basic(type: TaggingSessionActions, payload: any) {
    return {type: type, payload: payload}
}

const nextCluster = () => basic(TaggingSessionActions.NEXT_CLUSTER, {})
const nextQuestion = () => basic(TaggingSessionActions.NEXT_QUESTION, {})
const setCurrentQuestion = (idx: number) => basic(TaggingSessionActions.SET_CURRENT_QUESTION, idx)
const setCurrentCluster = (idx: number) => basic(TaggingSessionActions.SET_CURRENT_CLUSTER, idx)
const popAnswer = (idx: number) => basic(TaggingSessionActions.POP_ANSWER, idx)

export {
    nextCluster,
    nextQuestion,
    setCurrentCluster,
    setCurrentQuestion,
    popAnswer
}