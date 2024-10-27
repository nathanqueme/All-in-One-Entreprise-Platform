//
//  CirclePhoto.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import ButtonForAddingContent from './ButtonForAddingContent'
import { Image, View, Text } from 'react-native'
import { ColorsInterface } from '../../assets/Colors'
import { capitalize } from '../functions'
import { TextStylesInterface } from '../styles/TextStyles'



interface CirclePhotoInterface {
    base64: string
    widthAndHeight: number
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    isAccountManagerPreview?: boolean
    displayLetterIfNoPhoto?: string
}
export default function CirclePhoto({ base64, widthAndHeight, COLORS, TEXT_STYLES, isAccountManagerPreview = false, displayLetterIfNoPhoto = "" }: CirclePhotoInterface) {
    if ((base64 ?? "") !== "") {
        return (
            <Image
                style={{
                    resizeMode: 'cover',
                    width: widthAndHeight,
                    height: widthAndHeight,
                    borderRadius: widthAndHeight,
                    backgroundColor: COLORS.softGray,
                }}
                source={{ uri: base64 }}
            />)
    } else if (displayLetterIfNoPhoto !== "") {
        return (
            <View
                style={{
                    alignContent: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    width: widthAndHeight,
                    height: widthAndHeight,
                    borderRadius: widthAndHeight,
                    backgroundColor: COLORS.whiteGray,
                    // Border
                    borderColor: '#DDDCDD',
                    borderWidth: 0.75,
                }}
            >
                <Text style={{ color: COLORS.black, fontWeight: "bold", fontSize: 17 * widthAndHeight / 38 }}>{capitalize(displayLetterIfNoPhoto)}</Text>
            </View>)
    }
    else {
        return (
            <ButtonForAddingContent
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                widthAndHeight={widthAndHeight}
                contentType={isAccountManagerPreview ? "account_management" : "photo"}
                rounded={true}
            />
        )
    }
}