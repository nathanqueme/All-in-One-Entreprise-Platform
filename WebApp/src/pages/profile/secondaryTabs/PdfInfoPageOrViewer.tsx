//
//  PdfInfoPageOrViewer.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 09/06/22.
//


import React, { useState, useCallback, useEffect } from 'react'
import Colors from './../../../assets/Colors'
import TextStyles from '../../../styles/TextStyles'
import localization from '../../../utils/localizations'
import SectionAppearance from '../../../components/SectionAppearance'
import Divider from '../../../components/Divider'
import Alert from '../../../components/sheets/Alert'
import { FileImporterButton, SheetCloseButton, SimpleCenteredButton } from '../../../components/Buttons'
import { WindowWidth } from '../../../components/WindowWidth'
import { WindowHeight } from '../../../components/WindowHeight'
import { AccountMainDataObj, FileImporterOutput, GeolocationObj, Page, Timetables } from '../../../Data'
import { EditablePageHeader } from '../../../components/headersComponents/EditablePageHeader'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates } from '../../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles } from '../../../state/slices/profilesSlice'
import { arrayEquals, getSegmentsFromUrl, isMobileHook } from '../../../components/functions'
import { InfoWithSymbolUI } from '../../../components/InfoDisplay'
import { InformationType } from '../../../Types'
import { BottomSheet } from '../../../components/sheets'
import { getTimetablesDescriptiveText } from '../../../components/TimetablesRelated'
import { DailyTimetablesList } from '../../../components/DailyTimetablesList'
import { ScreenViewTracker } from '../../../analytics'


const isMobile = isMobileHook()


