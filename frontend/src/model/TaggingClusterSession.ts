import {getMillis, highlightRangeToColor, isNoMisconception, NO_COLOR} from "../helpers/Util";
import {HighlightRange, HighlightRangeColor} from "../interfaces/HighlightRange";
import {Answer, Cluster} from "../interfaces/Dataset";
import {postHelper, postClusters} from "../helpers/PostHelper";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";
import {arrayFilteredNotNullEquals, arrayEquals} from "../util/ArrayEquals";
import NoMisconception from "../util/NoMisconception";
import {Dispatch, ReducerAction, ReducerState, useReducer} from "react";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";

export const MAX_HISTORY_SIZE: number = 4
export const PRE_DYNAMIC_SIZE: number = MAX_HISTORY_SIZE
const MIN_LENGTH: number = 1 + PRE_DYNAMIC_SIZE + 1

export enum TaggingClusterSessionActions {
    SET_CURRENT_COLOR,
    SET_CURRENT_CLUSTER,
    SET_CLUSTERS,
    SET_TAGS,
    SET_RANGES_LIST,
    SET_RANGES,
    SET_TAGS_AND_RANGES,
    NEXT_CLUSTER,
    POP_ANSWER,
    POST,
    INIT,
    SET_AVAILABLE_MISCONCEPTIONS
}

export interface TaggingClusterSessionDispatch {
    type: TaggingClusterSessionActions,
    payload: any
}

export function newNoMiscTagList(): (string | null)[] {
    const list = initEmptyTagsList()
    list[0] = NoMisconception
    return [...list, null]
}

export function initEmptyTagsList(): (string | null)[] {
    return [...Array(PRE_DYNAMIC_SIZE + 1)].map(() => null)
}

function loadedTagsFormatAndSet(state: TaggingClusterSession, tags: (string | null)[]): (string | null)[] {
    const initialized_list: (string | null)[] = initEmptyTagsList()
    if (isNoMisconception(tags[0])) initialized_list[0] = NoMisconception
    else {
        tags
            .filter(tag => tag != null)
            .forEach(tag => {
                    const index: number = state.history.findIndex(elem => stringEquals(elem, tag))
                    if (index === -1) {
                        initialized_list.push(tag) // append tag
                        return
                    }
                    initialized_list[index + 1] = tag // skip pos 0 (reserved for NoMisconception)
                }
            )
    }
    while (
        initialized_list.length < MIN_LENGTH ||
        initialized_list[initialized_list.length - 1] != null)
        initialized_list.push(null)

    return initialized_list
}

function _history_add_if_missing(state: TaggingClusterSession, tags: (string | null)[]): void {

    if (tags == null || tags.length === 0) return;
    if (state.history.length === MAX_HISTORY_SIZE) return; // max size reached
    tags
        .filter(elem => elem != null)
        .filter(tag => !isNoMisconception(tag))
        .forEach(value => {
            const c1: boolean = state.history.length < MAX_HISTORY_SIZE
            const c2: boolean = state.history.findIndex((elem: string) => stringEquals(elem, value)) === -1
            if (c1 && c2 && typeof value === "string") { // typescript bad typechecking
                state.history.push(value)
            }
        })
}

export interface TaggingClusterSession {
    dataset_id: string,
    question_id: string,
    user_id: string,
    currentColor: string,
    clusters: Cluster[],
    currentCluster: number,
    tags: (string | null)[],
    rangesList: HighlightRange[][],
    startTaggingTime: number,
    history: string[],
    availableMisconceptions: MisconceptionElement[]
}


function init(state: TaggingClusterSession,
              payload: {
                  dataset_id: string,
                  question_id: string,
                  user_id: string,
                  currentColor: string,
                  history: string[]
              }) {
    return {
        ...state,
        dataset_id: payload.dataset_id,
        question_id: payload.question_id,
        user_id: payload.user_id,
        currentColor: payload.currentColor,
        clusters: [],
        currentCluster: 0,
        tags: [...initEmptyTagsList(), null],
        rangesList: [...Array(PRE_DYNAMIC_SIZE + 1)].map(() => []),
        startTaggingTime: getMillis(),
        history: payload.history,
        availableMisconceptions: []
    }
}

