//
//  MainStyles.ts
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { StyleSheet } from 'react-native'
import { ColorsInterface } from '../../assets/Colors'


export interface MainStylesInterface {
    pushLeft: any
    valueInputContainer: any
    symbolFont: any
}
export default class MainStylesProvider {
    static getStyles(COLORS: ColorsInterface) {
        return StyleSheet.create({
            pushLeft: {
                width: '100%',
                justifyContent: 'center',
                alignItems: 'flex-start',
            },

            valueInputContainer: {
                backgroundColor: COLORS.lightGray,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'flex-start',
            },

            symbolFont: {
                width: 34,
                height: 34,
            }

        })
    }
}
