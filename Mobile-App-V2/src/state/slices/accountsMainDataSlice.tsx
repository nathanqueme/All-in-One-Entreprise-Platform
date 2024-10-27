//
//  accountsMainDataSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { AccountMainData, Page, PageAccountMainData, PageAccountMainDataObj, ImageDataObj } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'
import { LoadingFailureType } from '../../Types'
import { updateUiStateValue, updateUiStateValuePayload } from './uiStatesSlice'

// Server 
import { getAccountMainData } from '../../aws/dynamodb'
import { getContent } from '../../aws/s3'
import { getFileName } from '../../components/functions'





const initialState: PageAccountMainData[] = []

export const accountsMainDataSlice = createSlice({
    name: 'accountsMainData',
    initialState: initialState,
    reducers: {
        appendAccountMainData: (state, action) => {

            // Values 
            const { page, accountMainData }: { page: Page, accountMainData: AccountMainData } = action.payload

            // Updates 
            state.push(PageAccountMainDataObj(page, accountMainData))

        },
        updateAccountMainDataValue: (state, action) => {

            // Values 
            const { page_number, attribute, newValue } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page_number })

            // Updates
            if (pageIndex === -1) { return }
            state[pageIndex].account_main_data[attribute] = newValue

        },
        removeAccountMainData: (state, action) => {

        },
        clearAllAccountsMainData: state => {
            // Updates
            state = initialState
        },
    }
})

export const { appendAccountMainData, updateAccountMainDataValue, removeAccountMainData, clearAllAccountsMainData } = accountsMainDataSlice.actions


export default accountsMainDataSlice.reducer


// Selector 
export const selectPagesAccountsMainData = state => state.pagesAccountsMainData as PageAccountMainData[]












/**
  * - 1 - Loads values 
  * - 2 - Save values for UI 
  * - 3 - load photod if any 
  * 
  * N.B. : This function also handles the failure of loading the profile page.
*/
export function loadMainData(page: Page) {
    return async (dispatch, getState) => {
        try {

            
            // 1 
            const accountMainData = await getAccountMainData(page.account_id)
            // 2
            dispatch(appendAccountMainData({ page: page, accountMainData: accountMainData }))
            // 3
            if (accountMainData?.has_photo ?? false) {
                dispatch(loadProfilePhoto(page, accountMainData.short_id))
            }


        } catch (error) {
            let payload: updateUiStateValuePayload = { attribute: 'loadingFailure', value: 'profile_page_loading' as LoadingFailureType }
            dispatch(updateUiStateValue(payload))
        }
    }
}



export function loadProfilePhoto(page: Page, short_id: string) {
    return async (dispatch, getState) => {
        try {

            let file_name = getFileName("profile_photo", short_id)
            let base64 = await getContent("anyid-eu-west-1", file_name)
            dispatch(updateAccountMainDataValue({ page_number: page.page_number, attribute: "image_data" as keyof AccountMainData, newValue: ImageDataObj(base64, 1) }))

        } catch (error) {
        }
    }
}



