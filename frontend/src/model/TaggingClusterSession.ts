import {getMillis, isNoMisconception, NO_COLOR} from "../helpers/Util";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import postAnswer from "../helpers/PostAnswer";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";
import {arrayFilteredNotNullEquals, arrayEquals} from "../util/ArrayEquals";
import NoMisconception from "../util/NoMisconception";

const MAX_HISTORY_SIZE: number = 4
export const PRE_DYNAMIC_SIZE: number = MAX_HISTORY_SIZE

export function newNoMiscTagList(): (string | null)[] {
    const list = initEmptyTagsList()
    list[0] = NoMisconception
    return list
}

export function initEmptyTagsList(): (string | null)[] {
    return [...Array(PRE_DYNAMIC_SIZE + 1)].map(() => null)
}

class TaggingClusterSession {

    dataset_id: string
    question_id: string
    user_id: string
    startTaggingTime: number

    updateKey: Function

    cluster: Answer[]
    currentColor: string
    tags: (string | null)[]
    rangesList: HighlightRange[][]

    history: string[]

    constructor(dataset_id: string, question_id: string, user_id: string, cluster: Answer[], updateKey: Function,
                history: string[]) {
        this.dataset_id = dataset_id
        this.question_id = question_id
        this.user_id = user_id
        this.currentColor = NO_COLOR
        this.cluster = cluster
        this.tags = initEmptyTagsList()
        this.rangesList = [...Array(cluster.length)].map(() => [])
        this.startTaggingTime = getMillis()
        this.updateKey = updateKey
        this.history = history
        console.log(PRE_DYNAMIC_SIZE)
        console.log(this.tags)
    }

    _render(): void {
        this.updateKey(getMillis())
    }

    _history_add_if_missing(tags: (string | null)[]): void {
        if (tags == null || tags.length === 0) return
        if (this.history.length === MAX_HISTORY_SIZE) return // max size reached
        tags
            .filter(elem => elem != null)
            .filter(tag => !isNoMisconception(tag))
            .forEach(value => {
                const c1: boolean = this.history.length < MAX_HISTORY_SIZE
                const c2: boolean = this.history.findIndex((elem: string) => stringEquals(elem, value)) === -1
                if (c1 && c2 && typeof value === "string") { // typescript bad typechecking
                    this.history.push(value)
                }
            })
    }

    loadedTagsFormatAndSet(tags: (string | null)[]) {
        const initialized_list: (string | null)[] = initEmptyTagsList()
        if (isNoMisconception(tags[0])) initialized_list[0] = NoMisconception
        else {
            tags
                .filter(tag => tag != null)
                .forEach(tag => {
                        const index: number = this.history.findIndex(elem => stringEquals(elem, tag))
                        if (index === -1) {
                            initialized_list.push(tag) // append tag
                            return
                        }
                        initialized_list[index + 1] = tag // skip pos 0 (reserved for NoMisconception)
                    }
                )
        }
        return initialized_list
    }


    setCurrentColor(color: string): void {
        if (stringEquals(color, this.currentColor)) return
        this.currentColor = color
        this._render()
    }

    setTags(tags: (string | null)[]): void {
        if (arrayFilteredNotNullEquals(this.loadedTagsFormatAndSet(tags), this.tags)) return
        console.log("setTags")
        this._history_add_if_missing(tags)
        this.tags = this.loadedTagsFormatAndSet(tags)
        this._render()
    }

    setRangesList(rangesList: HighlightRange[][]): void {
        if (arrayFilteredNotNullEquals(rangesList, this.tags)) return
        console.log("setRangesList")
        this.rangesList = rangesList
        this._render()
    }

    setRanges(answer: Answer, ranges: HighlightRange[]): void {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return
        console.log("setRanges")
        this.rangesList[idx] = ranges
        this._render()
    }

    setTagsAndRanges(tags: (string | null)[], answer: Answer, ranges: HighlightRange[]) {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return

        if (arrayFilteredNotNullEquals(this.loadedTagsFormatAndSet(tags), this.tags) && arrayEquals(this.rangesList[idx], ranges)) return
        console.log("setTagsAndRanges")
        console.log(tags)
        console.log(this.tags)

        this._history_add_if_missing(tags)
        this.tags = this.loadedTagsFormatAndSet(tags)

        this.rangesList[idx] = ranges
        this._render()
    }

    getRanges(answer: Answer): HighlightRange[] {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return []
        return this.rangesList[idx]
    }

    getHistory(): string[] {
        return this.history.filter(tag => tag != null)
    }

    post(): void {
        this.cluster.forEach((answer, index) => {
            postAnswer(
                this.dataset_id,
                this.question_id,
                answer.answer_id,
                this.user_id,
                answer.data,
                getMillis() - this.startTaggingTime,
                this.rangesList[index],
                this.tags)
        })
    }

    isUsingDefaultColor(): boolean {
        return isUsingDefaultColorUtil(this.currentColor)
    }

}

export default TaggingClusterSession