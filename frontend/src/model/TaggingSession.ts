import {Answer, Dataset, Question} from "../interfaces/Dataset";
import TaggingClusterSession from "./TaggingClusterSession";

class TaggingSession {
    dataset: Dataset
    questions: Question[]
    currentQuestion: number
    clusters: Answer[][]
    currentCluster: number
    taggingClusterSession: TaggingClusterSession
    user_id: string


    constructor(dataset: Dataset, user_id: string) {
        this.dataset = dataset
        this.user_id = user_id

        this.questions = dataset.questions
        this.currentQuestion = 0
        this.currentCluster = 0
        this.clusters = this.questions[0].clustered_answers
        this.taggingClusterSession = this._createTaggingClusterSession()
    }

    _createTaggingClusterSession(): TaggingClusterSession {
        return new TaggingClusterSession(
            this.dataset.dataset_id,
            this.questions[this.currentQuestion].question_id,
            this.user_id,
            this.clusters[this.currentCluster]
        )
    }

    nextQuestion(): boolean {
        const next_question_idx = this.currentQuestion + 1
        if (next_question_idx < this.questions.length) {
            this.currentQuestion = next_question_idx
            this.taggingClusterSession = this._createTaggingClusterSession()
            return true
        }
        return false
    }

    nextCluster(): boolean {
        const next_cluster_idx = this.currentCluster + 1
        if (next_cluster_idx < this.clusters.length) {
            this.currentCluster = next_cluster_idx
            this.taggingClusterSession = this._createTaggingClusterSession()
            return true
        } else return false
    }

    getCluster(): Answer[] {
        return this.clusters[this.currentCluster]
    }

    getQuestion(): Question {
        return this.questions[this.currentQuestion]
    }

    popAnswer(idx: number): boolean {
        if (0 <= idx && idx < this.clusters.length) {
            const cluster = this.clusters[this.currentCluster]
            const popped: Answer[] = cluster.slice(idx, idx + 1)
            const reduced_cluster: Answer[] = cluster.slice(0, idx).concat(cluster.slice(idx + 1))
            this.clusters[this.currentCluster] = [...reduced_cluster].concat(popped)
            this.taggingClusterSession = this._createTaggingClusterSession()
            return true
        }
        return false
    }

}

export default TaggingSession