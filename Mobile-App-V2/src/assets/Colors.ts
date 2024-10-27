//
//  Colors.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { Appearance, useColorScheme } from 'react-native'


 export interface ColorsInterface {
    clear: string
    white: string
    whiteToGray: string
    whiteToGray2: string
    black: string
    darkBlue: string
    newItemBlue: string
    atSightBlue: string
    red: string
    green: string
    bgGray: string
    bgDarkGray: string
    whiteGrayBlackScheme: string
    whiteGray: string
    lightGray: string
    lightGray2: string
    lightGray3: string
    smallGrayText: string
    softGray: string
    capsuleGray: string
    darkGray: string
    borderGray: string
    placeholderGray: string
}
/**
 * @param {string} static_scheme indicates if the colors must detect and handle device's color scheme changes. 
 *
 * When set to "static_scheme" it will only detect the scheme once. This is done so that the hook can be used outside of a hook without causing an error. (When used this way, it is used to initialize colors of components with default values.)
 * e.g. : 
 * 
 * const STATIC_COLORS = getColors()
 * 
 * function GrayText(){
 *  return (<Text style={{ color: COLORS.lightgray }}>Demo...</Text>)
 * }
 * 
 * To understand what this avoids, add this code outside of a hook in a file, below the imports and see the error that occurs : 
 * const COLORS = getColors("detect_and_handle_scheme_changes")
 * 
 */
export default function getColors(scheme_mode: "static_scheme" | "detect_and_handle_scheme_changes" = "static_scheme") {

    const color_scheme = scheme_mode === "detect_and_handle_scheme_changes" ? useColorScheme() : Appearance.getColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"

    if (is_in_dark_color_scheme) {
        // The colors at the right are the light scheme equivalent
        return {
            /** Basic */
            clear: 'rgba(52, 52, 52, 0)',
            white: '#000000', // "#fff"
            whiteToGray: '#303134', // '#fff' used for searchbars, tabs or bottom sheets. Is lighter than : #202124
            // Dividers : #5f6367
            // Icons : #9a9fa6
            // letters : #e8e9ed
            whiteToGray2: '#202124', // '#fff'
            black: '#fff', // '#000'
            /**  Multicolor */
            darkBlue: "#17A6FF", // or rgba(23, 166, 255, 1)
            newItemBlue: 'rgba(23, 166, 255, 0.15)', // Used to highlight a new View (e.g. : a new "PostCategory")
            atSightBlue: '#22baf7',
            red: "#E94258",
            green: "#30FF6F",
            /** Gray */
            bgGray: '#303134', // from whiteToGray
            bgDarkGray: '#202124', // from whiteToGray2
            whiteGrayBlackScheme: '#25262a',
            whiteGray: '#25262a', // '#F8F8F8'
            lightGray: '#303134', // '#F3F4F6'
            lightGray2: '#212323', // '#F3F4F6'
            lightGray3: '#161919', // '#F3F4F6'
            smallGrayText: '#999999', // Also no content font 
            softGray: '#424446', // '#F1F1F2' //or 'rgba(220, 221, 222, 0.4)', // Post counters cells + photos when in loading appearance 
            capsuleGray: '#4E4F50', // '#DCDDDE'
            darkGray: '#202323',
            borderGray: '#DDDCDD',
            placeholderGray: 'rgba(188, 188, 188, 1)'
        }
    } else {
        return {
            /** Basic */
            clear: 'rgba(52, 52, 52, 0)',
            white: "#fff",
            whiteToGray: '#fff', // used for searchbars, tabs or bottom sheets. Is lighter than : #202124
            // Dividers : #5f6367
            // Icons : #9a9fa6
            // letters : #e8e9ed
            whiteToGray2: '#fff',
            black: '#000',
            /**  Multicolor */
            darkBlue: "#17A6FF", // rgba(23, 166, 255, 1)
            newItemBlue: 'rgba(23, 166, 255, 0.15)', // Used to highlight a new View (e.g. : a new "PostCategory")
            atSightBlue: '#22baf7',
            red: "#E94258",
            green: "#30FF6F",
            /** Gray */
            bgGray: '#303134', // from whiteToGray
            bgDarkGray: '#202124', // from whiteToGray2
            whiteGrayBlackScheme: '#25262a',
            whiteGray: '#F8F8F8',
            lightGray: '#F3F4F6',
            lightGray2: '#F3F4F6',
            lightGray3: '#F3F4F6',
            smallGrayText: '#999999', // Also no content font 
            softGray: '#F1F1F2',  //'rgba(220, 221, 222, 0.4)', // Post counters cells + photos when in loading appearance 
            capsuleGray: '#DCDDDE',
            darkGray: '#202323',
            borderGray: '#DDDCDD',
            placeholderGray: 'rgba(188, 188, 188, 1)'
        }
    }
}

