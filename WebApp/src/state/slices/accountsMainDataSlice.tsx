//
//  accountsMainDataSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { AccountMainData, Page, PageAccountMainData, PageAccountMainDataObj, ImageDataObj, PageObj } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'


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
            const { username, newValue } = action.payload
            const attribute: keyof AccountMainData = action.payload.attribute

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === username })

            // Updates
            if (pageIndex === -1) { return }

            let accountMainDataWithTSSignature = state[pageIndex].account_main_data as Record<keyof AccountMainData, any>
            accountMainDataWithTSSignature[attribute] = newValue


        },
        appendOrUpdateAccountMainData: (state, action) => {

            // Values 
            const { page, accountMainData }: { page: Page, accountMainData: AccountMainData } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })

            // Updates
            if (pageIndex === -1) {
                state.push(PageAccountMainDataObj(page, accountMainData))
            } else {
                state[pageIndex].account_main_data = accountMainData
            }

        },
        removeAccountMainData: (state, action) => {

        },
        clearAllAccountsMainData: state => {
            // Updates
            state = initialState
        },
    }
})

export const { appendAccountMainData, updateAccountMainDataValue, appendOrUpdateAccountMainData, removeAccountMainData, clearAllAccountsMainData } = accountsMainDataSlice.actions


export default accountsMainDataSlice.reducer


// Selector 
export const selectPagesAccountsMainData = (state: any) => state.pagesAccountsMainData as PageAccountMainData[]



