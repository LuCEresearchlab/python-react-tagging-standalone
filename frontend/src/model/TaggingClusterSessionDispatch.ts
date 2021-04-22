import {TaggingClusterSessionActions} from "./TaggingClusterSession";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";

function basic(type: TaggingClusterSessionActions, payload: any) {
    return {type: type, payload: payload}
}


const setAvailableMisconceptions = (misconceptions: MisconceptionElement[]) =>
    basic(TaggingClusterSessionActions.SET_AVAILABLE_MISCONCEPTIONS, misconceptions)
const setCurrentColor = (color: string) => basic(TaggingClusterSessionActions.SET_CURRENT_COLOR, color)
const setTags = (tags: (string | null)[]) => basic(TaggingClusterSessionActions.SET_TAGS, tags)
const setRangesList = (rangesList: HighlightRange[][]) =>
    basic(TaggingClusterSessionActions.SET_RANGES_LIST, rangesList)
const setRanges = (answer: Answer, ranges: HighlightRange[]) =>
    basic(TaggingClusterSessionActions.SET_RANGES, {answer, ranges})
const setTagsAndRanges = (tags: (string | null)[], answer: Answer, ranges: HighlightRange[]) =>
    basic(TaggingClusterSessionActions.SET_TAGS_AND_RANGES, {tags, answer, ranges})
const clusterSessionPost = () => basic(TaggingClusterSessionActions.POST, {})
const initClusterSession = (dataset_id: string,
                            question_id: string,
                            user_id: string,
                            currentColor: string,
                            history: string[]) =>
    basic(TaggingClusterSessionActions.INIT,
        {
            dataset_id,
            question_id,
            user_id,
            currentColor,
            history
        })
const setClusters = (clusters: Answer[][]) => basic(TaggingClusterSessionActions.SET_CLUSTERS, clusters)
const setCurrentCluster = (idx: number) => basic(TaggingClusterSessionActions.SET_CURRENT_CLUSTER, idx)
const popAnswer = (idx: number) => basic(TaggingClusterSessionActions.POP_ANSWER, idx)


export {
    setAvailableMisconceptions,
    setCurrentColor,
    setCurrentCluster,
    setClusters,
    setTags,
    setRangesList,
    setRanges,
    setTagsAndRanges,
    clusterSessionPost,
    initClusterSession,
    popAnswer
}