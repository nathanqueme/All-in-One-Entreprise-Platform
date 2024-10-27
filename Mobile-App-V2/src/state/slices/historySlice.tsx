//
//  historySlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 06/03/22.
//

import { AccountMainData } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'




const initialState: AccountMainData[] = []

export const historySlice = createSlice({
    name: 'history',
    initialState: initialState,
    reducers: {
        initializeHistory: (state, action) => {

            // Updates
            let seenAccounts = action.payload.seenAccounts ?? []
            return state = seenAccounts

        },
        /**
           * Adds an item if not already part of the history otherwise, removes it and adds it at the beginning of the list.
        */
        appendSeenAccountMainData: (state, action) => {

            // Values 
            const { accountMainData }: { accountMainData: AccountMainData } = action.payload

            // Indexes 
            let index = state.findIndex(e => { return e.account_id === accountMainData.account_id })

            // Updates 
            if (index === -1) {
                state.unshift(accountMainData)
            } else {
                state.splice(index, 1) // Removes it
                state.unshift(accountMainData) // Then adds it at the beginning
            }

        },
        removeSeenAccountMainData: (state, action) => {

          
            // Values 
            const account_id: string = action.payload.account_id

            // Indexes 
            let index = state.findIndex(e => { return e.account_id === account_id })

            // Updates 
            if (index === -1) return
            state.splice(index, 1) // Removes it

        },
        clearAllHistory: state => {

            // Updates
            state = initialState

        },
    }
})

export const { initializeHistory, appendSeenAccountMainData, removeSeenAccountMainData, clearAllHistory } = historySlice.actions


export default historySlice.reducer


// Selector 
export const selectHistory = state => state.history as AccountMainData[]



















/** 
 * 1, 2, 3 : Deprecated
 * 
 * - 1 - Scale down the image 
 * - 2 - Get the scaled down image base64
 * - 3 - Update item 
 * - 4 - Update Ui
  
n.b. : caching the AccountMainData is done on the HomeScreen after this function has been called.

*/
export function saveSeenAccountMainData(accountMainData: AccountMainData, seenAccountsMainData: AccountMainData[]) {
    return async (dispatch, getState) => {


        // Preparation
        let uri
        let base64




        // 1 + 2
        /*
        if ((accountMainData?.imageData?.base64 ?? "") !== "") {
            // 1
            try {

                let resizingResponse = await ImageResizer.createResizedImage(accountMainData.imageData.base64, 240, 240, 'JPEG', 100, 0, undefined, false, { mode: 'contain', onlyScaleDown: false })
                uri = resizingResponse.uri

            } catch (error) {
                console.error(error)
            }



            // 2
            try {
                let response = await fetch(uri)
                let blob = await response.blob()
                base64 = await getBase64(blob)
            } catch (error) {
                console.error(error)
            }
        }
*/


        // 3
        // Shallow copie see (1) in the "PostEditor" for explanations
        let seenAccountMainData = Object.assign({}, accountMainData)
        /*
        if (base64) {
            seenAccountMainData.imageData = ImageDataObj(accountMainData.imageData.file_name, base64, 1) 
        }
        */




        // 4
        dispatch(appendSeenAccountMainData({ accountMainData: seenAccountMainData }))


    }
}


