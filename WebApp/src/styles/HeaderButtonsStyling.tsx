//
//  HeaderButtonsStyling.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import colors from '../assets/Colors'


/// Renders a style sheet as a component and by passing variables to it.
export default class HeaderButtonsStyling {
    static getButtonStylingSheet(condition: boolean, blueWhenTappable: boolean) {
        return {
            buttonColor: {
                color: condition ? (blueWhenTappable ?  colors.darkBlue:colors.black):colors.capsuleGray,
            },
            opacity: {
                opacity: condition ? 1 : 0.1
            },
        }
    }
}