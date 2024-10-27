import React, { useState, useEffect } from 'react'
import localization from '../../utils/localizations'
import TextStyles from '../../styles/TextStyles'
import Colors from '../../assets/Colors'
import Divider from '../Divider'
import { InfoWithSymbolUI } from '../InfoDisplay'
import { WindowHeight } from '../WindowHeight'
import { WindowWidth } from '../WindowWidth'
import { TimetablesObj } from '../../Data'
import { BottomSheet } from '../sheets'
import { getFileName, getRelatedItemPhotoAlt, getSegmentsFromUrl } from '../functions'
import { getTimetablesTypeDescriptiveText } from '../TimetablesRelated'
import { GoLeftOrRightButton, SheetCloseButton } from '../Buttons'
import { TranslatableExpandableText } from '../ExpandableText'
import { DailyTimetablesList } from '../DailyTimetablesList'
import { useNavigate } from 'react-router-dom'


// Global data
import { useSelector } from 'react-redux'
import { selectPagesRelatedItems } from '../../state/slices/relatedItemsSlice'





interface RelatedItemUiInterface {
    isUserAccount: boolean,
    account_name: string,
    onClose: () => any
}
/**
 * Displays the image and the information of a related items. (Something in the place)
*/
export default function RelatedItemViewer({ isUserAccount, account_name, onClose }: RelatedItemUiInterface) {


    // States   
    const [showAlt, setShowAlt] = useState(false)
    const [showLeftChevron, setShowLeftChevron] = useState(false)
    const [showRightChevron, setShowRightChevron] = useState(false)
    const [displayImage, setDisplayImage] = useState(false)


    // Values
    const navigate = useNavigate()
    const windowWidth = WindowWidth()
    const windowHeight = WindowHeight()
    let urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    const username = urlSegments[0]
    const related_item_id = urlSegments[2]


    // Global values 
    const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.username === username })
    const relatedItem = pageRelatedItems?.related_items.find(e => { return e.item_id === related_item_id })

    let timetables = relatedItem?.timetables ?? TimetablesObj('opening_hours', [], '')
    let hasALink = typeof (relatedItem?.link ?? 'undefined') === 'object' && (relatedItem?.link?.url ?? '') !== ''
    let hasTimetables = timetables.daily_timetables.length > 0




    /**
      let dummyRelatedItem2 = RelatedItemObj("eu-west-1:1445a5af-bb6d-4a5e-b86d-4887a2970be6", "QWK3dUbpn", "The spa", ImageDataObj(src), "2022-06-11T11:59:43.655Z", TimetablesObj("opening_hours", generateDefaultDailyTimetables()), {
        "en": "The spa is a great way to relax in a peaceful environment after a busy day."
       }, "Stage -1", LinkObj("Website link", "https://www.fourseasons.com/paris/spa/"))
    */
    useEffect(() => {
        setTimeout(() => {
            setDisplayImage(true) // Avoids an issue while loading the image : without this the image is only loaded halfly (right part missing).
        }, 360)
    }, [])





    // BOTTOM SHEETS_____________________________________ 
    const editingSheetOptions = [localization.delete, localization.edit, localization.cancel]
    // 
    let showEditingSheet = window.location.href.includes("#edit")
    let showTimetablesSheet = window.location.href.includes("#timetables")
    function handleEditingSheet(buttonIndex: number) {

        navigate(-1)

        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: console.log("delete"); break
                case 1: console.log("edit"); break
                default: break
            }
        }, 320)

    }
    //___________________________________________________



    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>

            {/* Black background */}
            <div className='w-full h-full bg-black bg-opacity-70' onClick={() => { onClose() }} />

            {/* Close button */}
            <SheetCloseButton onClick={() => { onClose() }} />

            {/* Show previous one */}
            {showLeftChevron &&
                <div className='absolute left-0'
                    style={{
                        marginLeft: 20,
                        marginRight: 20
                    }}>
                    <GoLeftOrRightButton onClick={() => { }} leftDirection />
                </div>
            }

            {/* Sheet */}
            <div className='absolute bg-white rounded-tl-lg rounded-bl-lg flex justify-start items-start overflow-hidden'
                style={{
                    width: "70%",
                    height: "85%",
                    maxWidth: windowWidth - ((20 + 50 + 20) * 2),
                    maxHeight: windowHeight - (20 * 2),
                }}
            >
                <div id={"1"} className='flex flex-col justify-between items-start w-5/12 h-full'>
                    {/* Name + description + Translate button */}
                    <div className='flex flex-col justify-start items-start overflow-scroll mb-1' style={{
                        paddingTop: 20,
                        paddingLeft: 20,
                        paddingRight: 20,
                    }}>
                        <p style={Object.assign({}, TextStyles.bold15)}>{relatedItem?.name ?? ""}</p>

                        <TranslatableExpandableText
                            description={relatedItem?.description ?? {}}
                            description_localization={relatedItem?.description_localization}
                            textType={"related_item_description"}
                            uniqueId={relatedItem?.account_id ?? "" + relatedItem?.item_id ?? ""}
                            maximumLines={1000}
                            marginTop={11}
                        />
                    </div>

                    {/* Buttons (Website + Address + Edit) */}
                    <div className='flex flex-col items-start justify-start w-full' style={{}}>

                        <Divider />

                        {(hasALink) &&
                            <a href={relatedItem!.link?.url} className="w-full">
                                <InfoWithSymbolUI
                                    infoType={'website_link'}
                                    infoValue={relatedItem!.link?.url}
                                    displayInBlue={true}
                                    displayChevron={true}
                                    pressable={true}
                                    customDisplayName={relatedItem?.link?.name ?? ''}
                                    displayNameInstead={true}
                                    setSelectedInfoValue={(url: string) => { }}
                                    setSelectedInfoType={() => { }}
                                    paddingLeft={20}
                                    paddingRight={20}
                                />
                            </a>
                        }

                        {(hasTimetables) &&
                            <InfoWithSymbolUI
                                infoType={'timetables'}
                                infoValue={timetables}
                                displayInBlue={false}
                                displayChevron={true}
                                pressable={true}
                                setSelectedInfoValue={() => {
                                    navigate(`${window.location.pathname.slice(0, -1)}#timetables/`)
                                }}
                                setSelectedInfoType={() => { }}
                                paddingLeft={20}
                                paddingRight={20}
                            />
                        }

                        <InfoWithSymbolUI
                            infoType={'location_in_place'}
                            infoValue={relatedItem?.simple_location ?? ''}
                            displayInBlue={false}
                            displayChevron={false}
                            pressable={false}
                            setSelectedInfoValue={() => {
                            }}
                            setSelectedInfoType={() => { }}
                            paddingLeft={20}
                            paddingRight={20}
                        />

                        {isUserAccount &&
                            <InfoWithSymbolUI
                                infoType={'options'}
                                infoValue={localization.options}
                                displayInBlue={false}
                                displayChevron={false}
                                pressable={true}
                                setSelectedInfoValue={() => { }}
                                setSelectedInfoType={() => { 
                                    navigate(`${window.location.pathname.slice(0, -1)}#edit/`)
                                }}
                                paddingLeft={20}
                                paddingRight={20}
                            />
                        }

                    </div>
                </div>
                <div id={"2"} className='w-7/12 h-full' style={{ backgroundColor: displayImage ? "black" : Colors.lightGray }}>
                    {displayImage &&
                        <img src={`https://www.atsightcdn.com/${getFileName("related_item", pageRelatedItems?.page.short_id ?? "", related_item_id)}`} alt={getRelatedItemPhotoAlt(relatedItem?.created_date ?? "", account_name)} className={`align-middle object-contain h-full w-full`} loading="lazy"  style={{ color: showAlt ? Colors.smallGrayText : "transparent" }} onLoad={() => { setShowAlt(true) }} onError={() => { setShowAlt(true) }}/>
                    }
                </div>
            </div>

            {/* Show next one */}
            {showRightChevron &&
                <div className='absolute right-0'
                    style={{
                        marginLeft: 20,
                        marginRight: 20
                    }}>
                    <GoLeftOrRightButton onClick={() => { }} />
                </div>
            }


            {/* Sheets */}
            <BottomSheet
                show={showEditingSheet}
                options={editingSheetOptions}
                handleClick={handleEditingSheet}
            />
            <BottomSheet
                options={[]}
                headerText={getTimetablesTypeDescriptiveText(timetables?.type ?? 'opening_hours')}
                show={showTimetablesSheet}
                content_height={60 * 7 + ((timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                content={
                    hasTimetables ?
                        <DailyTimetablesList
                            timetables={timetables ?? {} as any}
                            editable={false}
                            setDailyTimetablesOfThatDay={() => { }}
                            backgroundColor={Colors.whiteToGray}
                        />
                        :
                        <div style={{ height: 60 * 7 }} />
                } />

        </div >
    )
}






