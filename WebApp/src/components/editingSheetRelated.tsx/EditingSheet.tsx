//
//  UI.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/17/22
//  
//  Contains all the important UI elements to create an editing sheet. e.g.: the main sheet, the header, ...

import React, { useEffect } from "react"
import Divider from "../Divider"
import Colors from "../../assets/Colors"
import TextStyles from "../../styles/TextStyles"
import localization from "../../utils/localizations"
import { INNER_PADDING, OUTER_PADDING } from "./Constants"
import { ClassicButton, HeaderButton } from "../Buttons"
import { EditingStepType } from "../../Types"
import { EditingStepButton } from "./Buttons"
import { WindowWidth } from "../WindowWidth"
import { WindowHeight } from "../WindowHeight"
import { Helmet } from "react-helmet"


interface EditingSheetHeaderInterface {
    text: string
    onclose?: () => any
    closeButton?: boolean
    deleteButton?: boolean
    cancelButton?: boolean
    doneButton?: boolean
    onClick?: () => any
    onClickCancel?: () => any 
    onClickDelete?: () => any
    description?: string
    condition?: boolean
}
/**
 * A text at the left, a close button at the right and a divider at the bottom.
 */
export function EditingSheetHeader({ text, onclose = () => { }, closeButton: closeButton = true, deleteButton = false, cancelButton = false, doneButton = false, onClick = () => { }, onClickCancel = () => {}, onClickDelete = () => { }, description = undefined, condition = true }: EditingSheetHeaderInterface) {
    return (
        <div className={`flex flex-col justify-center items-center w-full`}>
            <div className='flex items-center justify-between w-full' style={{ height: 44.5 + 16, paddingLeft: INNER_PADDING, paddingRight: INNER_PADDING }}>
                <div className='flex items-center justify-center overflow-hidden' >
                    <p style={TextStyles.calloutBold}>{text}</p>
                    {((description ?? "") !== "") &&
                        <p className='text-start line-clamp-1' style={Object.assign({}, TextStyles.gray13Text, { paddingInline: INNER_PADDING / 2 })}>{description}</p>
                    }
                </div>

                <div className='flex items-center justify-center' style={{ marginLeft: 0 }}>
                    {deleteButton &&
                        <ClassicButton
                            text={localization.delete}
                            textColor={Colors.red}
                            backgroundColor={Colors.lightGray}
                            onClick={() => { onClickDelete() }}
                            smallAppearance
                            horizontalMargin={8}
                        />
                    }
                    {cancelButton &&
                        <ClassicButton
                            text={localization.cancel}
                            textColor={Colors.black}
                            backgroundColor={Colors.lightGray}
                            onClick={() => { onClickCancel() }}
                            smallAppearance
                            horizontalMargin={8}
                        />
                    }
                    {doneButton &&
                        <>
                            <div style={{ width: 6 }} />
                            <ClassicButton
                                text={localization.done}
                                textColor={"white"}
                                backgroundColor={Colors.darkBlue}
                                onClick={() => { onClick() }}
                                smallAppearance
                                horizontalMargin={0}
                                condition={condition}
                            />
                            <div style={{ width: closeButton ? 6 : 0 }} />
                        </>
                    }
                    {closeButton &&
                        <>
                            <div style={{ width: INNER_PADDING }} />
                            <HeaderButton buttonType="xmark" onClick={() => { onclose() }} />
                        </>
                    }
                </div>
            </div>

            <Divider />
        </div>
    )
}


interface EditingSheetStepsHeaderInterface {
    selected_editing_step: EditingStepType
    setSelectedEditingStep: (_: EditingStepType) => any
    is_loading: boolean
    progress: number
    transitionDuration?: number
}
/**
 * Interactive steps.
 * Is clickable, has a progress/loading bar.
 */
