//
//  Colors.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/26/22.
//



var originalIsInDarkColorScheme = false // (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)


let isInDarkColorScheme = false
/*
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    isInDarkColorScheme = e.matches
})
*/



export default {
    /** Basic 
    */
    clear: 'rgba(52, 52, 52, 0)',
    white: isInDarkColorScheme ? '#000000' : "#fff",
    whiteToGray: isInDarkColorScheme ? '#303134' : '#fff', // used for searchbars, tabs or bottom sheets. Is lighter than : #202124
    // Dividers : #5f6367
    // Icons : #9a9fa6
    // letters : #e8e9ed
    whiteToGray2: isInDarkColorScheme ? '#202124' : '#fff',
    black: isInDarkColorScheme ? '#fff' : '#000',
    /**  Multicolor 
    */
    darkBlue: "#17A6FF", // rgba(23, 166, 255, 1)
    newItemBlue: 'rgba(23, 166, 255, 0.15)', // Used to highlight a new View (e.g. : a new "PostCategory")
    atSightBlue: '#22baf7',
    red: "#E94258",
    green: "#30FF6F",
    /** Gray 
    */
    bgGray: '#303134', // from whiteToGray
    bgDarkGray: '#202124', // from whiteToGray2
    superWhitegray: '#FBFBFB',
    whiteGray: isInDarkColorScheme ? '#25262a' : '#F8F8F8',
    lightGray: isInDarkColorScheme ? '#303134' : '#F3F4F6',
    lightGray2: isInDarkColorScheme ? '#212323' : '#F3F4F6',
    lightGray3: isInDarkColorScheme ? '#161919' : '#F3F4F6',
    smallGrayText: '#999999', // Also no content font 
    softGray: isInDarkColorScheme ? '#424446' : '#F1F1F2',  //'rgba(220, 221, 222, 0.4)', // Post counters cells + photos when in loading appearance 
    capsuleGray: isInDarkColorScheme ? '#4E4F50' : '#DCDDDE',
    darkGray: '#202323',
    borderGray: '#DDDCDD',
    placeholderGray: 'rgba(188, 188, 188, 1)',
    webDefaultBorderGray: '#E5E7EB',  // the default color for borders 
}