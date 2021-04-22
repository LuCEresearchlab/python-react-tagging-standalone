import {HighlightRange, HighlightRangeColor} from "../interfaces/HighlightRange";


// https://stackoverflow.com/questions/22784883/check-if-more-than-two-date-ranges-overlap
function is_range_overlap(range1: HighlightRangeColor, range2: HighlightRangeColor): boolean {
    if (range1.color != range2.color) return false // different misconceptions
    if (range1.start <= range2.start && range2.start <= range1.end) return true // b starts in a
    if (range1.start <= range2.end && range2.end <= range1.end) return true // b ends in a
    if (range2.start < range1.start && range1.end < range2.end) return true // a in b
    return false
}

function merge_ranges(range1: HighlightRangeColor, range2: HighlightRangeColor): HighlightRangeColor {
    return {
        start: Math.min(range1.start, range2.start),
        end: Math.max(range1.end, range2.end),
        misconception: range1.misconception,
        color: range1.color
    }
}

function comparator(r1: HighlightRange, r2: HighlightRange): number {
    return r1.start - r2.start
}

// put same misconceptions close to each other
function compare_colors(r1: HighlightRangeColor, r2: HighlightRangeColor): number {
    return r1.color.localeCompare(r2.color)
}

export function rangesCompressor(ranges: HighlightRangeColor[], newRange: HighlightRangeColor): HighlightRangeColor[] {
    const sorted_ranges: HighlightRangeColor[] = [...ranges, newRange].sort(compare_colors).sort(comparator)

    return sorted_ranges.reduce(((previousValue: HighlightRangeColor[], currentValue: HighlightRangeColor) => {
        if (previousValue.length == 0) return [currentValue]
        let values = previousValue.slice(0, -1)
        let last_elem = previousValue[previousValue.length - 1]

        if (is_range_overlap(last_elem, currentValue))
            return [...values, merge_ranges(last_elem, currentValue)]
        return [...previousValue, currentValue]
    }), [])
}