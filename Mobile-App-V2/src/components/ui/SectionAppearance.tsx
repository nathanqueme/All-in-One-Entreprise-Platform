//
//  SectionAppearance.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { View, Text } from 'react-native'
import React from 'react'
import Divider from './Divider'
import { ColorsInterface } from './../../assets/Colors'
import { TextStylesInterface } from '../styles/TextStyles'




interface SectionAppearanceInterface {
    text: string
    children: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    hideTopDivider?: boolean
    hideBottomDivider?: boolean
    marginTop?: number
    marginBottom?: number
    backgroundColor?: string
}
/* Wraps the view between two dividers and display small gray text a the top left corner.
 */
export default function SectionAppearance({ text, children, COLORS, TEXT_STYLES, hideTopDivider = false, hideBottomDivider = false, marginTop = 0, marginBottom = 0, backgroundColor = undefined }: SectionAppearanceInterface) {
    return (
        <View style={{
            paddingTop: marginTop,
            paddingBottom: marginBottom,
        }}>
            <Text
                style={[
                    TEXT_STYLES.gray13Text, {
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                        alignSelf: 'flex-start'
                    }
                ]}>{text}</Text>
            {hideTopDivider === false && <Divider COLORS={COLORS} />}
            <View style={{ backgroundColor: backgroundColor }}>
                {children}
            </View>
            {hideBottomDivider === false && <Divider COLORS={COLORS} />}
        </View>
    )
}
