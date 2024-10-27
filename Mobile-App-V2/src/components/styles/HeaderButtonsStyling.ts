//
//  HeaderButtonsStyling.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { StyleSheet } from "react-native"
import { ColorsInterface } from "../../assets/Colors"


// Renders a style sheet as a component and by passing variables to it.
export default class HeaderButtonsStyling {
    static getButtonStylingSheet(condition: boolean, blueWhenTappable: boolean, COLORS: ColorsInterface) {
        return StyleSheet.create({
            buttonColor: {
                color: condition ? (blueWhenTappable ?  COLORS.darkBlue : COLORS.black): COLORS.capsuleGray,
            },

            opacity: {
                opacity: condition ? 1 : 0.1
            },

        })
    }
}