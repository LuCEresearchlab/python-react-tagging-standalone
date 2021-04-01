import {getMillis, NO_COLOR} from "../helpers/Util";
import {HighlightRange} from "../interfaces/HighlightRange";
import {Answer} from "../interfaces/Dataset";
import postAnswer from "../helpers/PostAnswer";
import {isUsingDefaultColor as isUsingDefaultColorUtil} from "../helpers/Util";
import stringEquals from "../util/StringEquals";

class TaggingClusterSession {

    dataset_id: string
    question_id: string
    user_id: string
    cluster: Answer[]
    currentColor: string
    tags: (string | null)[]
    rangesList: HighlightRange[][]
    startTaggingTime: number

    constructor(dataset_id: string, question_id: string, user_id: string, cluster: Answer[]) {
        this.dataset_id = dataset_id
        this.question_id = question_id
        this.user_id = user_id
        this.currentColor = NO_COLOR
        this.cluster = cluster
        this.tags = []
        this.rangesList = []
        this.startTaggingTime = getMillis()
    }


    setCurrentColor(color: string): void {
        this.currentColor = color
    }

    setTags(tags: (string | null)[]): void {
        this.tags = tags
    }

    setRangesList(rangesList: HighlightRange[][]): void {
        this.rangesList = rangesList
    }

    setRanges(answer: Answer, ranges: HighlightRange[]): void {
        const idx = this.cluster.findIndex(ans => stringEquals(ans.answer_id, answer.answer_id))
        if (idx === -1) return
        this.rangesList[idx] = ranges
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