export interface HighlightRange {
    start: number,
    end: number,
    misconception: string
}

export interface HighlightRangeColor extends HighlightRange {
    color: string
}