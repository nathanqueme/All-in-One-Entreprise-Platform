import React, { useState } from "react"
import '../../styles/MainStyles.css'
import colors from "../../assets/Colors"
import TextStyles from "../../styles/TextStyles"
import { AccountMainData, GeolocationObj, SearchResult } from "../../Data"
import { getSearchPhotoAlt, getFileName, capitalize, getAddressDescription } from '../functions'
import { XMarkIcon } from "../Icons"



interface SearchResultWebUiInterface {
    searchResult: SearchResult
    onClick: (_: string) => any
    setIsMouseOver: (_: boolean) => any
    isHighlighted: boolean
    displayXMarkIcon?: boolean
    onClickDelete?: () => any
}
/**
 * Displays the text, description and photo related to the search result.
 */
export default function SearchResultUi({ searchResult, onClick, setIsMouseOver, isHighlighted, displayXMarkIcon = false, onClickDelete = () => { } }: SearchResultWebUiInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values 
    const isACity = searchResult.type === "city"

    const short_id = isACity ? "" : (searchResult.object as AccountMainData).short_id
    let text = isACity ? "Todo..." : (searchResult.object as AccountMainData).account_name
    let description = isACity ? "Todo here..." : (searchResult.object as AccountMainData).username
    let has_photo = isACity ? false : (searchResult.object as AccountMainData)?.has_photo ?? false
    let geolocation = isACity ? undefined : (searchResult.object as AccountMainData)?.geolocation 
   
    const address_description = ((geolocation !== undefined) && (geolocation?.city ?? "") !== "") ? getAddressDescription(geolocation) : undefined


    return (
        <li
            className={`flex items-center bg-white ${isHighlighted ? 'brightness-95' : ''}`}
            style={{ height: 60 }}
            onMouseOver={() => { setIsMouseOver(true) }}
            onMouseLeave={() => { setIsMouseOver(false) }}
        >
            <div onClick={() => { onClick(`/${description}/`) }} className='px-3 unselectable' unselectable="on">
                {has_photo ?
                    <img
                        alt={getSearchPhotoAlt()}
                        src={`https://www.atsightcdn.com/${getFileName("search_photo", short_id)}`}
                        className={`align-middle object-cover`}
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: colors.lightGray,
                            borderRadius: 4,
                            pointerEvents: "none",
                            color: showAlt ? colors.smallGrayText : "transparent"
                        }}
                        onLoad={() => { setShowAlt(true) }}
                        onError={() => { setShowAlt(true) }}
                    />
                    :
                    <div className='flex items-center justify-center' style={{ width: 40, height: 40, backgroundColor: colors.lightGray, borderRadius: 4 }}>
                        <p style={{ color: colors.black, fontWeight: "bold", fontSize: 17 * 40 / 38 }}>{capitalize(text.slice(0, 1))}</p>
                    </div>
                }
            </div>

            <div onClick={() => { onClick(`/${description}/`) }} className='flex flex-1 flex-col items-start justify-center'>
                <p style={{ fontSize: 14, fontWeight: "500", lineHeight: 1.3 }}>{text}</p>
                <p className='line-clamp-1' style={Object.assign({}, TextStyles.gray12Text)}>{description}{address_description && ` - ${address_description}`}</p>
            </div>

            {displayXMarkIcon &&
                <div onClick={() => { onClickDelete() }} style={{ marginRight: 12 }} className=''>
                    <XMarkIcon size="1.2em" color={colors.smallGrayText} />
                </div>
            }
        </li>
    )
}



