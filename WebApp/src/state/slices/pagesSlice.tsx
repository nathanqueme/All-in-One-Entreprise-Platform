//
//  pagesSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { AccountMainData, Page, PageObj, Profile } from '../../Data'

import { createSlice } from '@reduxjs/toolkit'
import { appendAccountMainData } from './accountsMainDataSlice'
import { appendProfile } from './profilesSlice'
import { appendRelatedItems } from './relatedItemsSlice'
import { appendPostCategories } from './postsSlice'




const initialState: Page[] = []

export const pagesSlice = createSlice({
    name: 'openedPages',
    initialState: initialState,
    reducers: {
        appendPage: (state, action) => {

            // Updates 
            state.push(action.payload)

        },
        updatePageAccountId: (state, action) => {

            // Values
            const { username, account_id, short_id } = action.payload.page
            let index = state.findIndex(e => { return e.username === username })
            if (index === -1) return

            // Updates 
            state[index] = PageObj(username, account_id, short_id)

        },
        removePage: (state, action) => {

            // Values 
            const { page_number } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.username === page_number })

            // Updates 
            if (pageIndex > -1) {
                state.splice(pageIndex, 1) // 2nd parameter means remove one item only
            }

        },
    }
})

export const { appendPage, updatePageAccountId, removePage } = pagesSlice.actions

export default pagesSlice.reducer


// Selector 
export const selectOpenedPages = (state: any) => state.openedPages as Page[]




/**
 *  Keeps all the values and open's user's Profile page.
*/
export function openProfilePageAfterAccountCreated(accountMainData: AccountMainData, profile: Profile) {
    return async (dispatch: any, getState: any) => {

        // 1 
        const state = getState()
        let pageToOpen = PageObj(accountMainData.username, accountMainData.account_id, accountMainData.short_id)

        // 2
        dispatch(appendAccountMainData({ page: pageToOpen, accountMainData: accountMainData }))
        dispatch(appendProfile({ page: pageToOpen, profile: profile }))
        dispatch(appendRelatedItems({ page: pageToOpen, relatedItems: [] }))
        dispatch(appendPostCategories({ page: pageToOpen, postCategories: [] }))

        // 3 
        // navigate(`/${username}/`)

    }
}



