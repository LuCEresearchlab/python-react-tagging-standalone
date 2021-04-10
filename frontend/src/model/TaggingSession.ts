import {Answer, Dataset, Question} from "../interfaces/Dataset";
import TaggingClusterSession from "./TaggingClusterSession";

class TaggingSession {
    dataset: Dataset
    questions: Question[]
    user_id: string

    currentQuestion: number
    clusters: Answer[][]
    currentCluster: number
    taggingClusterSession: TaggingClusterSession


    history: string[][]

    // add function call to change key if needed

    constructor(dataset: Dataset, user_id: string) {
        this.dataset = dataset
        this.user_id = user_id

        this.questions = dataset.questions
        this.currentQuestion = 0
        this.currentCluster = 0
        this.clusters = this.questions[0].clustered_answers

        // initialize history
        this.history = [...Array(this.questions.length)].map(() => [])

        this.taggingClusterSession = new TaggingClusterSession(
            this.dataset.dataset_id,
            this.questions[this.currentQuestion].question_id,
            this.user_id,
            this.clusters[this.currentCluster],
            this.history[this.currentQuestion]
        )

    }

    _createTaggingClusterSession(): void {
        this.taggingClusterSession = new TaggingClusterSession(
            this.dataset.dataset_id,
            this.questions[this.currentQuestion].question_id,
            this.user_id,
            this.clusters[this.currentCluster],
            this.history[this.currentQuestion]
        )
    }

    nextQuestion(): boolean {
        const next_question_idx = this.currentQuestion + 1
        return this.setCurrentQuestion(next_question_idx)
    }

    nextCluster(): boolean {
        const next_cluster_idx = this.currentCluster + 1
        if (next_cluster_idx < this.clusters.length) {
            this.currentCluster = next_cluster_idx
            this._createTaggingClusterSession()
            return true
        } else return false
    }

    setCurrentQuestion(idx: number): boolean {
        if (idx === this.currentQuestion) return false
        if (0 <= idx && idx < this.questions.length) {
            this.currentQuestion = idx
            this.currentCluster = 0
            this.clusters = this.questions[idx].clustered_answers
            this._createTaggingClusterSession()
            return true
        }
        return false
    }

    setCurrentCluster(idx: number): boolean {
        if (idx === this.currentCluster) return false
        if (0 <= idx && idx < this.clusters.length) {
            this.currentCluster = idx
            this._createTaggingClusterSession()
            return true
        }
        return false
    }

    getCluster(): Answer[] {
        return this.clusters[this.currentCluster]
    }

    getQuestion(): Question {
        return this.questions[this.currentQuestion]
    }

    getTaggingClusterSession(): TaggingClusterSession {
        return this.taggingClusterSession
    }

    popAnswer(idx: number): boolean {
        if (0 <= idx && idx < this.clusters.length) {
            // store current value
            this.taggingClusterSession.post()

            const cluster = this.clusters[this.currentCluster]
            const popped: Answer[] = cluster.slice(idx, idx + 1)
            const reduced_cluster: Answer[] = cluster.slice(0, idx).concat(cluster.slice(idx + 1))
            this.clusters[this.currentCluster] = [...reduced_cluster].concat(popped)
            this._createTaggingClusterSession()
            return true
        }
        return false
    }

}

export default TaggingSession