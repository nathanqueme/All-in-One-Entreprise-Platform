import React from "react"
import '../../styles/MainStyles.css'
import colors from "../../assets/Colors"
import TextStyles from "../../styles/TextStyles"
import { AccountMainData, SearchResult } from "../../Data"
import { getSearchPhotoAlt, getFileName, capitalize } from '../functions'
import { useState } from "react"
import Colors from "../../assets/Colors"




interface SearchResultShortcutUiInterface {
    searchResult: SearchResult
    onClick: (_: string) => any
    onClickRight: () => any // could be called onLongClick for phones
}
/**
 * Displays an already seen search result that the user can quickly access from the home screen.
 * It is made of a rounded photo or the place's first letter and it's name at the bottom.
 */
export default function SearchResultShortcutUi({ searchResult, onClick, onClickRight }: SearchResultShortcutUiInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values 
    const isACity = searchResult.type === "city"
    const short_id = isACity ? "" : (searchResult.object as AccountMainData).short_id
    let text = isACity ? "Todo..." : (searchResult.object as AccountMainData).account_name
    let description = isACity ? "Todo here..." : (searchResult.object as AccountMainData).username
    let has_photo = isACity ? false : (searchResult.object as AccountMainData)?.has_photo ?? false

    const WIDTH = 50

    return (
        <li className='flex flex-col items-center bg-red-200' style={{ width: "25%"  }}>
            {has_photo ?
                <img
                    alt={getSearchPhotoAlt()}
                    src={`https://www.atsightcdn.com/${getFileName("search_photo", short_id)}`}
                    className={`align-middle object-cover rounded-full aspect-square`}
                    style={{
                        height: WIDTH,
                        backgroundColor: colors.lightGray,
                        pointerEvents: "none",
                        color: showAlt ? Colors.smallGrayText : "transparent"
                    }}
                    onLoad={() => { setShowAlt(true) }}
                    onError={() => { setShowAlt(true) }}
                />
                :
                <div className='flex items-center justify-center rounded-full aspect-square' style={{ height: WIDTH, backgroundColor: colors.lightGray }}>
                    <p style={{ color: colors.black, fontWeight: "bold", fontSize: 17 * 40 / 38 }}>{capitalize(text.slice(0, 1))}</p>
                </div>
            }

            <p className='line-clamp-1' style={{ color: "black", fontSize: 13 }}>{text}</p>
        </li>
    )
}



