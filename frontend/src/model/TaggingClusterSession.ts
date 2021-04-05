import {getMillis, NO_COLOR} from "../helpers/Util";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import postAnswer from "../helpers/PostAnswer";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";
import arrayEquals from "../util/ArrayEquals";

const MAX_HISTORY_SIZE: number = 4

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
        this.tags = [null]
        this.rangesList = [...Array(cluster.length)].map(() => [])
        this.startTaggingTime = getMillis()
        this.updateKey = updateKey
        this.history = history
    }

    _render(): void {
        this.updateKey(getMillis())
    }

    _history_add_if_missing(tags: (string | null)[]): void {
        console.log("history", this.history, " to add ", tags)
        if (tags == null || tags.length === 0) return
        if (this.history.length === MAX_HISTORY_SIZE) return // max size reached
        tags
            .filter(elem => elem != null)
            .filter(tag => !stringEquals(tag, "NoMisconception"))
            .forEach(value => {
                const c1: boolean = this.history.length < MAX_HISTORY_SIZE
                const c2: boolean = this.history.findIndex((elem) => stringEquals(elem, value)) === -1
                if (c1 && c2 && typeof value === "string") { // typescript bad typechecking
                    this.history.push(value)
                }

            })
        console.log("history", this.history)
    }


    setCurrentColor(color: string): void {
        if (stringEquals(color, this.currentColor)) return
        this.currentColor = color
        this._render()
    }

    setTags(tags: (string | null)[]): void {
        if (arrayEquals(tags, this.tags)) return
        this.tags = tags
        this._history_add_if_missing(tags)
        this._render()
    }

    setRangesList(rangesList: HighlightRange[][]): void {
        if (arrayEquals(rangesList, this.tags)) return
        this.rangesList = rangesList
        this._render()
    }

    setRanges(answer: Answer, ranges: HighlightRange[]): void {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return
        this.rangesList[idx] = ranges
        this._render()
    }

    setTagsAndRanges(tags: (string | null)[], answer: Answer, ranges: HighlightRange[]) {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return

        if (arrayEquals(tags, this.tags) && arrayEquals(this.rangesList[idx], ranges)) return

        this.tags = tags
        this._history_add_if_missing(tags)
        this.rangesList[idx] = ranges
        this._render()
    }

    getRanges(answer: Answer): HighlightRange[] {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return []
        return this.rangesList[idx]
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