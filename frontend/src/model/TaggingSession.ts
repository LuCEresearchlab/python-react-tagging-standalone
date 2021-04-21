import {Dataset, Question} from "../interfaces/Dataset";
import {TaggingClusterSessionDispatch} from "./TaggingClusterSession";
import React, {Dispatch, ReducerAction, ReducerState, useReducer} from "react";
import {initClusterSession} from "./TaggingClusterSessionDispatch";
import {NO_COLOR} from "../helpers/Util";

export interface TaggingSession {
    isLoading: Boolean;
    dataset: Dataset,
    questions: Question[],
    user_id: string,

    currentQuestion: number,

    history: string[][]
}


export enum TaggingSessionActions {
    INIT,
    NEXT_QUESTION,
    SET_CURRENT_QUESTION,
}

export interface TaggingSessionDispatch {
    type: TaggingSessionActions,
    payload: any
}


function initState(dataset: (Dataset | null), user_id: string,
                   dispatcher: React.Dispatch<TaggingClusterSessionDispatch>): any {
    if (dataset == null) return {isLoading: true, user_id}


    const questions: Question[] = dataset.questions
    const history = [...Array(questions.length)].map(() => [])

    dispatcher(initClusterSession(
        dataset.dataset_id,
        questions[0].question_id,
        user_id,
        NO_COLOR,
        history[0]
    ))
    return {
        isLoading: false,
        dataset,
        user_id,
        questions: questions,
        currentQuestion: 0,
        history: history
    }
}

function _createTaggingClusterSession(state: TaggingSession,
                                      dispatcher: React.Dispatch<TaggingClusterSessionDispatch>): void {
    dispatcher(
        initClusterSession(
            state.dataset.dataset_id,
            state.questions[state.currentQuestion].question_id,
            state.user_id,
            NO_COLOR,
            state.history[state.currentQuestion]
        )
    )
}


function next_question(state: TaggingSession) {
    const next_question_idx = state.currentQuestion + 1
    if (next_question_idx >= state.questions.length) return state
    return {
        ...state,
        currentQuestion: next_question_idx
    }
}

function set_current_question(state: TaggingSession, idx: number,
                              dispatcher: React.Dispatch<TaggingClusterSessionDispatch>) {
    if (idx === state.currentQuestion) return state
    if (0 <= idx && idx < state.questions.length) {
        const new_state = {
            ...state,
            currentQuestion: idx,
        }

        _createTaggingClusterSession(new_state, dispatcher)

        return new_state
    }
    return state
}


function reducer(dispatcher: React.Dispatch<TaggingClusterSessionDispatch>,
                 state: TaggingSession, action: TaggingSessionDispatch) {
    switch (action.type) {
        case TaggingSessionActions.NEXT_QUESTION:
            return next_question(state)
        case TaggingSessionActions.SET_CURRENT_QUESTION:
            return set_current_question(state, action.payload, dispatcher)
        case TaggingSessionActions.INIT:
            return initState(action.payload, state.user_id, dispatcher)
        default:
            return state
    }
}

const wrapped_reducer = (dispatcher: React.Dispatch<TaggingClusterSessionDispatch>) => {
    return (state: TaggingSession, action: TaggingSessionDispatch) => reducer(dispatcher, state, action)
}

function useTaggingSession(dataset: (Dataset | null), user_id: string,
                           clusterSessionDispatch: React.Dispatch<TaggingClusterSessionDispatch>):
    [ReducerState<(state: TaggingSession, action: TaggingSessionDispatch) => any>,
        Dispatch<ReducerAction<(state: TaggingSession, action: TaggingSessionDispatch) => any>>] {


    const [state, dispatch] = useReducer(wrapped_reducer(clusterSessionDispatch),
        initState(null, user_id, clusterSessionDispatch))


    return [state, dispatch]
}

export function getQuestion(state: TaggingSession): Question {
    return state.questions[state.currentQuestion]
}

export function getDatasetId(state: TaggingSession): string {
    return state.dataset.dataset_id
}


export default useTaggingSession



