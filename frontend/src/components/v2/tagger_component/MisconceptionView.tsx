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
import TaggingClusterSession from "../../../model/TaggingClusterSession";


interface Input {
    clusterTaggingSession: TaggingClusterSession

    misconceptionsAvailable: MisconceptionElement[],
}

function MisconceptionView(
    {
        misconceptionsAvailable,
        clusterTaggingSession
    }: Input
) {

    const misconceptions_string_list: string[] = misconceptionsAvailable.map<string>(misc => misc.name)

    const currentColor: string = clusterTaggingSession.currentColor
    const tags = clusterTaggingSession.tags
    const rangesList = clusterTaggingSession.rangesList


    const setCurrentColor = (color: string) => clusterTaggingSession.setCurrentColor(color)

    const getNewRangesList = (element: (string | null), index: number) => {
        let new_ranges_list = []
        for (let ranges of rangesList)
            new_ranges_list.push(highlightRangesColorUpdating(misconceptionsAvailable, tags, ranges, element, index))
        return new_ranges_list
    }


    const setTagElementHandle1 = (element: (string | null), index: number) => {
        let tmp_tags: (string | null)[] = computeMiscList(tags, element, index)
        // handle specific case of NoMisconception, only possible in first tag
        if (element != null && isNoMisconception(element))
            tmp_tags = ["NoMisconception"]

        clusterTaggingSession.setTags(tmp_tags)
        clusterTaggingSession.setRangesList(getNewRangesList(element, index))
        clusterTaggingSession.post()
    }

    const setTagElementHandle2 = (element: (string | null), index: number) => {
        clusterTaggingSession.setTags(computeMiscList(tags, element, index))
        clusterTaggingSession.setRangesList(getNewRangesList(element, index))
        clusterTaggingSession.post()
    }

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
                        setTagElement={setTagElementHandle1}
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
                                            setTagElement={setTagElementHandle2}
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