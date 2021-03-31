import stringEquals from "../util/StringEquals";
import {HighlightRange} from "../interfaces/HighlightRange";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";

const NO_COLOR: string = "#000000"

function isUsingDefaultColor(currentColor: string): boolean {
    return currentColor.localeCompare(NO_COLOR) === 0
}

function isNoMisconception(tag: (string | null)): boolean {
    return tag != null && stringEquals("NoMisconception", tag)
}

function getMillis(): number {
    return new Date().getTime()
}

function highlightRangesColorUpdating(misconceptions_available: MisconceptionElement[],
                                      tags: (string | null)[],
                                      ranges: HighlightRange[],
                                      element: (string | null),
                                      index: number) {
    if (isNoMisconception(element)) return []
    if (element == null || tags[index] != null) {
        let removed_color: string = NO_COLOR
        if (tags[index] != null) removed_color = getColor(misconceptions_available, tags[index])

        return [...ranges]
            .filter((elem: HighlightRange) => !stringEquals(elem.color, removed_color))
    }
    return ranges
}

function filteredMisconceptions(tags: (string | null)[], misconceptions: string[], element: number) {
    let filtered_misconceptions = misconceptions
    // only allow misconceptions that aren't already present
    // previous elements
    tags.slice(0, element).forEach(tag => {
        filtered_misconceptions = filtered_misconceptions
            .filter(misc => !stringEquals(misc, tag))
    })
    // following elements
    tags.slice(element + 1).forEach(tag => {
        filtered_misconceptions = filtered_misconceptions
            .filter(misc => !stringEquals(misc, tag))
    })
    return filtered_misconceptions
}

// computes updates for the whole misconception list to handle common functionality of increase/decrease of size
function computeMiscList(tags: (string | null)[], element: (string | null), index: number): (string | null)[] {
    let tmp_tags: (string | null)[] = [...tags]
    tmp_tags.splice(index, 1, element)
    if (tmp_tags.length == (index + 1) && element != null)
        tmp_tags.push(null)
    // removed tag, should decrease
    if (tmp_tags.length >= (index + 2) && element == null)
        tmp_tags.splice(index, 1)
    return tmp_tags
}

function getColor(misconceptions_available: MisconceptionElement[], misc: (string | null)): string {
    if (misc == null)
        return ""
    const found = misconceptions_available.find((elem: MisconceptionElement) => stringEquals(elem.name, misc))
    return found ? found.color : ""
}

export {
    NO_COLOR,
    isUsingDefaultColor,
    isNoMisconception,
    getMillis,
    highlightRangesColorUpdating,
    filteredMisconceptions,
    computeMiscList,
    getColor
}