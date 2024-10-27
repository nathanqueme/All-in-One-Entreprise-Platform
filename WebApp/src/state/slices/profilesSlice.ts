//
//  profilesSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { Profile, Page, PageProfileObj, PageProfile } from '../../Data'
import { MathematicalOperation } from '../../Types'
import { getUserSpokenLanguage } from '../../assets/LanguagesList'
import { createSlice } from '@reduxjs/toolkit'

// Server 
import { getProfile } from '../../aws/dynamodb'





export interface updateProfileValueInterface {
    username: string
    attribute: keyof Profile
    newValue: any
}
export interface updateProfileValueWithOperationInterface {
    username: string
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
            const { username, attribute, newValue }: updateProfileValueInterface = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === username })

            // Updates 
            if (pageIndex === -1) return
            switch (attribute.includes('links[')) {
                case false:
                    let profileWithTssSignature = state[pageIndex].profile as Record<keyof Profile, any>
                    profileWithTssSignature[attribute] = newValue; break

                case true: // Updates a link since the attribute is equal to something like : 'links[4]'
                    let linkIndex = Number(attribute.replace('links', '').replace('[', '').replace(']', ''))
                    console.log('\n linkIndex : ' + linkIndex)
                    state[pageIndex].profile.links[linkIndex] = newValue; break

            }


        },
        updateProfileValueWithOperation: (state, action) => {

            // Values 
            const { username, operation, attribute, ofValue }: updateProfileValueWithOperationInterface = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === username })

            // Updates
            if (pageIndex === -1) return
            let profileWithTssSignature = state[pageIndex].profile as Record<keyof Profile, any>
            if (operation === "+") {
                profileWithTssSignature[attribute] += ofValue
            } else {
                profileWithTssSignature[attribute] -= ofValue
            }

        },
        appendOrUpdateProfile: (state, action) => {


            // Values 
            const { page, profile }: { page: Page, profile: Profile } = action.payload

            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })

            // Updates
            if (pageIndex === -1) {
                state.push(PageProfileObj(page, profile))
            } else {
                state[pageIndex].profile = profile
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

export const { appendProfile, updateProfileValue, updateProfileValueWithOperation, appendOrUpdateProfile, removeProfile, clearAllProfiles } = profilesSlice.actions


export default profilesSlice.reducer


// Selector 
export const selectPagesProfiles = (state: any) => state.pagesProfiles as PageProfile[]








/** 
  - 1 - Loads values 
  - 2 - Save values for UI
*/
export function loadProfile(page: Page, onlyLoadLocalizationInUserLanguage = false) {
    return async (dispatch: any, getState: any) => {

        try {
            // 1 
            const d_l_l = getUserSpokenLanguage().locale
            const profile = await getProfile(page.account_id, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)

            // 2 
            dispatch(appendOrUpdateProfile({ page: page, profile: profile }))

        } catch (error) {
            console.error(error)
        }
    }
}



