//
//  TextStyles.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React from 'react'
import colors from '../assets/Colors'


export default {

    editorSectionTitle: {
        fontSize: 22, 
        fontWeight: "600", 
        lineHeight: "32px",
    },

    bold19: {
        fontSize: 19,
        fontWeight: "bold",
        lineHeight: "23px"
    },






    headerTextFont: {
        // headline font 
        fontSize: 17,
        fontWeight: "bold",
        lineHeight: "21px"
    },

    textInput16Medium: {
        width: '100%', /// Does sort of that not only the textinput's placeholder is tappable.
        color: colors.black,
        fontSize: 16,
        paddingLeft: 16,
        paddingVertical: 16,
        fontWeight: "500",
        lineHeight: "20px"
    },


    textInput16MediumInRow: {
        flex: 1,
        color: colors.black,
        fontSize: 16,
        paddingLeft: 16,
        paddingVertical: 16,
        fontWeight: "500",
        lineHeight: "20px"
    },




    textInput: {
        width: '100%', /// Does sort of that not only the textinput's placeholder is tappable.
        color: colors.black,
        fontSize: 16,
        lineHeight: "20px"
    },


    /// 17 + Weight : bold (600)
    headline: {
        fontSize: 17,
        fontWeight: "bold",
        lineHeight: "20px"
    },


    noContentFont: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.smallGrayText,
        lineHeight: "20px"
    },


    /// 16 
    callout: {
        fontSize: 16,
        lineHeight: "20px"
    },


    /// 16 + Weight : medium (500) 
    calloutBold: {
        fontWeight: "bold",
        fontSize: 16,
        lineHeight: "20px"
    },

    /// 16 + Weight : medium (500) 
    calloutMedium: {
        fontWeight: "500",
        fontSize: 16,
        lineHeight: "20px"
    },


    bold15: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: "19px"
    },

    sheetInputFont: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: "21px"
    },

    medium15: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: "19px"
    },

    default15: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: "19px"
    },


    bold14: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: "19px"
    },

    medium14: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: "17px"
    },


    black14: {
        color: colors.black,
        fontSize: 14,
        lineHeight: "17px"
    },


    /// 13 
    footnote: {
        fontSize: 13.5,
        lineHeight: "16px"
    },


    blueTappableText: {
        color: colors.darkBlue,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: "19px"
    },


    titleText: {
        textAlign: 'center',
        paddingHorizontal: 50,
        fontSize: 22,
        fontWeight: "bold",
    },


    gray13Text: {
        color: colors.smallGrayText,
        fontSize: 13.5,
        lineHeight: "16px"
    },



    tappable13Text: {
        textAlign: 'center',
        color: colors.black,
        fontSize: 13,
    },

    
    // CONTENT EDITORS
    gray12Text: {
        color: colors.smallGrayText,
        fontSize: 12,
    },

}
