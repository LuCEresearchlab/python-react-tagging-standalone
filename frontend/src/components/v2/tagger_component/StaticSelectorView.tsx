import React, {useCallback, useMemo, useState} from "react"
import {
    getCurrentCluster,
    initEmptyTagsList, TaggingClusterSession, TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {getColor, highlightRangesColorUpdating, isNoMisconception, NO_COLOR} from "../../../helpers/Util";
import {Button} from "@material-ui/core";
import stringEquals from "../../../util/StringEquals";
import {GREY, DARK_GREY, HIGHLIGHT_COLOR_ELEMENT} from "../../../util/Colors";
import KeyIndication from "./KeyIndication";
import {
    clusterSessionPost,
    setCurrentColor,
    setRangesList,
    setTags
} from "../../../model/TaggingClusterSessionDispatch";
import MisconceptionColorButton from "../../tagger_component/MisconceptionColorButton";
import MisconceptionInfoButton from "../../tagger_component/MisconceptionInfoButton";
import withKeyboard from "../../../hooks/withKeyboard";
import withActiveKeyboard from "../../../hooks/withActiveKeyboard";


interface Input {
    misconceptionsAvailable: MisconceptionElement[],
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    misconception: string,
    handledIndex: number
}

function StaticSelectorView({
                                misconceptionsAvailable,
                                taggingClusterSession,
                                dispatchTaggingClusterSession,
                                misconception,
                                handledIndex
                            }: Input) {


    const isSelected = () => taggingClusterSession.tags.findIndex(tag => stringEquals(tag, misconception)) !== -1
    const [localCommand, setLocalCommand] = useState<string>('')

    const getNewRangesList = (element: (string | null), index: number) => {

        if (isNoMisconception(element))
            return [...Array(getCurrentCluster(taggingClusterSession).answers.length)].map(() => [])

        if (handledIndex != 0 && taggingClusterSession.tags[0] != null)
            return [...Array(getCurrentCluster(taggingClusterSession).answers.length)].map(() => [])

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


    const onClickHandler = () => {
        let new_tags = [...taggingClusterSession.tags]


        dispatchTaggingClusterSession(setRangesList(getNewRangesList(misconception, handledIndex)))

        if (isNoMisconception(misconception) && isSelected()) // deselecting NoMisconception
            new_tags = initEmptyTagsList()
        else {
            if (taggingClusterSession.tags[0] != null)
                new_tags[0] = null
            new_tags[handledIndex] = isSelected() ? null : misconception
        }
        dispatchTaggingClusterSession(setCurrentColor(NO_COLOR))
        dispatchTaggingClusterSession(setTags(new_tags))
        dispatchTaggingClusterSession(clusterSessionPost())
    }

    const setColor = (color: string) => {
        if (stringEquals(taggingClusterSession.currentColor, color))
            dispatchTaggingClusterSession(setCurrentColor(NO_COLOR))
        else
            dispatchTaggingClusterSession(setCurrentColor(color))
    }

    const keyboardAction = useCallback((command: string) => {
            if (isNoMisconception(misconception) && command == 'n') onClickHandler()
            if (command == ('' + handledIndex)) onClickHandler()

            if (isNoMisconception(misconception) && command == 'nc')
                setColor(getColor(misconceptionsAvailable, misconception))

            if (command == ('' + handledIndex + 'c'))
                setColor(getColor(misconceptionsAvailable, misconception))

        },
        [misconception, taggingClusterSession.currentColor, taggingClusterSession.tags, misconceptionsAvailable]
    )

    withKeyboard((command: string) => keyboardAction(command))

    const activeKeyboardAction = useMemo(() => {
        return function (command: string) {
            setLocalCommand(command)
        }
    }, [misconception, handledIndex])

    withActiveKeyboard(command => activeKeyboardAction(command))

    const displayKey = useMemo(
        () => isNoMisconception(misconception) ? 'n' : "" + handledIndex,
        [misconception, handledIndex]
    )

    return (
        <>
            <KeyIndication
                displayKey={displayKey}
            />
            <MisconceptionColorButton
                key={"MisconceptionColorButton|" + misconception}
                color={getColor(misconceptionsAvailable, misconception)}
                enabled={isSelected()}
                current_color={taggingClusterSession.currentColor}
                setColor={setColor}
                staticColor={true}
                highlighted={stringEquals(displayKey + 'c', localCommand)}
            />
            <Button
                type={"button"}
                variant={'outlined'}
                onClick={onClickHandler}
                style={
                    {
                        backgroundColor: (displayKey == localCommand ?
                                HIGHLIGHT_COLOR_ELEMENT :
                                isSelected() ? DARK_GREY : GREY
                        ),
                        textTransform: "none",
                        width: '50%',
                    }
                }>
                {misconception}
            </Button>
            {
                isNoMisconception(misconception) ?
                    <></>:
                    <MisconceptionInfoButton
                        handled_element={0}
                        tags={[misconception]}
                        keyboardIndex={'' + handledIndex}
                        highlighted={stringEquals('' + handledIndex + '?', localCommand)}
                    />
            }
        </>
    )
}

export default StaticSelectorView