function setCurrentColor(state: TaggingClusterSession, color: string): TaggingClusterSession {
    if (stringEquals(color, state.currentColor)) return state
    state.currentColor = color
    return {
        ...state,
        currentColor: color
    }
}

function setTags(state: TaggingClusterSession, tags: (string | null)[]): TaggingClusterSession {

    _history_add_if_missing(state, tags)
    const new_tags = loadedTagsFormatAndSet(state, tags)

    if (arrayFilteredNotNullEquals(new_tags, state.tags)) return state // no change
    return {
        ...state,
        tags: new_tags,
    }
}

function setRangesList(state: TaggingClusterSession, rangesList: HighlightRange[][]): TaggingClusterSession {
    if (arrayFilteredNotNullEquals(rangesList, state.tags)) return state
    return {
        ...state,
        rangesList
    }
}

function setRanges(state: TaggingClusterSession, payload: { answer: Answer, ranges: HighlightRange[] }): TaggingClusterSession {
    const answer: Answer = payload.answer
    const ranges: HighlightRange[] = payload.ranges
    const idx = getCurrentCluster(state).answers.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
    if (idx === -1) return state
    const new_ranges = [...state.rangesList]
    new_ranges[idx] = ranges
    return {
        ...state,
        rangesList: new_ranges
    }
}

function setTagsAndRanges(state: TaggingClusterSession,
                          payload:
                              {
                                  tags: (string | null)[],
                                  answer: Answer,
                                  ranges: HighlightRange[]
                              }): TaggingClusterSession {


    const answer: Answer = payload.answer
    const tags: (string | null)[] = payload.tags
    const ranges: HighlightRange[] = payload.ranges

    const idx = getCurrentCluster(state).answers.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
    if (idx === -1) return state

    _history_add_if_missing(state, tags)

    const new_tags = loadedTagsFormatAndSet(state, tags)

    if (arrayFilteredNotNullEquals(new_tags, state.tags) &&
        arrayEquals(state.rangesList[idx], ranges)) return state

    const new_ranges = [...state.rangesList]
    new_ranges[idx] = ranges

    return {
        ...state,
        rangesList: new_ranges,
        tags: new_tags
    }
}

function setClusters(state: TaggingClusterSession, new_clusters: Cluster[]): TaggingClusterSession {
    return {
        ...state,
        clusters: new_clusters,
        rangesList: [...Array(new_clusters[state.currentCluster].answers.length)].map(() => []),
        startTaggingTime: getMillis(),
    }
}

function nextCluster(state: TaggingClusterSession) {
    const next_cluster_idx = state.currentCluster + 1
    if (next_cluster_idx < state.clusters.length) {
        return {
            ...state,
            currentCluster: next_cluster_idx,
            currentColor: NO_COLOR,
            tags: [...initEmptyTagsList(), null],
            rangesList: [...Array(state.clusters[next_cluster_idx].answers.length)].map(() => []),
            startTaggingTime: getMillis(),
        }
    } else return state
}


function setCurrentCluster(state: TaggingClusterSession, idx: number) {
    if (idx === state.currentCluster) return state
    if (0 <= idx && idx < state.clusters.length) {
        return {
            ...state,
            currentCluster: idx,
            currentColor: NO_COLOR,
            tags: [...initEmptyTagsList(), null],
            rangesList: [...Array(state.clusters[idx].answers.length)].map(() => []),
            startTaggingTime: getMillis(),
        }
    }
    return state
}

function setAvailableMisconceptions(state: TaggingClusterSession, misconceptions: MisconceptionElement[]) {
    return {
        ...state,
        availableMisconceptions: misconceptions
    }
}

function post(state: TaggingClusterSession): TaggingClusterSession {
    getCurrentCluster(state).answers.forEach((answer, index) => {
        postHelper(
            state.dataset_id,
            state.question_id,
            answer.answer_id,
            state.user_id,
            answer.data,
            getMillis() - state.startTaggingTime,
            state.rangesList[index].map(value => {
                return {
                    start: value.start,
                    end: value.end,
                    misconception: value.misconception
                }
            }), // discard extra data
            state.tags)
    })
    return state
}

