//
//  signUpSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { createSlice } from '@reduxjs/toolkit'
import { GeolocationObj, Geolocation, PhoneNumberObj, PhoneNumber } from './../../Data'


export interface SignUpValues {
    email: string
    password: string
    account_name: string
    username: string
    geolocation: Geolocation
    imageValues: any
    phoneNumber: PhoneNumber
    account_type: string
}
const initialState: SignUpValues = {
    email: "",
    password: "",
    account_name: "",
    username: "",
    geolocation: GeolocationObj('', '', '', '', '', ''),
    imageValues: {},
    phoneNumber: PhoneNumberObj('', '', ''),
    account_type: "",
}


export const signUpSlice = createSlice({
    name: 'signUpValues',
    initialState: initialState,
    reducers: {
        updateSignUpValue: (state, action) => {

            // Values 
            const { key, value } = action.payload

            // Updates 
            state[key] = value

        },
        clearAllSignUpValues: state => {

            // Updates 
            state = initialState
            
        },
    }
})


export const { updateSignUpValue, clearAllSignUpValues } = signUpSlice.actions


export default signUpSlice.reducer


// Selector 
export const selectSignUpValues = state => state.signUpValues as SignUpValues