export function EditingSheetStepsHeader({ selected_editing_step, setSelectedEditingStep, is_loading, progress, transitionDuration = 400 }: EditingSheetStepsHeaderInterface) {

    // Values 
    const stepIndicatorId = "editing_sheet_step_indicator"
    const progressIndicatorId = "editing_sheet_progress_indicator"
    const uploadStarted = progress > 0


    useEffect(() => {

        const progressIndicatorDiv = document.getElementById(stepIndicatorId)
        if (progressIndicatorDiv === null) return
        switch (selected_editing_step) {
            case 'details': progressIndicatorDiv.style.width = "0%"; break
            case 'actions': progressIndicatorDiv.style.width = "50%"; break
            default: return
        }

    }, [selected_editing_step])

    function animateSheetLoadingBar(tDuration = 400) {

        const progressIndicatorDiv = document.getElementById(progressIndicatorId)
        if (progressIndicatorDiv === null) return

        let xToReflectProgress = -100 + progress
        progressIndicatorDiv.style.transform = `translateX(${xToReflectProgress}%)`
        progressIndicatorDiv.style.transitionDuration = `${tDuration}ms`

        return
    }
    useEffect(() => {
        if (progress === 0) {
            animateSheetLoadingBar(0)
        } else {
            animateSheetLoadingBar(transitionDuration)
        }
    }, [progress])


    return (
        <div className={`w-full shadow-md shadow-gray-100 z-50`} style={{ paddingTop: OUTER_PADDING - 9 + 2, paddingBottom: INNER_PADDING + 2, paddingInline: OUTER_PADDING }}>
            <div className='flex items-center justify-center w-full'>
                <div className='relative' style={{ height: 2.5, width: "70%", backgroundColor: Colors.borderGray }}>
                    <div id={stepIndicatorId} className={`absolute`} style={{ height: 2.5, backgroundColor: Colors.darkBlue }} />
                    <div className={`absolute w-1/2 right-0 dashedBackground overflow-hidden`} style={{
                        height: 2.5, backgroundColor: Colors.whiteToGray2
                    }}>
                        {/* ANIMATED PROGRESS INDICATOR */}
                        <div id={progressIndicatorId} className="h-full w-full" style={{ backgroundColor: Colors.darkBlue }} />
                    </div>
                    <EditingStepButton editingStep={"details"} isDone={selected_editing_step !== "details"} selectedAppearance={selected_editing_step === "details"} setEditingStep={setSelectedEditingStep} disabled={uploadStarted} />
                    <EditingStepButton editingStep={"actions"} isDone={uploadStarted} selectedAppearance={((selected_editing_step === "actions") && !(uploadStarted))} setEditingStep={setSelectedEditingStep} disabled={uploadStarted} />
                    <EditingStepButton editingStep={"upload"} isDone={progress === 100} selectedAppearance={false} setEditingStep={setSelectedEditingStep} disabled />
                </div>
            </div>
        </div>
    )
}


interface EditingSheetControlBarInterface {
    // BUTTONS RELATED
    deleteButton?: boolean
    cancelButton?: boolean
    buttonText: string
    condition?: boolean
    onClickDelete?: () => any
    onClickCancel?: () => any
    onClick?: () => any
    isLoading?: boolean
    // 
    error?: string
}
/**
 * A bar that displays that everything has been checked, errors, as well as a "Deletetion" button, "Go back" button and a "Go Forward / Valid" button.
 * Could have a divider at it's top that transforms into a loading bar when the user hits the "Save" button.
 */
export function EditingSheetControlBar({ deleteButton, cancelButton, buttonText, condition = true, onClickDelete = () => { }, onClickCancel = () => { }, onClick = () => { }, isLoading = false, error }: EditingSheetControlBarInterface) {
    return (
        <div className={`flex flex-col justify-center items-center w-full`}>

            {/* Divider */}
            <Divider />

            <div className='flex items-center justify-between w-full' style={{ height: 32 + (8 * 2), paddingInline: 8 }}>
                {/* Checked / Error / DELETE button */}
                <div>
                    {/* TODO... */}
                    {(deleteButton === true) ?
                        <ClassicButton
                            text={localization.delete}
                            textColor={Colors.red}
                            backgroundColor={Colors.lightGray}
                            onClick={() => { onClickDelete() }}
                            smallAppearance
                            horizontalMargin={8}
                        />
                        :
                        <p>{error}</p>
                    }
                </div>


                <div className='flex items-center justify-end '>
                    {(cancelButton === true) &&
                        <ClassicButton
                            text={localization.back}
                            textColor={"black"}
                            backgroundColor={Colors.lightGray}
                            onClick={() => { onClickCancel() }}
                            smallAppearance
                            horizontalMargin={8}
                        />
                    }
                    <ClassicButton
                        text={buttonText}
                        textColor={"white"}
                        backgroundColor={Colors.darkBlue}
                        onClick={() => { onClick() }}
                        smallAppearance
                        isLoading={isLoading}
                        condition={condition}
                    />
                </div>
            </div>

        </div>
    )
}






