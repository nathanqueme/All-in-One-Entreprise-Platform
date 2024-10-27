//
//  pagesSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { AccountMainData, Page, PageObj, Profile } from '../../Data'
import { getAccountMainDataAttributesByUsername } from '../../aws/dynamodb'
import { LoadingFailureType } from '../../Types'

import { createSlice } from '@reduxjs/toolkit'
import { loadMainData, appendAccountMainData } from './accountsMainDataSlice'
import { loadProfile, appendProfile } from './profilesSlice'
import { appendRelatedItems } from './relatedItemsSlice'
import { loadPostCategories, appendPostCategories } from './postsSlice'
import { updateUiStateValue, updateUiStateValuePayload } from './uiStatesSlice'




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
            const { page_number, account_id, short_id } = action.payload.page
            let index = state.findIndex(e => { return e.page_number === page_number })
            if (index === -1) return

            // Updates 
            state[index] = PageObj(page_number, account_id, short_id)

        },
        removePage: (state, action) => {

            // Values 
            const { page_number } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page_number === page_number })

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
export const selectOpenedPages = state => state.openedPages as Page[]











/**
  * - 1 - Generate a new page
  * - 2 - Launch loading profile page 
  * - 3 - Open the page
  *
  * N.B. : when the user scans a QR code the "account_id" is equal to "" (it is not known) so the "Page" has an empty "account_id" too.
  * 
  * Later on the "account_id" will be obtained in the "loadProfilePage" function.
  * 
  * And if successfully obtained the "Pages"'s "account_id" will be updated from the "ProfilePage" once the "ProfileIsLoaded".
  * 
  * @param overWriteIsUserAccount : see in "ProfilePage" for more information.
 */
export function openAndLoadNewProfilePage(account_id: string, short_id: string, navigation: any, username?: string, overWriteIsUserAccount = false, doNotUseUsername = false, openFromSettings = false, onlyLoadLocalizationInUserLanguage = false, open_from_qr_code = false) {
    return async (dispatch, getState) => {


        // 1 
        const state = getState()
        let page_number = state.openedPages.length
        let pageToOpen = PageObj(page_number, account_id, short_id)
        dispatch(appendPage(pageToOpen))


        // 2
        dispatch(loadProfilePage(pageToOpen, username, doNotUseUsername, onlyLoadLocalizationInUserLanguage))


        // 3
        navigation.push('ProfilePage', { page: pageToOpen, username: username, doNotUseUsername: doNotUseUsername, overWriteIsUserAccount: overWriteIsUserAccount, openFromSettings: openFromSettings, open_from_qr_code: open_from_qr_code })


    }
}



/**
 *  Opens a new "ProfilePage" with the "accountMainData" and the "Profile" the user has just created.
*/
export function openProfilePageAfterAccountCreated(accountMainData: AccountMainData, profile: Profile, navigation: any) {
    return async (dispatch, getState) => {

        // 1 
        const state = getState()
        let page_number = state.openedPages.length
        let pageToOpen = PageObj(page_number, accountMainData.account_id, accountMainData.short_id)

        // 2
        dispatch(appendAccountMainData({ page: pageToOpen, accountMainData: accountMainData }))
        dispatch(appendProfile({ page: pageToOpen, profile: profile }))
        dispatch(appendRelatedItems({ page: pageToOpen, relatedItems: [] }))
        dispatch(appendPostCategories({ page: pageToOpen, postCategories: [] }))

        // 3 
        navigation.push('ProfilePage', { page: pageToOpen, overWriteIsUserAccount: true, openFromSettings: true })

    }
}



/**
 * Loads all the content of a "ProfilePage".
 * 
 * - 1 - gets the matching profile "username" (in most cases this step is not needed)
 * - 2 - loads its content
 * 
 * 
 * @param ofPage the page to load.
 * @param username the username of the profilePage to load when the "account_id" is unknown (ofPage.account_id = "").
 * 
 * 
 * 
 * 
 * N.B.: this function also indicates if the profile page could not have been succesfully loaded.
 * 
 * "ProfilePage" loading failure scenarios.
 * - A - the account_id is known, loading failure is handled in loadMainData()
 * - B - the account_id is unknown, loading failure is handled here.
 * 
 * 
 * "Account_id" loading failure scenarios.
 * - A - the username does not matches with any user's accounts
 * - B - the user does not have an internet connection
 * 
 * 
 */
export function loadProfilePage(ofPage: Page, username?: string, doNotUseUsername = false, onlyLoadLocalizationInUserLanguage = false) {
    return async (dispatch, getState) => {


        // Checks if loading the "account_id" (or sometimes the "short_id" as well) is needed.
        // Loading the "short_id" is needed when open from an universal link.
        // Loading the "account_id" is needed when open from an universal link or the QR code.
        // N.B. : when an error occurs there is no "return" so that it fails loading the content for real and reflect it on the Ui properly.
        let page = ofPage
        if ((ofPage.account_id === "") && (!doNotUseUsername)) {
            try {

                const accountMainDataAttributes = await getAccountMainDataAttributesByUsername(username ?? "", "account_id, short_id") // will get the "short_id" when it is empty due to the page being open with a universal link.
                const account_id = accountMainDataAttributes?.account_id ?? ""
                const short_id = accountMainDataAttributes?.short_id ?? ""
                if (account_id === "") {
                    // "Account_id" loading failure A
                    let payload: updateUiStateValuePayload = { attribute: 'loadingFailure', value: 'profile_not_found' as LoadingFailureType }
                    dispatch(updateUiStateValue(payload))
                } else page = PageObj(ofPage.page_number, account_id, short_id)

            } catch (error) {

                // "Account_id" loading failure B
                let payload: updateUiStateValuePayload = { attribute: 'loadingFailure', value: 'profile_page_loading' as LoadingFailureType }
                dispatch(updateUiStateValue(payload))

            }
        }



        dispatch(loadMainData(page))
        dispatch(loadProfile(page, onlyLoadLocalizationInUserLanguage))
        dispatch(loadPostCategories(page, onlyLoadLocalizationInUserLanguage))
        // ... Related items are only loaded once the dedicated page is open.

    }
}


