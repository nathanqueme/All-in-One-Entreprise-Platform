//
//  TextStyles.ts
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { StyleSheet } from 'react-native'
import { ColorsInterface } from '../../assets/Colors'

export interface TextStylesInterface {
    bold19: any
    headerText: any         
    headerTextFont: any
    textInput16Medium: any
    textInput16MediumInRow: any
    textInput: any
    headline: any
    noContentFont: any
    callout: any
    calloutMedium: any
    bold15: any
    medium15: any
    black14: any
    medium14: any
    footnote: any
    blueTappableText: any
    titleText: any
    gray13Text: any
    tappable13Text: any
    gray12Text: any
}
export default class TextSytlesProvider {
    static getStyles(COLORS: ColorsInterface) {
        return StyleSheet.create({

            bold19: {
                fontSize: 19,
                fontWeight: "bold",
            },

            headerText: {
                // headline font 
                fontSize: 17,
                fontWeight: "bold",
                position: 'absolute',
                alignSelf: 'center',
                marginHorizontal: 40,
                textAlign: 'center',
            },

            headerTextFont: {
                // headline font 
                fontSize: 17,
                fontWeight: "bold",
            },

            textInput16Medium: {
                width: '100%', // Does sort of that not only the textinput's placeholder is tappable.
                color: COLORS.black,
                fontSize: 16,
                paddingLeft: 16,
                paddingVertical: 16,
                fontWeight: "500",
            },

            textInput16MediumInRow: {
                flex: 1,
                color: COLORS.black,
                fontSize: 16,
                paddingLeft: 16,
                paddingVertical: 16,
                fontWeight: "500",
            },

            textInput: {
                width: '100%', // Does sort of that not only the textinput's placeholder is tappable.
                color: COLORS.black,
                fontSize: 16,
            },

            // 17 + Weight : bold (600)
            headline: {
                fontSize: 17,
                fontWeight: "bold"
            },

            noContentFont: {
                fontSize: 17,
                fontWeight: 'bold',
                color: COLORS.smallGrayText,
            },

            // 16 
            callout: {
                fontSize: 16
            },

            // 16 + Weight : medium (500) 
            calloutMedium: {
                fontWeight: "500",
                fontSize: 16
            },

            bold15: {
                fontSize: 15,
                fontWeight: '700'
            },

            medium15: {
                fontSize: 15,
                fontWeight: '600'
            },

            black14: {
                color: COLORS.black,
                fontSize: 14,
            },

            medium14: {
                fontSize: 14,
                fontWeight: '600',
            },

            // 13 
            footnote: {
                fontSize: 13.5
            },

            blueTappableText: {
                color: COLORS.darkBlue,
                fontSize: 15,
                fontWeight: "500"
            },

            titleText: {
                textAlign: 'center',
                paddingHorizontal: 50,
                fontSize: 22,
                fontWeight: "bold",
            },

            gray13Text: {
                color: COLORS.smallGrayText,
                fontSize: 13.5,
            },

            tappable13Text: {
                textAlign: 'center',
                color: COLORS.black,
                fontSize: 13,
            },

            // CONTENT EDITORS
            gray12Text: {
                color: COLORS.smallGrayText,
                fontSize: 12,
            },

        })
    }
}


