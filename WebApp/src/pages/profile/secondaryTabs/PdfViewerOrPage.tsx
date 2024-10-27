import React, { useState, useEffect } from "react"
import localization from "../../../utils/localizations"
import Colors from '../../../assets/Colors'
import Divider from "../../../components/Divider"
import TextStyles from "../../../styles/TextStyles"
import PdfInfoPageOrViewer from "./PdfInfoPageOrViewer"
import { Page, PhoneNumberObj, Timetables } from "../../../Data"
import { ClassicButton, SheetCloseButton } from "../../../components/Buttons"
import { getFileName, getSegmentsFromUrl, isMobileHook } from "../../../components/functions"
import { ClassicHeader, PdfViewerHeader } from '../../../components/headersComponents'
import { WindowHeight } from "../../../components/WindowHeight"
import { WindowWidth } from "../../../components/WindowWidth"
import { ClockIcon, PhoneIcon } from "../../../components/Icons"
import { animateLoadingBar } from "../../../components/LoadingBar"
import { Link, useNavigate } from "react-router-dom"


// Global data
import { useSelector } from "react-redux"
import { selectUiStates } from "../../../state/slices/uiStatesSlice"
import { selectPagesProfiles } from "../../../state/slices/profilesSlice"
import { InfoWithSymbolUI } from "../../../components/InfoDisplay"
import { InformationType } from "../../../Types"
import { DailyTimetablesList } from "../../../components/DailyTimetablesList"
import { ScreenViewTracker } from "../../../analytics"
import { BORDER_RADIUS, INNER_PADDING, OUTER_PADDING } from "../../../components/editingSheetRelated.tsx"
import { isChrome } from "react-device-detect"





const isMobile = isMobileHook()





interface PdfViewerOrPdfPageInterface {
    page: Page
    isMenuPdf: boolean
    onClose: () => any
}
/**
 * On wide devices : looks like a rounded action sheet with a black background behind.
 * On thin devices : fills the entire sheet.
 */
