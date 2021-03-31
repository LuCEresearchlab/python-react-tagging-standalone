import React from "react"
import MisconceptionColorButton from "./MisconceptionColorButton";
import SingleTagSelector from "./SingleTagSelector";
import {
    computeMiscList,
    filteredMisconceptions,
    getColor,
    highlightRangesColorUpdating,
    isNoMisconception
} from "../../../helpers/Util";
import MisconceptionInfoButton from "./MisconceptionInfoButton";
import MisconceptionNoteButton from "./MisconceptionNoteButton";
import {StyledTableCell} from "../../styled/StyledTable";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {HighlightRange} from "../../../interfaces/HighlightRange";


interface Input {
    currentColor: string,

    setCurrentColor(color: string): void,

    tags: (string | null)[],

    setTags(new_tags: (string | null)[]): void,

    rangesList: HighlightRange[][],

    setRangesList(new_ranges_list: HighlightRange[][]): void,

    misconceptionsAvailable: MisconceptionElement[],
}

function MisconceptionView(
    {
        misconceptionsAvailable,
        currentColor,
        setCurrentColor,
        tags,
        setTags,
        rangesList,
        setRangesList
    }: Input
) {

    const misconceptions_string_list: string[] = misconceptionsAvailable.map<string>(misc => misc.name)

    return (
        <StyledTableCell align="right" className={classes.root}>
            <>
                <div className={classes.divLine}>
                    <MisconceptionColorButton
                        color={getColor(misconceptionsAvailable, tags[0])}
                        current_color={currentColor}
                        setColor={setCurrentColor}
                        enabled={true}
                    />
                    <SingleTagSelector
                        key={"tag-selector-0"}
                        misconceptions_available={
                            filteredMisconceptions(tags, misconceptions_string_list, 0)
                        }
                        handled_element={0}
                        tags={tags}
                        setTagElement={(element: (string | null), index: number) => {
                            let new_ranges_list = []
                            for (let ranges of rangesList) {
                                new_ranges_list.push(
                                    highlightRangesColorUpdating(
                                        misconceptionsAvailable,
                                        tags,
                                        ranges,
                                        element,
                                        index
                                    )
                                )
                            }

                            let tmp_tags: (string | null)[] = computeMiscList(tags, element, index)
                            // handle specific case of NoMisconception, only possible in first tag
                            if (element != null && isNoMisconception(element))
                                tmp_tags = ["NoMisconception"]
                            setTags(tmp_tags)
                            setRangesList(new_ranges_list)
                            postAnswer(new_ranges, tmp_tags)
                        }}
                        enabled={true}
                    />
                    <MisconceptionInfoButton
                        tags={tags}
                        handled_element={0}
                    />
                    <MisconceptionNoteButton/>
                </div>
                {
                    [...Array(Math.min(tags.length - 1, 4))]
                        .map((_, index) => {
                                const handled_element = index + 1


                                return (
                                    <div key={"tag-selector-" + handled_element} className={classes.divLine}>
                                        <MisconceptionColorButton
                                            color={(() => getColor(misconceptionsAvailable, tags[handled_element]))()}
                                            current_color={currentColor}
                                            setColor={setCurrentColor}
                                            enabled={true}
                                        />
                                        <SingleTagSelector
                                            misconceptions_available={
                                                filteredMisconceptions(tags, misconceptions_string_list, handled_element)
                                            }
                                            handled_element={handled_element}
                                            tags={tags}
                                            setTagElement={(element: (string | null), index: number) => {
                                                let new_ranges_list = []
                                                for (let ranges of rangesList) {
                                                    new_ranges_list.push(
                                                        highlightRangesColorUpdating(
                                                            misconceptionsAvailable,
                                                            tags,
                                                            ranges,
                                                            element,
                                                            index
                                                        )
                                                    )
                                                }

                                                const tmp_tags: (string | null)[] =
                                                    computeMiscList(tags, element, index)

                                                setTags(tmp_tags)
                                                setRangesList(new_ranges_list)
                                                postAnswer(new_ranges, tmp_tags)
                                            }}
                                            enabled={true}
                                        />
                                        <MisconceptionInfoButton
                                            tags={tags}
                                            handled_element={handled_element}
                                        />
                                        <MisconceptionNoteButton/>
                                    </div>)
                            }
                        )
                }
            </>
        </StyledTableCell>
    )
}

export default MisconceptionView