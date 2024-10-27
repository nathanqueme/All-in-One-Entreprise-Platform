//
//  profilesSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { Profile, Page, PageProfileObj, PageProfile } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'

// Server 
import { getProfile } from '../../aws/dynamodb'
import { MathematicalOperation } from '../../Types'
import { getUserSpokenLanguage } from '../../assets/LanguagesList'




export interface updateProfileValueInterface {
    page_number: number
    attribute: keyof Profile
    newValue: any
}
export interface updateProfileValueWithOperationInterface {
    page_number: number
    attribute: keyof Profile
    operation: MathematicalOperation
    ofValue: number
}





const initialState: PageProfile[] = []

export const profilesSlice = createSlice({
    name: 'profiles',
    initialState: initialState,
    reducers: {
        appendProfile: (state, action) => {

            // Values 
            const { page, profile }: { page: Page, profile: Profile } = action.payload

            // Updates 
            state.push(PageProfileObj(page, profile))

        },
        updateProfileValue: (state, action) => {

            // Values 
            const { page_number, attribute, newValue }: updateProfileValueInterface = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page_number })

            // Updates 
            if (pageIndex === -1) return
            switch (attribute.includes('links[')) {
                case false: state[pageIndex].profile[attribute as string] = newValue; break
                case true: // Updates a link since the attribute is equal to something like : 'links[4]'
                    let linkIndex = attribute.replace('links', '').replace('[', '').replace(']', '')
                    console.log('\n linkIndex : ' + linkIndex)
                    state[pageIndex].profile.links[linkIndex] = newValue; break
            }


        },
        updateProfileValueWithOperation: (state, action) => {

            // Values 
            const { page_number, attribute, operation, ofValue }: updateProfileValueWithOperationInterface = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.page_number === page_number })

            // Updates 
            if (pageIndex === -1) return
            if (operation === "+") {
                state[pageIndex].profile[attribute as string] += ofValue
            } else {
                state[pageIndex].profile[attribute as string] -= ofValue
            }

        },
        removeProfile: (state, action) => {

        },
        clearAllProfiles: state => {

            // Updates 
            state = initialState

        },
    }
})

export const { appendProfile, updateProfileValue, updateProfileValueWithOperation, removeProfile, clearAllProfiles } = profilesSlice.actions


export default profilesSlice.reducer


// Selector 
export const selectPagesProfiles = state => state.pagesProfiles as PageProfile[]








/** 
  - 1 - Loads values 
  - 2 - Save values for UI
*/
export function loadProfile(page: Page, onlyLoadLocalizationInUserLanguage = false) {
    return async (dispatch, getState) => {

        try {
            // 1
            const d_l_l = getUserSpokenLanguage().locale
            const profile = await getProfile(page.account_id, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)

            // 2 
            dispatch(appendProfile({ page: page, profile: profile }))

        } catch (error) {
            console.error(error)
        }
    }
}



