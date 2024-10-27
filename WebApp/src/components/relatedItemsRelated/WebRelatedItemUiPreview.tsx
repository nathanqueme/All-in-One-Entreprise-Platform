import React, { useState }  from 'react'
import '../../styles/MainStyles.css'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import { Link } from 'react-router-dom'
import { RelatedItem } from '../../Data'
import { getFileName, getRelatedItemPhotoAlt } from '../functions'



interface WebRelatedItemUiPreviewInterface {
    relatedItem: RelatedItem
    itemNumber: number
    loadingAppearance: boolean
    short_id: string
    account_name: string
    username: string
}
/**
 * A clickable row that displays an image and a the item's name text next to it. 
 * Used for wide devices.
 * N.B.: Is darker at the bottom to help the user see the text. But disappears on hover.
 */
export default function WebRelatedItemUiPreview({ relatedItem, itemNumber, loadingAppearance, short_id, account_name, username }: WebRelatedItemUiPreviewInterface) {

    
    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values
    let parentClass = `gridCellContainer ${itemNumber ? "" : ""} relative`
    let parentStyle = { backgroundColor: Colors.lightGray, marginRight: itemNumber % 3 === 0 ? 0 : 30 }


    // UI 
    let ui =
        <>
            {loadingAppearance ?
                <div className='gridCell flex' />
                :
                <img
                    src={`https://www.atsightcdn.com/${getFileName("related_item", short_id, relatedItem.item_id)}`}
                    alt={getRelatedItemPhotoAlt(relatedItem.created_date, account_name)}
                    className='gridCell flex'
                    onLoad={() => { setShowAlt(true) }} 
                    onError={() => { setShowAlt(true) }}
                    style={{ color: showAlt ? Colors.smallGrayText : "transparent" }}
                />
            }

            {!loadingAppearance &&
                <>
                    {/* Helps see the white text at the bottom left */}
                    <div className='bg-gradient-to-t from-black via-transparent w-full h-full absolute bottom-0 left-0 right-0 top-0 opacity-20 hover:opacity-0 justify-start item' />
                    <p className='absolute bottom-0 left-0 text-left line-clamp-1 m-4' style={Object.assign({}, TextStyles.medium15, { color: Colors.white })}>{relatedItem?.name ?? ""}</p>
                </>
            }
        </>


    if (loadingAppearance) {
        return (
            <div id={`${relatedItem.item_id}_div`} className={parentClass} style={parentStyle}>
                {ui}
            </div>
        )
    } else {
        return (
            <Link to={`/${username}/r_i/${relatedItem.item_id}/`} id={`${relatedItem.item_id}_div`} className={parentClass} style={parentStyle}>
                {ui}
            </Link>
        )
    }
}