interface PdfInfoPageOrViewerInterface {
    page: Page
    isMenuPdf: boolean
    onClose: () => any
}
export default function PdfInfoPageOrViewer({ page, isMenuPdf, onClose }: PdfInfoPageOrViewerInterface) {


    // States 
    const [originalHasAPdf, setOriginalHasAPdf]: [boolean, any] = useState(false)
    const [originalMenuTimetables, setOriginalMenuTimetables]: [Timetables[], any] = useState([])
    const [hasAPdf, setHasAPdf]: [boolean, any] = useState(false)
    const [pdfUri, setPdfUri]: [string, any] = useState("")
    const [menuTimetables, setMenuTimetables]: [Timetables[], any] = useState([])
    // 
    const [pdfWasChanged, setPdfWasChanged]: [boolean, any] = useState(false)
    const [bottomSheet, setBottomSheet] = useState(false)
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)
    // 
    const [timetablesEditor, setTimetablesEditor] = useState(false)
    const [selectedTimetables, setSelectedTimetables] = useState<Timetables | undefined>(undefined)
    const [toLargeFileAlert, setToLargeFileAlert] = useState(false)


    // Values
    const dispatch = useDispatch()
    const navigate = useNavigate()
    let windowWidth = WindowWidth()
    let windowHeight = WindowHeight()
    let urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    let username = urlSegments[0]
    let editingMode = urlSegments[2] === "edit"


    // Global data
    const uiStates = useSelector(selectUiStates)
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.username === username })



    let isUserAccount = false // (page.account_id === uiStates.account_id && page.account_id !== "")
    let showTimetablesSheet = window.location.href.includes("#timetables")
    // 
    let a = menuTimetables.flatMap((e) => { return e.type + e.daily_timetables.flatMap(e => e.end_time + e.special_time + e.start_time) + e.subject })
    let b = originalMenuTimetables.flatMap(e => { return e.type + e.daily_timetables.flatMap(e => e.end_time + e.special_time + e.start_time) + e.subject })
    let menuTimetablesWereChanged = !arrayEquals(a, b)
    let metadataWasChanged =
        pdfWasChanged ||
        menuTimetablesWereChanged





    // Initialization
    useEffect(() => {

        // Shallow copy 
        let oHasAPdf = (pageProfile?.profile.additional_resources ?? []).includes(isMenuPdf ? "menu" : "map")

        setOriginalHasAPdf(oHasAPdf)
        setHasAPdf(oHasAPdf)

        // Shallow copy 
        if (isMenuPdf) {
            let oMenuTimetables = pageProfile?.profile.menu_timetables ?? []
            setOriginalMenuTimetables([...oMenuTimetables])
            setMenuTimetables(oMenuTimetables)
        }

    }, [])



    function handlePdfSelection(fileImporterOutput: FileImporterOutput) {
        try {

            let sizeInBytes = fileImporterOutput.size
            let sizeInMegaBytes = Number((sizeInBytes / 1000000).toFixed(1))


            if (sizeInMegaBytes > 2) {
                setToLargeFileAlert(true)

            } else {
                setPdfUri(fileImporterOutput.uri)
                setHasAPdf(true)
                setPdfWasChanged(true)
            }


        } catch (err) {
            console.warn(err)
        }
    }





    async function publishMenuAndItsInformation(deleteAction: boolean) { }






    if (isMobile) {
        return (
            <div className='flex flex-col top-0 h-full w-full absolute items-center' style={{ zIndex: 60, backgroundColor: Colors.whiteToGray2 }}>

                <ScreenViewTracker screen_name={"pdf_info"} />

                <EditablePageHeader
                    onClose={() => { navigate(-1) }}
                    onClick={async () => {

                        await publishMenuAndItsInformation(false)

                    }}
                    editingMode={editingMode}
                    isUserAccount={isUserAccount}
                    accountMainData={pageAccountMainData?.account_main_data ?? AccountMainDataObj("", "", "", "", "", "hotel", false, false, GeolocationObj("", "", "", "", "", "", 0, 0))}
                    description={isMenuPdf ? localization.menu : localization.map}
                    withCancelButton={true}
                    closeButtonType={"xmark"}
                    isLoading={isLoading}
                    condition={metadataWasChanged}
                    hideEditButtonWhenNotEditing={!editingMode}
                />


                <div className='flex flex-col w-full h-full overflow-scroll' style={{ backgroundColor: Colors.whiteGray, paddingTop: 40, paddingBottom: 40 }}>
                    <SectionAppearance
                        width={"100%"}
                        text={editingMode ?
                            (isMenuPdf ? localization.menu_pdf_and_timetables : localization.map_pdf)
                            :
                            localization.timetables_of_menu
                        }
                    >
                        {/* Pdf uploader */}
                        <div
                            className={`flex flex-col items-center justify-center ${editingMode ? "pointer-events-auto " : "pointer-events-none"}`}
                            style={{
                                backgroundColor: Colors.whiteToGray2,
                                paddingTop: editingMode ? 35 : 0,
                                paddingBottom: editingMode ? 35 : 0
                            }}>



                            {editingMode &&
                                <FileImporterButton
                                    uri={''}
                                    setOutput={(output) => {
                                        handlePdfSelection(output)
                                    }}
                                    contentType={hasAPdf ? "pdf" : "any"}
                                    acceptedFiles=".pdf"
                                />
                            }


                            {editingMode &&
                                <p className='text-center' style={Object.assign({}, TextStyles.gray13Text, { paddingLeft: 70, paddingRight: 70, paddingTop: 10 })}
                                >{(hasAPdf ? localization.press_to_switch_pdf : localization.press_to_import_pdf)}</p>
                            }

                        </div>


                        {/* Timetables */}
                        {isMenuPdf &&
                            <div>
                                {menuTimetables.map((e, index) => {
                                    return (
                                        <InfoWithSymbolUI
                                            key={index}
                                            infoType={'timetables' as InformationType}
                                            infoValue={e}
                                            displayInBlue={false}
                                            displayChevron={true}
                                            pressable={true}
                                            setSelectedInfoValue={() => {

                                                if (editingMode) {
                                                    setSelectedTimetables(e)
                                                    setTimetablesEditor(true)
                                                } else {
                                                    setSelectedTimetables(e)
                                                    navigate(`${username}/${isMenuPdf ? "menu" : "map"}/info#timetables/`)
                                                }

                                            }}
                                            setSelectedInfoType={() => { }}
                                        />
                                    )
                                })}

                                {editingMode &&
                                    <div style={{ paddingTop: 20, backgroundColor: Colors.whiteToGray2 }}>
                                        <p style={Object.assign({}, TextStyles.gray13Text, { paddingLeft: 20, paddingRight: 20, marginBottom: 10 })}
                                        >{localization.add_timetables_to_menu}</p>

                                        <Divider />

                                        <SimpleCenteredButton
                                            onClick={() => { setTimetablesEditor(true); setSelectedTimetables(undefined) }}
                                            text={localization.add_timetables}
                                            marginVertical={0}
                                            hideTopDivider={true}
                                            hideBottomDivider={true}
                                        />

                                    </div>
                                }
                            </div>
                        }


                    </SectionAppearance>


                    {/* Delete button */}
                    {(editingMode && originalHasAPdf) &&
                        <div style={{ paddingTop: 40 }} >
                            <Divider />
                            <SimpleCenteredButton
                                onClick={() => {
                                    /*
                                    isMenuPdf ?
                                        alert(
                                            localization.sure_want_remove_menu,
                                            localization.removing_menu_consequences,
                                            [
                                                {
                                                    text: localization.cancel,
                                                    style: "cancel"
                                                },
                                                { text: localization.delete, style: "destructive", onPress: async () => { await publishMenuAndItsInformation(true) } }
                                            ])
                                        :
                                        alert(
                                            localization.sure_want_remove_map,
                                            localization.removing_map_consequences,
                                            [
                                                {
                                                    text: localization.cancel,
                                                    style: "cancel"
                                                },
                                                { text: localization.delete, style: "destructive", onPress: async () => { await publishMenuAndItsInformation(true) } }
                                            ])
                                            */

                                }}
                                text={isMenuPdf ? localization.remove_all : localization.remove}
                                marginVertical={0}
                                hideTopDivider={true}
                                hideBottomDivider={true}
                                destructiveColor={true}
                            />
                            <Divider />
                        </div>
                    }
                </div>


                <Alert
                    title={localization.pdf_size_error_title}
                    description={localization.pdf_size_error_message}
                    show={toLargeFileAlert}
                    actionSheetClick={(index) => {
                        setToLargeFileAlert(false)
                    }}
                />


                <BottomSheet
                    options={[]}
                    headerText={(selectedTimetables?.subject ?? "") !== "" ? selectedTimetables?.subject ?? "" : getTimetablesDescriptiveText(selectedTimetables?.type ?? 'opening_hours', selectedTimetables?.subject ?? "")}
                    show={showTimetablesSheet}
                    content_height={60 * 7 + ((selectedTimetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                    content={
                        selectedTimetables !== undefined ?
                            <DailyTimetablesList
                                timetables={selectedTimetables}
                                editable={false}
                                setDailyTimetablesOfThatDay={() => { }}
                                backgroundColor={Colors.whiteToGray}
                            />
                            :
                            <div style={{ height: 60 * 7 }} />
                    } />



            </div>
        )
    }
    else {
        return (
            // Black background
            <div className='fixed inset-0 flex justify-center items-center z-50'>

                <ScreenViewTracker screen_name={"pdf_info"} />

                <div className='flex w-full h-full absolute z-30 bg-black bg-opacity-70' onClick={() => { onClose() }} />

                {/* Close button */}
                <SheetCloseButton onClick={() => { onClose() }} />

                {/* Sheet */}
                <div
                    className='rounded-xl flex flex-col bg-clip-content overflow-hidden z-50' style={{
                        width: windowWidth * 70 / 100,
                        height: "85%",
                        maxWidth: windowWidth - ((20 + 50 + 20) * 2),
                        maxHeight: windowHeight - (20 * 2),
                        backgroundColor: Colors.bgDarkGray
                    }}>


                    <div className='flex flex-1 items-center justify-center'>
                        <p style={Object.assign({}, TextStyles.noContentFont)}>{isMenuPdf ? localization.no_menu_to_display : localization.no_map_to_display}</p>
                    </div>

                </div >

            </div >
        )
    }

}



