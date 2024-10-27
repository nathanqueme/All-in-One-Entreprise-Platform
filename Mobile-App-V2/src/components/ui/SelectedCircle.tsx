//
//  SelectedCircle.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View } from 'react-native'
import { ColorsInterface } from './../../assets/Colors'


interface SelectedCircleInterface {
    isSelected: boolean 
    COLORS: ColorsInterface
    colorWhenSelected?: string 
}
export default function SelectedCircle({ isSelected, COLORS, colorWhenSelected = COLORS.darkBlue }: SelectedCircleInterface) {
    return (
        <View style={{
            backgroundColor: COLORS.whiteToGray2,
            alignSelf: 'center',
            borderRadius: 16,
            borderColor: COLORS.capsuleGray,
            borderWidth: 2,
        }}>
            <View style={{
                width: 16,
                height: 16,
                backgroundColor: isSelected ? colorWhenSelected : COLORS.clear,
                margin: 2,
                borderRadius: 16 / 2,
            }}>
            </View>
        </View>
    )
}