interface EditingSheetInterface {
    // HTML PAGE
    helmetTitle: string
    // HEADER'S UI
    headerTitle: string
    headerDescription?: string
    headerCloseButton: boolean
    headerDeleteButton: boolean
    headerCancelButton: boolean
    headerButton?: boolean
    onHeaderClose?: () => any
    onHeaderClick?: () => any
    onHeaderClickCancel?: () => any 
    onHeaderClickDelete?: () => any
    headerButtonCondition?: boolean
    // STEPS MINI HEADER
    showEditingSteps: boolean
    selectedEditingStep: EditingStepType
    setSelectedEditingStep: React.Dispatch<React.SetStateAction<EditingStepType>>
    isLoading: boolean
    uploadProgress: number
    transitionDuration?: number
    //CONTENT
    mainContent: any
    miniSheets: any
    // CONTROL BAR
    showControlBar?: boolean
    controlBarButtonText: string
    showControlBarCancelButton: boolean
    showControlBarDeleteButton?: boolean
    controlBarButtonCondition?: boolean
    onControlBarButtonClick: () => any
    onControlBarCancelButtonClick: () => any
}
/**
 * (LARGE DEVICES ONLY)
 * 
 * The div to create an editing Sheet.
 * (Has the white cell, the black background, the header, ...)
*/
export default function EditingSheet({
    // HTML PAGE 
    helmetTitle,
    // HEADER'S UI
    headerTitle,
    headerDescription,
    headerCloseButton,
    headerDeleteButton,
    headerCancelButton,
    headerButton,
    onHeaderClose = () => { },
    onHeaderClick = () => { },
    onHeaderClickCancel = () => { },
    onHeaderClickDelete = () => { },
    headerButtonCondition,
    // STEPS MINI HEADER
    showEditingSteps,
    selectedEditingStep,
    setSelectedEditingStep,
    isLoading,
    uploadProgress,
    transitionDuration = 400,
    // CONTENT
    mainContent,
    miniSheets,
    // CONTROL BAR
    showControlBar = true,
    controlBarButtonText,
    showControlBarCancelButton,
    showControlBarDeleteButton,
    controlBarButtonCondition,
    onControlBarButtonClick,
    onControlBarCancelButtonClick
}: EditingSheetInterface) {

    const WINDOW_WIDTH = WindowWidth()
    const WINDOW_HEIGHT = WindowHeight()

    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>

            <Helmet>
                <meta charSet="utf-8" />
                <title>{helmetTitle}</title>
            </Helmet>

            {/* Black background */}
            <div className='w-full h-full bg-black bg-opacity-70' onClick={() => { }} />

            {/* Sheet */}
            <div className='absolute bg-white rounded-lg flex justify-start items-start overflow'
                style={{
                    // DYNAMIC SHEET DIMENSIONS
                    width: "70%",
                    height: "85%",
                    maxWidth: WINDOW_WIDTH - ((20 + 50 + 20) * 2),
                    maxHeight: WINDOW_HEIGHT - (20 * 2),
                }}
            >
                {/* SHEET'S UI CONTENT */}
                <div className='flex flex-col items-center justify-between w-full h-full'>


                    {/* TOP */}
                    <>
                        <EditingSheetHeader
                            text={headerTitle}
                            onclose={() => { onHeaderClose() }}
                            onClickCancel={() => { onHeaderClickCancel() }}
                            description={headerDescription}
                            deleteButton={headerDeleteButton}
                            closeButton={headerCloseButton}
                            cancelButton={headerCancelButton}
                            doneButton={headerButton}
                            onClickDelete={() => { onHeaderClickDelete() }}
                            onClick={() => { onHeaderClick() }}
                            condition={headerButtonCondition}
                        />

                        {/* STEPS / PROGRESS (OUTER_PADDING + INNER_PADDING)*/}
                        {showEditingSteps &&
                            <EditingSheetStepsHeader selected_editing_step={selectedEditingStep} setSelectedEditingStep={setSelectedEditingStep} is_loading={isLoading} progress={uploadProgress} transitionDuration={transitionDuration} />
                        }
                    </>


                    {/* MIDDLE -> SUBSHEET */}
                    {mainContent}


                    {/* BOTTOM -> CONTROL BAR */}
                    {(showControlBar) &&
                        <EditingSheetControlBar
                            buttonText={controlBarButtonText}
                            cancelButton={showControlBarCancelButton}
                            deleteButton={showControlBarDeleteButton}
                            condition={controlBarButtonCondition}
                            onClick={() => { onControlBarButtonClick() }}
                            onClickCancel={() => { onControlBarCancelButtonClick() }}
                        />
                    }

                    {/* MINI SHEETS */}
                    {miniSheets}

                </div>
            </div>
        </div >
    )
}



