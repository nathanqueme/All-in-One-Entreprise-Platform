//
//  RelatedItemsGrid.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/09/22
//

import React, { useState } from 'react'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import ActivityIndicator from '../ActivityIndicator'
import WebRelatedItemUiPreview from './WebRelatedItemUiPreview'
import { RelatedItem } from '../../Data'



interface RelatedItemsGridInterface {
    relatedItems: RelatedItem[]
    loadingAppearance: boolean
    short_id: string
    account_name: string
    username: string
    showLoadingIndicator: boolean
    onEndReached: () => any
}
/**
 * (LARGE DEVICES ONLY)
 * 
 * - A list of the related items of the given account.
 * - Appearance : A grid with 3 elements in a row and of 30 padding.
 */
export default function RelatedItemsGrid({ relatedItems, loadingAppearance, short_id, account_name, username, showLoadingIndicator, onEndReached }: RelatedItemsGridInterface) {


    // States
    const [alreadyReachedDiv, setAlreadyReachedDiv] = useState([] as string[])


    // Values 
    let lastItemId = relatedItems[relatedItems.length - 1]?.item_id ?? ""


    /**
     * Will triggers onEndReached() on each scroll, once it has detected that the last related item is starting to be visible.
    */
    function handleEndReached() {


        let listDiv = document.getElementById("relatedItemsDiv")
        if (listDiv === null) return

        let listDivMeasures = listDiv.getBoundingClientRect()

        let lastItemDivName = `${lastItemId}_div`
        let lastItemDiv = document.getElementById(lastItemDivName)
        if (lastItemDiv === null) return
        let lastItemDivMeasures = lastItemDiv.getBoundingClientRect()
        let lastItemStartsToBeVisible = (listDivMeasures.bottom - window.innerHeight) - lastItemDivMeasures.height - 30 <= 0



        // The value of listDivMeasures.bottom gets close to window.innerHeight while scrolling down.
        // Once the end has been reached it remembers of it.
        if (lastItemStartsToBeVisible) {
            if (alreadyReachedDiv.includes(lastItemDivName)) return // Avoids re trigerring hundreds of times once triggered once.
            onEndReached()
            setAlreadyReachedDiv(prevV => {
                return [...prevV, lastItemDivName] // Remembers of it
            })
        } else {

            let index = alreadyReachedDiv.findIndex(e => { return e === lastItemDivName })
            if (index === -1) return
            // Remove the remembering
            setAlreadyReachedDiv(prevV => {
                prevV.splice(index, 1)
                return [...prevV]
            })

        }

    }

    window.onscroll = handleEndReached
    window.onresize = handleEndReached




    return (
        <div id="relatedItemsDiv" className="flex flex-wrap justify-start" style={{ marginTop: 30 }}>
            {relatedItems.length === 0 ?
                <div style={{ paddingTop: 90, width: "100%" }}>
                    <p style={TextStyles.noContentFont}>{localization.nothing_to_display}</p>
                </div>
                :
                relatedItems.slice(0, loadingAppearance ? 6 : undefined).map((e: RelatedItem, index: number) => {
                    return (
                        <WebRelatedItemUiPreview
                            key={e.item_id}
                            relatedItem={e}
                            itemNumber={index + 1}
                            loadingAppearance={loadingAppearance}
                            short_id={short_id}
                            account_name={account_name}
                            username={username}
                        />
                    )
                })
            }

            {showLoadingIndicator &&
                <div className='flex items-center justify-center w-full' style={{ height: 90, marginBottom: 30 }}>
                    <ActivityIndicator color={Colors.smallGrayText} widthAndHeight={35} />
                </div>
            }

        </div>
    )
}