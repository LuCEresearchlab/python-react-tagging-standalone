import {HighlightRange} from "../interfaces/HighlightRange";


// https://stackoverflow.com/questions/22784883/check-if-more-than-two-date-ranges-overlap
function is_range_overlap(range1: HighlightRange, range2: HighlightRange): boolean {
    if (range1.start <= range2.start && range2.start <= range1.end) return true // b starts in a
    if (range1.start <= range2.end && range2.end <= range1.end) return true // b ends in a
    if (range2.start < range1.start && range1.end < range2.end) return true // a in b
    return false
}

function merge_ranges(range1: HighlightRange, range2: HighlightRange): HighlightRange {
    return {
        start: Math.min(range1.start, range2.start),
        end: Math.max(range1.end, range2.end)
    }
}

function comparator(r1: HighlightRange, r2: HighlightRange): number {
    return r1.start - r2.start
}

export function rangesCompressor(ranges: HighlightRange[], newRange: HighlightRange): HighlightRange[] {
    const sorted_ranges: HighlightRange[] = [...ranges, newRange].sort(comparator)

    return sorted_ranges.reduce(((previousValue: HighlightRange[], currentValue: HighlightRange) => {
        if (previousValue.length == 0) return [currentValue]
        let values = previousValue.slice(0, -1)
        let last_elem = previousValue[previousValue.length - 1]

        if (is_range_overlap(last_elem, currentValue))
            return [...values, merge_ranges(last_elem, currentValue)]
        return [...previousValue, currentValue]
    }), [])
}