import React from "react"
import MisconceptionColorButton from "./MisconceptionColorButton";
import SingleTagSelector from "./SingleTagSelector";
import {
    computeMiscList,
    filteredMisconceptions,
    getColor,
    highlightRangesColorUpdating, isNoMisconception
} from "../../../helpers/Util";
import MisconceptionInfoButton from "./MisconceptionInfoButton";
import MisconceptionNoteButton from "./MisconceptionNoteButton";
import {MisconceptionElement} from "../../../interfaces/MisconceptionElement";
import {
    PRE_DYNAMIC_SIZE,
    TaggingClusterSessionWithMethods
} from "../../../model/TaggingClusterSession";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import KeyIndication from "./KeyIndication";
import {clusterSessionPost, setRangesList, setTags} from "../../../model/TaggingClusterSessionDispatch";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > * + *': {
                marginTop: theme.spacing(3),
            }
        },
        divLine: {
            display: "inline-flex",
        }
    }),
);

interface Input {
    taggingClusterSessionWithMethods: TaggingClusterSessionWithMethods,
    misconceptionsAvailable: MisconceptionElement[]
}

function MisconceptionView(
    {
        misconceptionsAvailable,
        taggingClusterSessionWithMethods
    }: Input
) {

    const classes = useStyles()

    const misconceptions_string_list: string[] = misconceptionsAvailable.map<string>(misc => misc.name)

    const clusterTaggingSession = taggingClusterSessionWithMethods.clusterSession
    const dispatch = taggingClusterSessionWithMethods.clusterSessionDispatch

    const currentColor: string = clusterTaggingSession.currentColor
    const tags = clusterTaggingSession.tags
    const rangesList = clusterTaggingSession.rangesList


    const setCurrentColor: any = (color: string) => dispatch(setCurrentColor(color))

    const getNewRangesList = (element: (string | null), index: number) => {
        if (isNoMisconception(element)) return [[]]
        let new_ranges_list = []
        for (let ranges of rangesList)
            new_ranges_list.push(highlightRangesColorUpdating(misconceptionsAvailable, tags, ranges, element, index))
        return new_ranges_list
    }


    const setTagElementHandle = (element: (string | null), index: number) => {
        dispatch(setTags(computeMiscList(tags, element, index)))
        dispatch(setRangesList(getNewRangesList(element, index)))
        dispatch(clusterSessionPost())
    }

    const FIRST_DYNAMIC_INDEX: number = PRE_DYNAMIC_SIZE + 1

    return (
        <div className={classes.root}>
            <>
                <div className={classes.divLine}>
                    <KeyIndication displayKey={"1"}/>
                    <MisconceptionColorButton
                        color={getColor(misconceptionsAvailable, tags[FIRST_DYNAMIC_INDEX])}
                        current_color={currentColor}
                        setColor={setCurrentColor}
                        enabled={true}
                    />
                    <SingleTagSelector
                        key={"tag-selector-0"}
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
                    <MisconceptionNoteButton/>
                </div>
                {
                    [...Array(Math.max(tags.length - PRE_DYNAMIC_SIZE - 2, 0))]
                        .map((_, index) => {
                            const handled_element = PRE_DYNAMIC_SIZE + index + 2 // +2 = NoMisc and default add above

                            return (
                                <div key={"tag-selector-" + handled_element} className={classes.divLine}>
                                    <KeyIndication displayKey={"" + (handled_element - PRE_DYNAMIC_SIZE)}/>
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
                                            setTagElement={setTagElementHandle}
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
        </div>
    )
}

export default MisconceptionView