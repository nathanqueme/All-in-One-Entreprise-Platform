//
//  ProfileNotFoundUi.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import localization from '../../utils/localizations'
import { View, Text } from 'react-native'
import { ColorsInterface } from './../../assets/Colors'
import { ExclamationMarkCircle } from '../Symbols'
import { TextStylesInterface } from '../styles/TextStyles'



interface ProfileNotFoundUiInterface {
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
export function ProfileNotFoundUi({ COLORS, TEXT_STYLES } : ProfileNotFoundUiInterface) {
    return (
        <View
        style={{
            paddingVertical: 30,
            justifyContent: "center",
            alignItems: "center"
        }}>
       
       
        <ExclamationMarkCircle COLORS={COLORS} size={60} color={COLORS.smallGrayText} />
       
       
        <Text
            style={[
                TEXT_STYLES.noContentFont, {
                    paddingTop: 15,
                    paddingHorizontal: 30,
                    textAlign: "center"
                }]}>{localization.no_profile_found}</Text>
        <Text
            style={[
                TEXT_STYLES.gray13Text, {
                    paddingTop: 4,
                    paddingHorizontal: 40,
                    textAlign: "center"
                }]}>{localization.no_profile_found_explanation}</Text>
       </View>
    )
}


