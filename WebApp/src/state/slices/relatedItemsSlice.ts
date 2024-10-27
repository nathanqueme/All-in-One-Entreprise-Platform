//
//  relatedItemsSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { PageRelatedItem, Page, PageRelatedItemObj, RelatedItem } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'

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
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })

            // Updates 
            if (pageIndex === -1) { // Creates a new group for the new page
                let newPageRelatedItems = PageRelatedItemObj(page, relatedItems)
                state.push(newPageRelatedItems)
            } else {

                // Adds the new items 
                let newRelatedItems = [] as RelatedItem[]
                relatedItems.map(relatedItem => {
                    let relatedItemIndex = state[pageIndex].related_items.findIndex(e => { return e.item_id === relatedItem.item_id })

                    // Avoids all duplicates
                    if (relatedItemIndex !== -1) {
                        state[pageIndex].related_items[relatedItemIndex] = relatedItem
                        console.log(`Avoided duplicate of Related item : ${relatedItem.item_id} on UI`)
                    } else {
                        newRelatedItems.push(relatedItem)
                    }

                })

                state[pageIndex].related_items = state[pageIndex].related_items.concat(newRelatedItems)
            }

        },
        updateRelatedItem: (state, action) => {

            // Values 
            const { page, relatedItem }: { page: Page, relatedItem: RelatedItem } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) return
            let relatedItemIndex = state[pageIndex].related_items.findIndex(e => { return e.item_id === relatedItem.item_id })

            // Updates 
            state[pageIndex].related_items[relatedItemIndex] = relatedItem


        },
        removeRelatedItem: (state, action) => {

            // Values
            const { page, item_id }: { page: Page, item_id: string } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
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
export const selectPagesRelatedItems = (state: any) => state.pagesRelatedItems as PageRelatedItem[]



















/** 
 - Load relatedItems values :
      - A - First 8 most recents
      - B - Next 8 most recent (before the oldest loaded created_date)
*/
export function getRelatedItems(page: Page, limit = 8, loadBeforeCreatedDate?: string, onlyLoadLocalizationInUserLanguage = false): Promise<RelatedItem[]> {
    return new Promise(async (resolve, reject) => {


        const d_l_l = getUserSpokenLanguage().locale
        const hasCreatedDateParameter = (loadBeforeCreatedDate ?? "") !== ""
        let relatedItems: RelatedItem[] = []



        try {
            if (!hasCreatedDateParameter) {
                // console.log('A')
                relatedItems = await queryRelatedItemsByMostRecent(page.account_id, limit, undefined, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
            } else {
                // console.log('B')
                relatedItems = await queryRelatedItemsByMostRecent(page.account_id, limit, loadBeforeCreatedDate, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
            }
        } catch (error) {
            reject(error)
        }

        //
        resolve(relatedItems)


    })
}
