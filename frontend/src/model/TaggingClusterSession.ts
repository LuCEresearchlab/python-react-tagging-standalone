import {getMillis, NO_COLOR} from "../helpers/Util";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import postAnswer from "../helpers/PostAnswer";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";
import arrayEquals from "../util/ArrayEquals";

class TaggingClusterSession {

    dataset_id: string
    question_id: string
    user_id: string
    cluster: Answer[]
    currentColor: string
    tags: (string | null)[]
    rangesList: HighlightRange[][]
    startTaggingTime: number

    updateKey: Function

    constructor(dataset_id: string, question_id: string, user_id: string, cluster: Answer[], updateKey: Function) {
        this.dataset_id = dataset_id
        this.question_id = question_id
        this.user_id = user_id
        this.currentColor = NO_COLOR
        this.cluster = cluster
        this.tags = [null]
        this.rangesList = [...Array(cluster.length)].map(() => [])
        this.startTaggingTime = getMillis()
        this.updateKey = updateKey
    }

    _render() {
        this.updateKey(getMillis())
    }


    setCurrentColor(color: string): void {
        if (stringEquals(color, this.currentColor)) return
        this.currentColor = color
        this._render()
    }

    setTags(tags: (string | null)[]): void {
        if (arrayEquals(tags, this.tags)) return
        this.tags = tags
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