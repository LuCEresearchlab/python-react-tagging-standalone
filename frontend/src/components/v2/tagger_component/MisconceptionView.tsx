import React, {useCallback, useMemo, useState} from "react"
import SingleTagSelector from "./SingleTagSelector";
import {
    filteredMisconceptions,
    getColor,
    highlightRangesColorUpdating, NO_COLOR
} from "../../../helpers/Util";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {
    getCurrentCluster,
    PRE_DYNAMIC_SIZE,
    TaggingClusterSession,
    TaggingClusterSessionDispatch
} from "../../../model/TaggingClusterSession";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import KeyIndication from "./KeyIndication";
import {
    clusterSessionPost,
    setCurrentColor,
    setRangesList,
    setTags
} from "../../../model/TaggingClusterSessionDispatch";
import MisconceptionColorButton from "../../tagger_component/MisconceptionColorButton";
import MisconceptionInfoButton from "../../tagger_component/MisconceptionInfoButton";
import stringEquals from "../../../util/StringEquals";
import withActiveKeyboard from "../../../hooks/withActiveKeyboard";


const useStyles = makeStyles(() =>
    createStyles({
        divLine: {
            display: "inline-flex",
            width: '100%',
        }
    }),
);

interface Input {
    taggingClusterSession: TaggingClusterSession,
    dispatchTaggingClusterSession: React.Dispatch<TaggingClusterSessionDispatch>,
    misconceptionsAvailable: MisconceptionElement[]
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

    if (tmp_tags[0] != null) tmp_tags[0] = null
    return tmp_tags
}

function MisconceptionView(
    {
        misconceptionsAvailable,
        taggingClusterSession,
        dispatchTaggingClusterSession
    }: Input
) {

    const classes = useStyles()

    const [localCommand, setLocalCommand] = useState<string>('')

    const misconceptions_string_list: string[] = useMemo(
        () => misconceptionsAvailable.map<string>(misc => misc.name),
        [misconceptionsAvailable]
    )

    const currentColor: string = taggingClusterSession.currentColor
    const tags = taggingClusterSession.tags


    const set_current_color = (color: string) => {
        if (stringEquals(taggingClusterSession.currentColor, color))
            dispatchTaggingClusterSession(setCurrentColor(NO_COLOR))
        else
            dispatchTaggingClusterSession(setCurrentColor(color))
    }


    const getNewRangesList = (element: (string | null), index: number) => {
        if (taggingClusterSession.tags[0] != null)  // delete highlighting if selecting with NoMisconception
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


    const setTagElementHandle = (element: (string | null), index: number) => {
        dispatchTaggingClusterSession(setTags(computeMiscList(tags, element, index)))
        dispatchTaggingClusterSession(setRangesList(getNewRangesList(element, index)))
        dispatchTaggingClusterSession(clusterSessionPost())
    }

    const activeKeyboardAction = useCallback((command: string) => {
            setLocalCommand(command)
        },
        [misconceptionsAvailable]
    )

    withActiveKeyboard(command => activeKeyboardAction(command))

    const FIRST_DYNAMIC_INDEX: number = PRE_DYNAMIC_SIZE + 1

    return (
        <>
                <div className={classes.divLine}>
                    <KeyIndication displayKey={"t" + 1} highlighted={stringEquals('t1', localCommand)}/>
                    <MisconceptionColorButton
                        color={getColor(misconceptionsAvailable, tags[FIRST_DYNAMIC_INDEX])}
                        current_color={currentColor}
                        setColor={set_current_color}
                        enabled={true}
                        staticColor={true}
                    />
                    <SingleTagSelector
                        key={"tag-selector-0" + tags}
                        taggingClusterSession={taggingClusterSession}
                        misconceptions_available={
                            filteredMisconceptions(tags, misconceptions_string_list, FIRST_DYNAMIC_INDEX)
                        }
                        handled_element={FIRST_DYNAMIC_INDEX}
                        tags={tags}
                        setTagElement={setTagElementHandle}
                        enabled={true}
                    />
                    <MisconceptionInfoButton
                        tags={tags}
                        handled_element={FIRST_DYNAMIC_INDEX}
                    />
                </div>
                {
                    [...Array(Math.max(tags.length - PRE_DYNAMIC_SIZE - 2, 0))]
                        .map((_, index) => {
                            const handled_element = PRE_DYNAMIC_SIZE + index + 2 // +2 = NoMisc and default add above
                            return (
                                <div key={"tag-selector-" + handled_element} className={classes.divLine}>
                                    <KeyIndication
                                        displayKey={"t" + (handled_element - PRE_DYNAMIC_SIZE)}
                                        highlighted={
                                            stringEquals("t" + (handled_element - PRE_DYNAMIC_SIZE), localCommand)
                                        }
                                    />
                                    <MisconceptionColorButton
                                        color={(() => getColor(misconceptionsAvailable, tags[handled_element]))()}
                                        current_color={currentColor}
                                        setColor={set_current_color}
                                        enabled={true}
                                        staticColor={true}
                                    />
                                    <SingleTagSelector
                                        key={"tag-selector-" + handled_element + tags}
                                        taggingClusterSession={taggingClusterSession}
                                        misconceptions_available={
                                            filteredMisconceptions(tags, misconceptions_string_list, handled_element)
                                        }
                                        handled_element={handled_element}
                                        tags={tags}
                                        setTagElement={setTagElementHandle}
                                        enabled={true}
                                    />
                                    <MisconceptionInfoButton
                                        tags={tags}
                                        handled_element={handled_element}
                                    />
                                </div>)
                            }
                        )
                }
        </>
    )
}

export default MisconceptionView