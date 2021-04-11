import {Answer, Dataset, Question} from "../interfaces/Dataset";
import {TaggingClusterSessionDispatch} from "./TaggingClusterSession";
import React, {Dispatch, ReducerAction, ReducerState, useReducer} from "react";
import {clusterSessionPost, initClusterSession} from "./TaggingClusterSessionDispatch";
import {NO_COLOR} from "../helpers/Util";

export interface TaggingSession {
    isLoading: Boolean;
    dataset: Dataset,
    questions: Question[],
    user_id: string,

    currentQuestion: number,
    clusters: Answer[][],
    currentCluster: number,

    history: string[][]
}


export enum TaggingSessionActions {
    INIT,
    NEXT_QUESTION,
    NEXT_CLUSTER,
    SET_CURRENT_QUESTION,
    SET_CURRENT_CLUSTER,
    POP_ANSWER
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
        questions[0].clustered_answers[0],
        [],
        history[0]
    ))
    return {
        isLoading: false,
        dataset,
        user_id,
        questions: questions,
        currentQuestion: 0,
        currentCluster: 0,
        clusters: questions[0].clustered_answers,
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
            state.clusters[state.currentCluster],
            [],
            state.history[state.currentQuestion]
        )
    )
}

function next_cluster(state: TaggingSession, dispatcher: React.Dispatch<TaggingClusterSessionDispatch>) {
    const next_cluster_idx = state.currentCluster + 1
    if (next_cluster_idx < state.clusters.length) {
        const new_state = {
            ...state,
            currentCluster: next_cluster_idx
        }

        _createTaggingClusterSession(new_state, dispatcher)

        return new_state
    } else return state
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
            currentCluster: 0,
            clusters: state.questions[idx].clustered_answers
        }

        _createTaggingClusterSession(new_state, dispatcher)

        return new_state
    }
    return state
}

function set_current_cluster(state: TaggingSession, idx: number,
                             dispatcher: React.Dispatch<TaggingClusterSessionDispatch>) {
    if (idx === state.currentCluster) return state
    if (0 <= idx && idx < state.clusters.length) {
        const new_state = {
            ...state,
            currentCluster: idx
        }

        _createTaggingClusterSession(new_state, dispatcher)

        return new_state
    }
    return state
}

function pop_answer(state: TaggingSession, idx: number,
                    dispatcher: React.Dispatch<TaggingClusterSessionDispatch>) {
    if (0 <= idx && idx < state.clusters.length) {
        // store current value
        dispatcher(clusterSessionPost())

        const cluster = state.clusters[state.currentCluster]
        const popped: Answer[] = cluster.slice(idx, idx + 1)
        const reduced_cluster: Answer[] = cluster.slice(0, idx).concat(cluster.slice(idx + 1))
        const new_clusters = [...state.clusters]
        new_clusters[state.currentCluster] = [...reduced_cluster].concat(popped)


        const new_state = {
            ...state,
            clusters: new_clusters
        }
        _createTaggingClusterSession(new_state, dispatcher)
        return new_state
    }
    return state
}

function reducer(dispatcher: React.Dispatch<TaggingClusterSessionDispatch>,
                 state: TaggingSession, action: TaggingSessionDispatch) {
    switch (action.type) {
        case TaggingSessionActions.NEXT_CLUSTER:
            return next_cluster(state, dispatcher)
        case TaggingSessionActions.NEXT_QUESTION:
            return next_question(state)
        case TaggingSessionActions.SET_CURRENT_QUESTION:
            return set_current_question(state, action.payload, dispatcher)
        case TaggingSessionActions.SET_CURRENT_CLUSTER:
            return set_current_cluster(state, action.payload, dispatcher)
        case TaggingSessionActions.POP_ANSWER:
            return pop_answer(state, action.payload, dispatcher)
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


export function getCluster(state: TaggingSession): Answer[] {
    return state.clusters[state.currentCluster]
}

export function getQuestion(state: TaggingSession): Question {
    return state.questions[state.currentQuestion]
}


export default useTaggingSession



