//
//  uiStatesSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AccountMainData, SavedTranslation } from '../../Data'
import { InformationType, LoadingFailureType, SlidingAlertType } from '../../Types'
import { TextType } from '../../Types'


    

interface UnclippedTextInterface {
    posts_descriptions: string[] // array of unique 'post_id'
    category_descriptions: string[] // array of unique 'category_id'
    related_items_descriptions: string[] // array of 'account_id'+'related_item_id' as 'related_item_id' are not unique globally 
    profile_descriptions: string[] // array of unique 'account_id'
}
interface TranslatedTextInterface {
    posts_descriptions: SavedTranslation[]
    category_descriptions: SavedTranslation[]
    related_items_descriptions: SavedTranslation[]
    profile_descriptions: SavedTranslation[]
}



export interface UiStatesInterface {
    account_id: string // the account_id of the user if signed in

    unclipped_text: UnclippedTextInterface
    translated_text: TranslatedTextInterface

    // Info editor
    selectedInfoValue: any
    selectedInfoType: InformationType
    isUpdatingInfo: boolean
    updatedAppearance: boolean // 'Email updated' or 'Phone number updated'
    
    // Post editor 
    editedPostId: string // Scroll to post after just got edited.
    editedCategoryId: string // Scroll to category_id after just got edited
    editedRelatedItemId: string // Scroll to relatedItem after just got edited

    // Profile page sliding alert
    slidingAlertType: SlidingAlertType
    loadingFailure: LoadingFailureType 

    // PdfPage
    refreshPdfPage: string

    // Session related
    jwtTokenWasRefreshed: boolean
    userAccountMainData: AccountMainData | undefined
    emojiAlert: boolean
}
const initialState: UiStatesInterface = {
    account_id: '',
    // 
    // 
    unclipped_text: {
        posts_descriptions: [],
        category_descriptions: [],
        related_items_descriptions: [], 
        profile_descriptions: []
    },
    //
    translated_text: {
        posts_descriptions: [],
        category_descriptions: [],
        related_items_descriptions: [], 
        profile_descriptions: []
    },
    // 
    //
    selectedInfoValue: '',
    selectedInfoType: '' as any,
    isUpdatingInfo: false,
    updatedAppearance: false,
    // 
    // 
    editedPostId: '',
    editedCategoryId: '',
    editedRelatedItemId: '',
    //
    //
    loadingFailure: '' as LoadingFailureType,
    slidingAlertType: '' as SlidingAlertType,

    refreshPdfPage: new Date().toISOString(),

    jwtTokenWasRefreshed: false, 
    userAccountMainData: undefined, 
    emojiAlert: false
}



// Payloads 
export interface updateUiStateValuePayload {
    attribute: keyof UiStatesInterface
    value: any 
}
export interface saveTranslationPayload {
    savedTranslation: SavedTranslation
    text_type: TextType
}
export interface deleteSavedTranslationPayload {
    unique_id: string
    text_type: TextType
}




export const uiStatesSlice = createSlice({
    name: 'uiStates',
    initialState: initialState,
    reducers: {
        updateUiStateValue: (state, action: PayloadAction<updateUiStateValuePayload>) => {

            // Values 
            const { value, attribute } : updateUiStateValuePayload = action.payload

            // Updates 
            let stateWithTssSignature = (state as Record<keyof UiStatesInterface, any>)
            stateWithTssSignature[attribute] = value

        },
        saveUnclippedTextState: (state, action) => {

            // Values 
            const { text_type, unique_id } = action.payload

            // Updates 
            switch (text_type as TextType) {
                case 'category_description':
                    state.unclipped_text.category_descriptions = state.unclipped_text.category_descriptions.concat(unique_id)
                    break

                case 'post_description':
                    state.unclipped_text.posts_descriptions = state.unclipped_text.posts_descriptions.concat(unique_id)
                    break

                case 'related_item_description':
                    state.unclipped_text.related_items_descriptions = state.unclipped_text.related_items_descriptions.concat(unique_id)
                    break

                case 'profile_description':
                    state.unclipped_text.profile_descriptions = state.unclipped_text.profile_descriptions.concat(unique_id)
                    break

            }

        },
        saveTranslation: (state, action) => {

            // Values 
            const { savedTranslation, text_type } : saveTranslationPayload = action.payload

            // Updates 
            switch (text_type) {
                case 'category_description':
                    state.translated_text.category_descriptions = state.translated_text.category_descriptions.concat(savedTranslation)
                    break

                case 'post_description':
                    state.translated_text.posts_descriptions = state.translated_text.posts_descriptions.concat(savedTranslation)
                    break

                case 'related_item_description':
                    state.translated_text.related_items_descriptions = state.translated_text.related_items_descriptions.concat(savedTranslation)
                    break

                case 'profile_description':
                    state.translated_text.profile_descriptions = state.translated_text.profile_descriptions.concat(savedTranslation)
                    break

            }

        },
        deleteSavedTranslation: (state, action) => {


            /** (Deprecated usage) : 
                Explanation : this function is for the owner of the account, so that when he updates the localization of a "LocalizedText" he has already translated. 
                So that rather than using the outdated translation it uses the new one.

                This only works a saved translation was founded for the given "unique_id".
            */
           

            // Values 
            const { unique_id, text_type } : deleteSavedTranslationPayload = action.payload

            
            // Updates 
            switch (text_type) {
                case 'category_description':
                    let index1 = state.translated_text.category_descriptions.findIndex(e => e.unique_id === unique_id)
                    if (index1 !== 1)
                    state.translated_text.category_descriptions.splice(index1, 1)
                    break


                case 'post_description':
                    let index2 = state.translated_text.posts_descriptions.findIndex(e => e.unique_id === unique_id)
                    if (index2 !== 1)
                    state.translated_text.posts_descriptions.splice(index2, 1)
                    break


                case 'related_item_description':
                    let index3 = state.translated_text.related_items_descriptions.findIndex(e => e.unique_id === unique_id)
                    if (index3 !== 1)
                    state.translated_text.related_items_descriptions.splice(index3, 1)
                    break


                case 'profile_description':
                    let index4 = state.translated_text.profile_descriptions.findIndex(e => e.unique_id === unique_id)
                    if (index4 !== 1)
                    state.translated_text.profile_descriptions.splice(index4, 1)
                    break


            }


        },
    }
})


export const { updateUiStateValue, saveUnclippedTextState, saveTranslation, deleteSavedTranslation } = uiStatesSlice.actions


export default uiStatesSlice.reducer


// Selector 
export const selectUiStates = (state: any) => state.uiStates as UiStatesInterface



