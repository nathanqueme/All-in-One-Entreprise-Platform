//
//  CapsuleText.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import TextStylesProvider, { TextStylesInterface } from '../styles/TextStyles'
import { View, Text } from 'react-native'
import { ColorsInterface } from './../../assets/Colors'



interface CapsuleTextInterface {
    text: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    marginBottom?: number 
}
export default function CapsuleText({ text, COLORS, TEXT_STYLES, marginBottom = 0 }: CapsuleTextInterface) {
    return (
        <View style={{
            backgroundColor: COLORS.lightGray,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 7,
            paddingHorizontal: 12,
            paddingVertical: 7, 
            flex: 1, 
            marginBottom: marginBottom
        }}>
      
            <Text style={[
                TEXT_STYLES.medium14, {
                color: COLORS.black,
            }
            ]}>{text}</Text>
  
        </View>
    )
}
