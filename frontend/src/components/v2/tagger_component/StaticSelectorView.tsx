import React from "react"
import TaggingClusterSession, {initEmptyTagsList} from "../../../model/TaggingClusterSession";
import MisconceptionColorButton from "./MisconceptionColorButton";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {getColor, highlightRangesColorUpdating, isNoMisconception, NO_COLOR} from "../../../helpers/Util";
import {Button} from "@material-ui/core";
import stringEquals from "../../../util/StringEquals";
import {GREY, DARK_GREY} from "../../../util/Colors";
import MisconceptionInfoButton from "./MisconceptionInfoButton";


interface Input {
    misconceptionsAvailable: MisconceptionElement[],
    taggingClusterSession: TaggingClusterSession,
    misconception: string,
    handledIndex: number
}

function StaticSelectorView({misconceptionsAvailable, taggingClusterSession, misconception, handledIndex}: Input) {

    const isSelected = () => taggingClusterSession.tags.findIndex(tag => stringEquals(tag, misconception)) !== -1

    const getNewRangesList = (element: (string | null), index: number) => {
        if (isNoMisconception(element)) return [[]]
        let new_ranges_list = []
        for (let ranges of taggingClusterSession.rangesList)
            new_ranges_list.push(highlightRangesColorUpdating(
                misconceptionsAvailable,
                taggingClusterSession.tags,
                ranges,
                element,
                index)
            )
        return new_ranges_list
    }

    return (
        <>
            <MisconceptionColorButton
                key={"MisconceptionColorButton|" + misconception}
                color={getColor(misconceptionsAvailable, misconception)}
                enabled={isSelected()}
                current_color={taggingClusterSession.currentColor}
                setColor={(color: string) => taggingClusterSession.setCurrentColor(color)}
            />
            <Button onClick={(e) => {
                e.preventDefault()
                let new_tags = [...taggingClusterSession.tags]


                taggingClusterSession.setRangesList(getNewRangesList(misconception, handledIndex))

                if (isNoMisconception(misconception) && isSelected()) // deselecting NoMisconception
                    new_tags = initEmptyTagsList()
                else
                    new_tags[handledIndex] = isSelected() ? null : misconception

                if (isSelected() &&
                    stringEquals(getColor(misconceptionsAvailable, misconception), taggingClusterSession.currentColor))
                    taggingClusterSession.setCurrentColor(NO_COLOR)

                console.log("isSelected", isSelected(), " color ", taggingClusterSession.currentColor)
                taggingClusterSession.setTags(new_tags)
                taggingClusterSession.post()


            }} style={{backgroundColor: (isSelected() ? DARK_GREY : GREY)}}>
                {misconception}
            </Button>
            <MisconceptionInfoButton
                handled_element={0}
                tags={[misconception]}
            />
        </>
    )
}

export default StaticSelectorView