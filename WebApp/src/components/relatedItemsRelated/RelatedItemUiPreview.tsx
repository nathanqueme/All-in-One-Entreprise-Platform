import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import { Link } from 'react-router-dom'
import { RelatedItem } from '../../Data'
import { getFileName, getRelatedItemPhotoAlt } from '../functions'



interface RelatedItemUiPreviewInterface {
    relatedItem: RelatedItem
    scalingRatio: number
    wasCreated: boolean
    short_id: string
    account_name: string
    username: string
    loadingAppearance: boolean
}
/**
 * A clickable row that displays an image and a the item's name text next to it. 
 * Used for thin devices.
*/
export default function RelatedItemUiPreview({ relatedItem, scalingRatio, wasCreated, short_id, account_name, username, loadingAppearance }: RelatedItemUiPreviewInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    /** Dimensions guidelines : 
     * The width and height are of 78 * scalingRatio 
     * -> So it looks smaller than a PostPreviewUi with dimensions of 96 * scalingRatio.
    */
    let width = 78 * scalingRatio
    let height = 78 * scalingRatio


    // UI 
    let ui =
        <div
            className={`flex items-center justify-start w-full ${loadingAppearance ? "" : "active:brightness-95"}`}
            style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: wasCreated ? Colors.newItemBlue : Colors.whiteToGray2
            }}>
            <div style={{
                width: width,
                height: height,
                backgroundColor: Colors.lightGray
            }}>
                {!loadingAppearance &&
                    <img
                        src={loadingAppearance ? "" : `https://www.atsightcdn.com/${getFileName("related_item", short_id, relatedItem.item_id)}`}
                        alt={loadingAppearance ? "" : getRelatedItemPhotoAlt(relatedItem.created_date, account_name)}
                        style={{ color: showAlt ? Colors.smallGrayText : "transparent" }}
                        className='flex aspect-square object-cover'
                        width={width}
                        height={height}
                        onLoad={() => { setShowAlt(true) }}
                        onError={() => { setShowAlt(true) }}
                        loading="lazy"
                    />
                }
            </div>

            <div style={{ marginLeft: 20 }}>
                {loadingAppearance ?
                    <p className='text-start' style={Object.assign({}, TextStyles.medium15, { backgroundColor: Colors.lightGray, color: Colors.clear, width: 80 })}>{relatedItem.name}</p>
                    :
                    <p className='text-start' style={Object.assign({}, TextStyles.medium15, { color: Colors.black })}>{relatedItem.name}</p>
                }
            </div>
        </div>


    if (loadingAppearance) {
        return (ui)
    } else {
        return (
            <Link to={`/${username}/r_i/${relatedItem.item_id}/`} className='w-full'>
                {ui}
            </Link>
        )
    }


}

