//
//  relatedItemsSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { PageRelatedItem, Page, PageRelatedItemObj, RelatedItem, ImageDataObj } from '../../Data'
import { getFileName, getImageDimensionRatio } from '../../components/functions'
import { createSlice } from '@reduxjs/toolkit'

import { getContent } from '../../aws/s3'
import { queryRelatedItemsByMostRecent } from '../../aws/dynamodb'
import { getUserSpokenLanguage } from '../../assets/LanguagesList'




const initialState: PageRelatedItem[] = []

export const relatedItemsSlice = createSlice({
    name: 'relatedItems',
    initialState: initialState,
    reducers: {
        appendRelatedItems: (state, action) => {

            // Values 
            const { page, relatedItems }: { page: Page, relatedItems: RelatedItem[] } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page.page_number })

            // Updates 
            if (pageIndex === -1) { // Creates a new group for the new page
                let newPageRelatedItems = PageRelatedItemObj(page, relatedItems)
                state.push(newPageRelatedItems)
            } else { // Adds the new items 
                state[pageIndex].related_items = state[pageIndex].related_items.concat(relatedItems)
            }

        },
        updateRelatedItem: (state, action) => {

            // Values 
            const { page, relatedItem }: { page: Page, relatedItem: RelatedItem } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page.page_number })
            if (pageIndex === -1) return
            let relatedItemIndex = state[pageIndex].related_items.findIndex(e => { return e.item_id === relatedItem.item_id })

            // Updates 
            state[pageIndex].related_items[relatedItemIndex] = relatedItem


        },
        removeRelatedItem: (state, action) => {

            // Values
            const { page, item_id }: { page: Page, item_id: string } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page.page_number })
            if (pageIndex === -1) return
            let relatedItemIndex = state[pageIndex].related_items.findIndex(e => { return e.item_id === item_id })

            // Updates
            state[pageIndex].related_items.splice(relatedItemIndex, 1)

        },
        clearAllRelatedItems: state => {

            // Updates
            state = initialState

        },
    }
})

export const { appendRelatedItems, updateRelatedItem, removeRelatedItem, clearAllRelatedItems } = relatedItemsSlice.actions


export default relatedItemsSlice.reducer


// Selector 
export const selectPagesRelatedItems = state => state.pagesRelatedItems as PageRelatedItem[]



















/** 
 - 1 - Load relatedItems values  
      - A - First 8 most recents
      - B - Next 8 most recent (before the oldest loaded created_date)
  - 2 - Load each relatedItem's image 
*/
export function getRelatedItems(page: Page, limit = 8, loadBeforeCreatedDate?: string, onlyLoadLocalizationInUserLanguage = false): Promise<RelatedItem[]> {
    return new Promise(async (resolve, reject) => {

        const d_l_l = getUserSpokenLanguage().locale
        const hasCreatedDateParameter = (loadBeforeCreatedDate ?? "") !== ""
        let relatedItems: RelatedItem[] = []


        try {
            if (!hasCreatedDateParameter) {
                console.log('A')
                relatedItems = await queryRelatedItemsByMostRecent(page.account_id, limit, undefined, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
            } else {
                console.log('B')
                relatedItems = await queryRelatedItemsByMostRecent(page.account_id, limit, loadBeforeCreatedDate, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
            }
        } catch (error) {
            reject(error)
        }







        //
        let itemsToLoad = relatedItems.length
        if (itemsToLoad === 0) {
            // 2
            resolve(relatedItems)
        }
        //
        relatedItems.forEach(async (e) => {
            try {

                let file_name = getFileName("related_item", page.short_id, e.item_id)
                const base64 = await getContent("anyid-eu-west-1", file_name)
                const ratio = await getImageDimensionRatio(base64)
                e.image_data = ImageDataObj(base64, ratio)


                itemsToLoad -= 1
                if (itemsToLoad === 0) {
                    // 2
                    resolve(relatedItems)
                }


            } catch (error) {
                console.log(`\n\n------> The image of the related_item ${e.item_id} could not be loaded`, error)
                itemsToLoad -= 1
            }
        })





    })
}
