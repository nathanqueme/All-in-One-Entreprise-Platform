//
//  signUpSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
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
            const { value, key } = action.payload

            // Updates 
            state[key as keyof SignUpValues] = value

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
export const selectSignUpValues = (state: any) => state.signUpValues as SignUpValues