function pop_answer(state: TaggingClusterSession, idx: number) {
    if (0 <= idx && idx < state.clusters.length) {
        // store current value
        post(state)

        const cluster: Cluster = state.clusters[state.currentCluster]
        const popped_answer: Answer[] = cluster.answers.slice(idx, idx + 1)
        const reduced_answers: Answer[] = cluster.answers.slice(0, idx).concat(cluster.answers.slice(idx + 1))
        const new_clusters = [...state.clusters]
        new_clusters[state.currentCluster].answers = [...reduced_answers]
        new_clusters.push({name: 'Cluster ' + new_clusters.length, answers: popped_answer})

        postClusters(state.dataset_id, state.question_id, state.user_id, new_clusters)

        return {
            ...state,
            clusters: new_clusters
        }
    }
    return state
}

function reducer(state: TaggingClusterSession, action: TaggingClusterSessionDispatch) {
    switch (action.type) {
        case TaggingClusterSessionActions.SET_CURRENT_COLOR:
            return setCurrentColor(state, action.payload)
        case TaggingClusterSessionActions.SET_TAGS:
            return setTags(state, action.payload)
        case TaggingClusterSessionActions.SET_RANGES_LIST:
            return setRangesList(state, action.payload)
        case TaggingClusterSessionActions.SET_RANGES:
            return setRanges(state, action.payload)
        case TaggingClusterSessionActions.SET_TAGS_AND_RANGES:
            return setTagsAndRanges(state, action.payload)
        case TaggingClusterSessionActions.POST:
            return post(state)
        case TaggingClusterSessionActions.SET_CURRENT_CLUSTER:
            return setCurrentCluster(state, action.payload)
        case TaggingClusterSessionActions.SET_CLUSTERS:
            return setClusters(state, action.payload)
        case TaggingClusterSessionActions.NEXT_CLUSTER:
            return nextCluster(state)
        case TaggingClusterSessionActions.POP_ANSWER:
            return pop_answer(state, action.payload)
        case TaggingClusterSessionActions.SET_AVAILABLE_MISCONCEPTIONS:
            return setAvailableMisconceptions(state, action.payload)
        case TaggingClusterSessionActions.INIT:
            return init(state, action.payload)
        default:
            return state
    }
}

const initial_state: any = {
    dataset_id: "dataset_id",
    question_id: "question_id",
    user_id: null,
    currentColor: null,
    clusters: [],
    currentCluster: -1,
    tags: [],
    rangesList: [],
    startTaggingTime: -1,
    history: []
}

function useTaggingClusterSession(): [
    ReducerState<(state: TaggingClusterSession, action: TaggingClusterSessionDispatch) => (TaggingClusterSession)>,
    Dispatch<ReducerAction<(state: TaggingClusterSession, action: TaggingClusterSessionDispatch)
        => (TaggingClusterSession)>>] {

    const [state, dispatch] = useReducer(reducer, initial_state)

    return [state, dispatch]
}

export function getRanges(state: TaggingClusterSession, answer: Answer): HighlightRangeColor[] {
    if (arrayEquals(getCurrentCluster(state).answers, [])) return []
    const idx = getCurrentCluster(state).answers.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
    if (state.rangesList.length === 0 || state.availableMisconceptions.length == 0) return []
    return state.rangesList[idx].map(elem => {
        return {
            ...elem,
            color: highlightRangeToColor(elem, state.availableMisconceptions)
        }
    })
}

export function getHistory(state: TaggingClusterSession): string[] {
    if (arrayEquals(state.history, [])) return []
    return state.history.filter(tag => tag != null)
}

export function isUsingDefaultColor(state: TaggingClusterSession): boolean {
    return isUsingDefaultColorUtil(state.currentColor)
}

export function getCurrentCluster(state: TaggingClusterSession): Cluster {
    if (state.clusters.length === 0) return {name: 'not initialized', answers: []}
    return state.clusters[state.currentCluster]
}

export function getCurrentMisconception(state: TaggingClusterSession): (string | null) {
    return isUsingDefaultColor(state) || state.clusters.length == 0 ?
        null :
        state.availableMisconceptions[
            state.availableMisconceptions.findIndex(misc => stringEquals(misc.color, state.currentColor))
            ].name
}

export default useTaggingClusterSession