export default function PdfViewerOrPdfPage({ page, isMenuPdf, onClose }: PdfViewerOrPdfPageInterface) {



    // States 
    const [isLoading, setIsLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [selectedTimetablesIndex, setSelectedTimetablesIndex]: [number, (_: any) => any] = useState(0)


    // Values 
    const windowWidth = WindowWidth()
    const windowHeight = WindowHeight()
    const navigate = useNavigate()
    const urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    const username = urlSegments[0]
    const dummyIsUserAccount = false



    // Global data
    const uiStates = useSelector(selectUiStates)
    const profile = useSelector(selectPagesProfiles).find(e => { return e.page.username === username })?.profile
    const phoneNumber = profile?.phone_number ?? PhoneNumberObj("", "", "")

    const showTimetables = urlSegments[2] === "info"
    const profileHasPhoneNumber = ((profile?.phone_number?.number ?? "").replace(/\s+/g, '') !== "")
    const menuHasTimetables = (profile?.menu_timetables ?? []).length > 0
    const hasAPdf = (profile?.additional_resources ?? []).includes(isMenuPdf ? "menu" : "map")

    const callUrl = `tel:+` + phoneNumber.calling_code + phoneNumber.number.replace("0", "")
    const selectedTimetables = (profile?.menu_timetables ?? [])[selectedTimetablesIndex]


    // Ui 
    let bottombuttons =
        (isMenuPdf && (menuHasTimetables || profileHasPhoneNumber)) &&
        <>
            <Divider />
            <div className='flex items-center justify-center' style={{ height: 44.5 + (8 * 2), width: "100%", backgroundColor: Colors.bgDarkGray }}>



                {(isMenuPdf && menuHasTimetables) &&
                    <ClassicButton
                        icon={<ClockIcon color="white" fontSize={21} />}
                        text={localization.see_menu_timetables}
                        onClick={() => { navigate(`/${username}/${isMenuPdf ? "menu" : "map"}/info/`) }}
                        textColor={Colors.white}
                        backgroundColor={Colors.bgGray}
                        smallAppearance
                        horizontalMargin={8}
                    />
                }



                {(isMenuPdf && profileHasPhoneNumber) &&
                    <a href={callUrl} >
                        <ClassicButton
                            icon={<PhoneIcon color="white" fontSize={21} />}
                            text={localization.order}
                            onClick={() => { }}
                            textColor={Colors.white}
                            backgroundColor={Colors.bgGray}
                            smallAppearance
                            horizontalMargin={8}
                        />
                    </a>
                }

            </div>
        </>




    useEffect(() => {
        if (hasAPdf) startPdfLoadingAnimation()
    }, [])
    async function startPdfLoadingAnimation() {

        // Ui
        if (loaded) return
        setIsLoading(true)
        animateLoadingBar(0, 0)
        animateLoadingBar(15, isChrome ? 600 : 300)

        setTimeout(() => animateLoadingBar(93, isChrome ? 5500 : 4300), (isChrome ? 600 : 300))

    }
    async function endPdfLoadingAnimation() {
        if (!isLoading) return
        animateLoadingBar(100, 200)
        setTimeout(() => {
            setIsLoading(false)
            animateLoadingBar(0, 10)
            setLoaded(true)
        }, 200)
    }




    // Is used for indicating that there is no menu to display for the moment.
    if (isMobile) {
        return (
            <div
                className={`flex flex-col h-full z-50 w-full absolute top-0`}
                style={{
                    backgroundColor: Colors.bgDarkGray
                }}>
                <ScreenViewTracker screen_name={"pdf_viewer"} />

                <ClassicHeader
                    closeButtonType={"xmark"}
                    onClose={() => { onClose() }}
                    onClick={async () => {
                        navigate(`/${username}/${isMenuPdf ? "menu" : "map"}/edit/`)
                    }}
                    headerText={isMenuPdf ? localization.menu : localization.map}
                    hideLoadingIndicator={true}
                    sticky
                    backgroundColor={Colors.bgDarkGray}
                    textColor={"white"}
                    loadingBarColor={Colors.bgGray}
                    isLoading={isLoading}
                    showLoadingBar
                />

                {hasAPdf ?
                    <div className='h-full w-screen'>
                        {/* TODO: Adjust iFrame's height and width based on it's content */}
                        <iframe
                            width={"100%"}
                            height={"100%"}
                            src={`https://www.atsightcdn.com/${getFileName("pdf", page.short_id, undefined, isMenuPdf)}`}
                            style={{ backgroundColor: Colors.bgDarkGray, border: 0 }}
                            allowTransparency
                            onLoad={() => {
                                setTimeout(() => {

                                    endPdfLoadingAnimation()
                                }, (isChrome ? 6200 : 50))
                            }}
                        />
                    </div>
                    :
                    <div className='flex flex-1 items-center justify-center'>
                        <p className='text-center' style={Object.assign({}, TextStyles.noContentFont, { padding: 30 })}>{isMenuPdf ? localization.no_menu_to_display : localization.no_map_to_display}</p>
                    </div>
                }

                {/** 
                 * {bottombuttons}
                */}

                {((urlSegments[2] === "edit" && dummyIsUserAccount) || (urlSegments[2] === "info")) &&
                    <PdfInfoPageOrViewer page={page} isMenuPdf={isMenuPdf} onClose={() => { onClose() }} />
                }

            </div >
        )
    }
    else {
        return (
            <div className='fixed inset-0 flex justify-center items-center z-50'>

                <ScreenViewTracker screen_name={"pdf_info"} />

                <div className='flex w-full h-full absolute z-30 bg-black bg-opacity-70' onClick={() => { onClose() }} />

                {/* PDF Sheet */}
                <div
                    className='rounded-xl flex flex-col bg-clip-content overflow-hidden z-50' style={{
                        width: windowWidth * 70 / 100,
                        height: "85%",
                        maxWidth: windowWidth - ((20 + 50 + 20) * 2),
                        maxHeight: windowHeight - (20 * 2),
                        backgroundColor: Colors.bgDarkGray
                    }}>

                    <PdfViewerHeader
                        main_text={isMenuPdf ? localization.menu : localization.map}
                        text={localization.timetables_related_to_menu}
                        header_description_div={selectedTimetables.subject ? <p className='text-start line-clamp-1 whitespace-pre' style={Object.assign({}, TextStyles.gray13Text, { paddingInline: INNER_PADDING / 2 })}>{"-"}   {`${selectedTimetables.subject}`}</p> : undefined}
                        onClose={() => { navigate(-1) }}
                        closeButton={showTimetables}
                        showTimetables={showTimetables}
                        isLoading={isLoading}
                        loadingBarColor={Colors.bgGray}
                    />

                    {/* PDF's CONTENT */}
                    <div className='relative flex flex-col items-center justify-center w-full h-full'>
                        {hasAPdf ?
                            /* TODO: Adjust iFrame's height and width based on it's content */
                            <iframe
                                width={"100%"}
                                height={"100%"}
                                src={`https://www.atsightcdn.com/${getFileName("pdf", page.short_id, undefined, isMenuPdf)}`}
                                style={{ backgroundColor: Colors.bgDarkGray, border: 0 }}
                                allowTransparency
                                onLoad={() => {
                                    setTimeout(() => {
                                        endPdfLoadingAnimation()
                                    }, 50)
                                }}
                            />
                            :
                            <div className='flex flex-1 items-center justify-center'>
                                <p style={Object.assign({}, TextStyles.noContentFont)}>{isMenuPdf ? localization.no_menu_to_display : localization.no_map_to_display}</p>
                            </div>
                        }

                        {bottombuttons}

                        {/* SUB SHEETS */}
                        {(showTimetables) &&
                            <div className='absolute w-full h-full z-50' style={{ backgroundColor: Colors.bgDarkGray }}>
                                <PdfTimetablesSubSheet
                                    selectedTimetablesIndex={selectedTimetablesIndex}
                                    setSelectedTimetablesIndex={setSelectedTimetablesIndex}
                                    menu_timetables={profile?.menu_timetables ?? []}
                                    selectedTimetables={selectedTimetables}
                                />
                            </div>
                        }

                    </div>
                </div >

            </div >
        )
    }
}










interface PdfTimetablesSubSheetInterface {
    selectedTimetablesIndex: number
    setSelectedTimetablesIndex: (_: number) => any
    menu_timetables: Timetables[]
    selectedTimetables: Timetables
}
/**
 * (WIDE DEVICES ONLY)
 */
function PdfTimetablesSubSheet({ selectedTimetablesIndex, setSelectedTimetablesIndex, menu_timetables, selectedTimetables }: PdfTimetablesSubSheetInterface) {

    return (
        <div className='relative overflow-y-scroll flex flex-col items-start justify-start h-full w-full' style={{ paddingInline: INNER_PADDING }}>
            <div id="localization_row" className='flex items-start justify-start w-full h-full'>
                <div id={"left"} style={{ width: "50%", paddingTop: INNER_PADDING / 1.5, paddingRight: INNER_PADDING, paddingBottom: OUTER_PADDING }} className='flex flex-col justify-start items-start h-full'>

                    {/* TIMETABLES LIST */}
                    <div className='w-full border overflow-hidden' style={{ borderColor: Colors.borderGray, borderRadius: BORDER_RADIUS }}>
                        <ul>
                            {menu_timetables.map((e, index) => {

                                const tabIsSelected = selectedTimetablesIndex === index

                                return (
                                    <InfoWithSymbolUI
                                        key={index}
                                        infoType={'timetables' as InformationType}
                                        infoValue={e}
                                        displayInBlue={false}
                                        displayChevron={true}
                                        pressable={true}
                                        setSelectedInfoValue={() => { setSelectedTimetablesIndex(index) }}
                                        setSelectedInfoType={() => { }}
                                        isSelected={tabIsSelected}
                                        backgroundColor={Colors.bgGray}
                                        blackAppearance
                                    />
                                )
                            })}
                        </ul>
                    </div>

                </div>

                {/* DIVIDER */}
                <div className='h-full' style={{ borderColor: Colors.borderGray, borderWidth: 0.5 }} />

                <div id={"right"} style={{ width: "50%", paddingTop: INNER_PADDING / 1.5, paddingLeft: INNER_PADDING, paddingBottom: OUTER_PADDING }} className='flex flex-col justify-start items-start h-full'>

                    {/* DETAILS */}
                    <div className='w-full border overflow-hidden' style={{ borderColor: Colors.borderGray, borderRadius: BORDER_RADIUS }}>
                        <DailyTimetablesList
                            timetables={selectedTimetables}
                            editable={false}
                            setDailyTimetablesOfThatDay={() => { }}
                            backgroundColor={Colors.bgGray}
                            blackAppearance
                        />
                    </div>

                </div>

            </div>
        </div>
    )
}


