import {Answer, Question} from "../interfaces/Dataset";

class TaggingSession {
    questions: Question[]
    currentQuestion: number
    clusters: Answer[][]
    currentCluster: number


    constructor(questions: Question[]) {
        this.questions = questions
        this.currentQuestion = 0
        this.currentCluster = 0
        this.clusters = questions[0].clustered_answers
    }

    nextQuestion(): boolean {
        const next_question_idx = this.currentQuestion + 1
        if (next_question_idx < this.questions.length) {
            this.currentQuestion = next_question_idx
            return true
        }
        return false
    }

    nextCluster(): boolean {
        const next_cluster_idx = this.currentCluster + 1
        if (next_cluster_idx < this.clusters.length) {
            this.currentCluster = next_cluster_idx
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
            return true
        }
        return false
    }

}

export default TaggingSession