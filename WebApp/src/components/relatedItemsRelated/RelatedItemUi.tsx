
import React, { useState } from 'react'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import { RelatedItem, TimetablesObj } from '../../Data'
import { InfoWithSymbolUI } from '../InfoDisplay'
import { TranslatableExpandableText } from '../ExpandableText'
import { getFileName, getRelatedItemPhotoAlt, isMobileHook } from '../functions'



const isMobile = isMobileHook()



interface RelatedItemUiInterface {
    relatedItem: RelatedItem,
    isUserAccount: boolean,
    onClickTimetables: () => any
    onClickEdit: () => any
    account_name: string
    short_id: string
}
/**
 * 
 * (THIN & LARGE DEVICES)
 * 
 * Displays a related item's photo, name, description, extra info and the "Actions" the user can do.
*/
export default function RelatedItemUi({ relatedItem, isUserAccount, onClickTimetables, onClickEdit, account_name, short_id }: RelatedItemUiInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values 
    let has_a_Link = typeof (relatedItem?.link ?? 'undefined') === 'object' && (relatedItem?.link?.url ?? '') !== ''
    let timetables = relatedItem?.timetables ?? TimetablesObj('opening_hours', [], '')


    // UI 
    const LOCATION_INFO_UI =
        <InfoWithSymbolUI
            infoType={'location_in_place'}
            infoValue={relatedItem?.simple_location ?? ''}
            displayInBlue={false}
            displayChevron={false}
            pressable={false}
            setSelectedInfoValue={() => { }}
            setSelectedInfoType={() => { }}
            paddingLeft={20}
            paddingRight={20}
            backgroundColor={Colors.whiteGray}
            displayInfoTypeName
        />

    const TIMETABLES_INFO_UI =
        <InfoWithSymbolUI
            infoType={'timetables'}
            infoValue={timetables}
            displayInBlue={false}
            displayChevron={true}
            pressable={true}
            setSelectedInfoValue={() => { onClickTimetables() }}
            setSelectedInfoType={() => { }}
            paddingLeft={20}
            paddingRight={20}
            backgroundColor={Colors.whiteGray}
        />

    const LINK_INFO_UI =
        <InfoWithSymbolUI
            infoType={'link'}
            infoValue={relatedItem?.link?.url ?? ''}
            displayInBlue={true}
            pressable={true}
            customDisplayName={relatedItem?.link?.name ?? ''}
            displayNameInstead={true}
            setSelectedInfoValue={(url: string) => {  }}
            setSelectedInfoType={() => { }}
            paddingLeft={20}
            paddingRight={20}
            backgroundColor={Colors.whiteGray}

        />

    const OPTIONS_INFO_UI =
        <InfoWithSymbolUI
            infoType={'options'}
            infoValue={localization.options}
            displayInBlue={false}
            displayChevron={false}
            pressable={true}
            setSelectedInfoValue={() => { }}
            setSelectedInfoType={() => { onClickEdit() }}
            paddingLeft={20}
            paddingRight={20}
        />



    if (isMobile) {
        return (
            <li id={`${relatedItem.item_id}_div`} className={`flex flex-col justify-start items-start overflow-hidden`} style={{ width: window.screen.width, marginBottom: 10 }}>
                <img src={`https://www.atsightcdn.com/${getFileName("related_item", short_id, relatedItem.item_id)}`} alt={getRelatedItemPhotoAlt(relatedItem.created_date, account_name)} className={`align-middle object-cover`} width={window.screen.width} style={{ backgroundColor: Colors.lightGray, color: showAlt ? Colors.smallGrayText : "transparent" }} loading="lazy" onLoad={() => { setShowAlt(true) }} onError={() => { setShowAlt(true) }} />

                <div className='flex flex-col justify-start items-start' style={{ paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
                    {/* Name */}
                    <p style={Object.assign({}, TextStyles.bold15)}>{relatedItem.name}</p>

                    {/* Description + Translate button */}
                    <TranslatableExpandableText
                        description={relatedItem?.description ?? {}}
                        description_localization={relatedItem?.description_localization}
                        textType={"related_item_description"}
                        uniqueId={relatedItem.account_id + relatedItem.item_id}
                        marginTop={11}
                    />
                </div>

                {/* "Action" buttons */}
                <div className='flex flex-col items-center justify-start overflow-hidden' style={{ backgroundColor: Colors.whiteGray, borderRadius: 12, marginBottom: 20, marginLeft: 20, marginRight: 20 }}>
                    {LOCATION_INFO_UI}

                    {has_a_Link && LINK_INFO_UI}

                    {timetables.daily_timetables.length > 0 && TIMETABLES_INFO_UI}

                    {isUserAccount && OPTIONS_INFO_UI}
                </div>

            </li>
        )
    } else {
        // ORIGANAL DIMENSIONS : "46%" for the photo and "54%" for the info & "actions" area.
        return (
            <li id={`${relatedItem.item_id}_div`} className={`flex flex-row justify-start items-start overflow-hidden bg-white gapBetweeRelatedItemsOnLargeDevices border-2 rounded-lg`} style={{ maxWidth: 940 }}>
                <div className='unselectable self-stretch flex-1' unselectable={"on"} style={{ width: "48%" }}>
                    <img src={`https://www.atsightcdn.com/${getFileName("related_item", short_id, relatedItem.item_id)}`} alt={getRelatedItemPhotoAlt(relatedItem.created_date, account_name)} className={`align-middle object-cover`} style={{ backgroundColor: Colors.lightGray, color: showAlt ? Colors.smallGrayText : "transparent", height: "100%", width: "100%" }} loading="lazy" onLoad={() => { setShowAlt(true) }} onError={() => { setShowAlt(true) }} />
                </div>

                <div className='flex flex-col' style={{ width: "52%" }}>
                    <div className='flex flex-col justify-start items-start' style={{ paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
                        {/* Name */}
                        <p style={Object.assign({}, TextStyles.bold15)}>{relatedItem.name}</p>

                        {/* Description + Translate button */}
                        <TranslatableExpandableText
                            maximumLines={4}
                            description={relatedItem?.description ?? {}}
                            description_localization={relatedItem?.description_localization}
                            textType={"related_item_description"}
                            uniqueId={relatedItem.account_id + relatedItem.item_id}
                            marginTop={11}
                        />
                    </div>

                    {/* "Action" buttons */}
                    <div className='flex flex-col items-center justify-start overflow-hidden' style={{ backgroundColor: Colors.whiteGray, borderRadius: 8, marginTop: 20, marginBottom: 20, marginLeft: 20, marginRight: 20 }}>

                        {LOCATION_INFO_UI}

                        {has_a_Link && LINK_INFO_UI}
                        
                        {timetables.daily_timetables.length > 0 && TIMETABLES_INFO_UI}

                        {isUserAccount && OPTIONS_INFO_UI}

                    </div>
                </div>

            </li>
        )
    }
}

