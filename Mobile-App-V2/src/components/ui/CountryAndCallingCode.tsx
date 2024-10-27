//
//  CountryAndCallingCode.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { ColorsInterface } from './../../assets/Colors'
import { Pressable, Text } from 'react-native'
import { TextStylesInterface } from '../styles/TextStyles'


interface CountryAndCallingCodeInterface {
    country_code: string
    calling_code: string
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
function CountryAndCallingCode({ country_code, calling_code, onPress, COLORS, TEXT_STYLES }: CountryAndCallingCodeInterface) {
    return (
        <Pressable onPress={onPress}>
            <Text
                style={[
                    TEXT_STYLES.calloutMedium, {
                        color: COLORS.darkBlue
                    }]}>{country_code} (+{calling_code})</Text>
        </Pressable>
    )
}


export default CountryAndCallingCode