//
//  store.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { configureStore } from '@reduxjs/toolkit'
import analyticsSlice from '../analytics/reduxSlice'
import accountsMainDataReducer from './slices/accountsMainDataSlice'
import historySlice from './slices/historySlice'
import postsReducer from './slices/postsSlice'
import profilesReducer from './slices/profilesSlice'
import relatedItemsReducer from './slices/relatedItemsSlice'
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
        uiStates: uiStatesReducer,
        signUpValues: signUpSlice,
    }
})
