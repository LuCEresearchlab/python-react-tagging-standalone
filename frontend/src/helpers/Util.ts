import stringEquals from "../util/StringEquals";
import {HighlightRange} from "../interfaces/HighlightRange";
import {MisconceptionElement} from "../interfaces/MisconceptionElement";
import NoMisconception from "../util/NoMisconception";

const NO_COLOR: string = "#000000"

function isUsingDefaultColor(currentColor: string): boolean {
    return currentColor.localeCompare(NO_COLOR) === 0
}

function isNoMisconception(tag: (string | null)): boolean {
    return tag != null && stringEquals(NoMisconception, tag)
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

function getColor(misconceptions_available: MisconceptionElement[], misc: (string | null)): string {
    if (misc == null)
        return ""
    const found = misconceptions_available.find((elem: MisconceptionElement) => stringEquals(elem.name, misc))
    return found ? found.color : ""
}

function pickTextColorBasedOnBgColorAdvanced(backgroundColor: string): string {
    const color = backgroundColor.substring(1, 7)
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((col: number) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4)
    })
    const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2])
    return (L > 0.179) ? '#000000' : '#FFFFFF'
}

function highlightStyle(range: HighlightRange) {
    return {
        color: pickTextColorBasedOnBgColorAdvanced(range.color),
        backgroundColor: range.color,
    }
}

export {
    NO_COLOR,
    isUsingDefaultColor,
    isNoMisconception,
    getMillis,
    highlightRangesColorUpdating,
    filteredMisconceptions,
    getColor,
    highlightStyle
}