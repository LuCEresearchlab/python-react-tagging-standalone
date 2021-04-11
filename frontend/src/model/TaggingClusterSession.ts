import {getMillis, isNoMisconception, NO_COLOR} from "../helpers/Util";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import postAnswer from "../helpers/PostAnswer";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";
import {arrayFilteredNotNullEquals, arrayEquals} from "../util/ArrayEquals";
import NoMisconception from "../util/NoMisconception";
import React, {useReducer} from "react";

const MAX_HISTORY_SIZE: number = 4
export const PRE_DYNAMIC_SIZE: number = MAX_HISTORY_SIZE

export enum TaggingClusterSessionActions {
    INIT,
    SET_CURRENT_COLOR,
    SET_TAGS,
    SET_RANGES_LIST,
    SET_RANGES,
    SET_TAGS_AND_RANGES,
    POST
}

export interface TaggingClusterSessionDispatch {
    type: TaggingClusterSessionActions,
    payload: any
}

export interface TaggingClusterSessionWithMethods {
    clusterSession: TaggingClusterSession,
    clusterSessionDispatch: React.Dispatch<TaggingClusterSessionDispatch>
}

export function newNoMiscTagList(): (string | null)[] {
    const list = initEmptyTagsList()
    list[0] = NoMisconception
    return list
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
        initialized_list.length <= MAX_HISTORY_SIZE + 1 ||
        initialized_list[initialized_list.length - 1] != null)
        initialized_list.push(null)

    return initialized_list
}

function _history_add_if_missing(state: TaggingClusterSession, tags: (string | null)[]): void {
    if (tags == null || tags.length === 0) return
    if (state.history.length === MAX_HISTORY_SIZE) return // max size reached
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
    cluster: Answer[],
    tags: (string | null)[],
    rangesList: HighlightRange[][],
    startTaggingTime: number,
    history: string[]
}


function init(state: TaggingClusterSession,
              payload: {
                  dataset_id: string,
                  question_id: string,
                  user_id: string,
                  currentColor: string,
                  cluster: Answer[],
                  tags: (string | null)[],
                  history: string[]
              }) {
    return {
        dataset_id: payload.dataset_id,
        question_id: payload.question_id,
        user_id: payload.user_id,
        currentColor: payload.currentColor,
        cluster: payload.cluster,
        tags: initEmptyTagsList(),
        rangesList: [...Array(payload.cluster.length)].map(() => []),
        startTaggingTime: getMillis(),
        history: payload.history
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
    const new_tags = loadedTagsFormatAndSet(state, tags)
    if (arrayFilteredNotNullEquals(new_tags, state.tags)) return state // no change
    console.log("setTags")
    _history_add_if_missing(state, tags)
    return {
        ...state,
        tags: new_tags
    }
}

function setRangesList(state: TaggingClusterSession, rangesList: HighlightRange[][]): TaggingClusterSession {
    if (arrayFilteredNotNullEquals(rangesList, state.tags)) return state
    console.log("setRangesList")
    return {
        ...state,
        rangesList
    }
}

function setRanges(state: TaggingClusterSession, payload: { answer: Answer, ranges: HighlightRange[] }): TaggingClusterSession {
    const answer: Answer = payload.answer
    const ranges: HighlightRange[] = payload.ranges
    const idx = state.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
    if (idx === -1) return state
    console.log("setRanges")
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

    console.log("setTagsAndRanges current", state)

    const answer: Answer = payload.answer
    const tags: (string | null)[] = payload.tags
    const ranges: HighlightRange[] = payload.ranges

    const idx = state.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
    if (idx === -1) return state

    const new_tags = loadedTagsFormatAndSet(state, tags)

    if (arrayFilteredNotNullEquals(new_tags, state.tags) &&
        arrayEquals(state.rangesList[idx], ranges)) return state

    _history_add_if_missing(state, tags)

    const new_ranges = [...state.rangesList]
    new_ranges[idx] = ranges

    console.log("setTagsAndRanges to", {
        ...state,
        rangesList: new_ranges,
        tags: new_tags
    })
    return {
        ...state,
        rangesList: new_ranges,
        tags: new_tags
    }
}

function post(state: TaggingClusterSession): TaggingClusterSession {
    state.cluster.forEach((answer, index) => {
        postAnswer(
            state.dataset_id,
            state.question_id,
            answer.answer_id,
            state.user_id,
            answer.data,
            getMillis() - state.startTaggingTime,
            state.rangesList[index],
            state.tags)
    })
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
        case TaggingClusterSessionActions.INIT:
            return init(state, action.payload)
        default:
            return state
    }
}

const initial_state: any = {
    dataset_id: "dataset_id",
    question_id: "question_id",
    user_id: "user_id",
    currentColor: NO_COLOR,
    cluster: [],
    tags: [],
    rangesList: [],
    startTaggingTime: -1,
    history: []
}

function useTaggingClusterSession() {


    const [state, dispatch] = useReducer(reducer, initial_state)

    function getRanges(answer: Answer): HighlightRange[] {
        if (arrayEquals(state.cluster, [])) return []
        const idx = state.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return []
        return state.rangesList[idx]
    }

    function getHistory(): string[] {
        if (arrayEquals(state.history, [])) return []
        return state.history.filter(tag => tag != null)
    }

    function isUsingDefaultColor(): boolean {
        return isUsingDefaultColorUtil(state.currentColor)
    }

    const getters: {
        getRanges: (answer: Answer) => HighlightRange[],
        getHistory: () => string[],
        isUsingDefaultColor: () => boolean
    } = {
        getRanges,
        getHistory,
        isUsingDefaultColor
    }

    console.log("useTaggingClusterSession", state)

    return {clusterSession: state, clusterSessionDispatch: dispatch, ClusterSessionGetters: getters}
}

export default useTaggingClusterSession