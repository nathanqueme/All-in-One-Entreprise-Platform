//
//  store.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { configureStore } from '@reduxjs/toolkit'
import analyticsSlice from '../analytics/reduxSlice'
import accountsMainDataReducer from './slices/accountsMainDataSlice'
import historySlice from './slices/historySlice'
import postsReducer from './slices/postsSlice'
import profilesReducer from './slices/profilesSlice'
import relatedItemsReducer from './slices/relatedItemsSlice'
import pagesReducer from './slices/pagesSlice'
import uiStatesReducer from './slices/uiStatesSlice'
import signUpSlice from './slices/signUpSlice'


export default configureStore({
    reducer: {
        analytics: analyticsSlice,
        pagesAccountsMainData: accountsMainDataReducer,
        history: historySlice,
        pagesPostCategories: postsReducer,
        pagesProfiles: profilesReducer,
        pagesRelatedItems: relatedItemsReducer,
        openedPages: pagesReducer,
        // (Global ui states)
        uiStates: uiStatesReducer,
        // (Temporarly disabled)
        signUpValues: signUpSlice,
    }
})


/*
The app needs to be able to let users re-open the same page 10 times and manage the UI independently for each one.
-> The pages and their UI are all uniquely indentified but the data loading may be shared. 

-> The user opens an account -> the UI is in loading appearance -> Once loaded the user re-opens the same account from a post -> The app opens the page -> The page is in loading appearance... The app needs to handle this as many times as the user wants. 


Data structure to handle it : 
postCategories : [ PagePostCategories(page_id: 1, account_id: 'XBV', postCategories: null | [] | [...])   , ... ]            

Each page via its page_id, tracks change of its typeof 'postCategories' to know once they are loaded -> (null) is not loaded and an empty or filled array is loaded ([] or [...])

*/

