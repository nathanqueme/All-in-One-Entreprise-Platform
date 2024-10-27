//
//  RectanglePhoto.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/15/22.
//

import { Image, View } from 'react-native'
import React from 'react'
import ButtonForAddingContent from './ButtonForAddingContent'
import { ColorsInterface } from '../../assets/Colors'
import { TextStylesInterface } from '../styles/TextStyles'



interface HeaderPhotoInterface {
    base64: string
    width: number
    height: number
    isUserAccount: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
export default function HeaderPhoto({ base64, width, height, isUserAccount, COLORS, TEXT_STYLES }: HeaderPhotoInterface) {
    if ((base64 ?? "") !== "") {
        return (
            <Image
                style={{
                    resizeMode: 'cover',
                    width: width,
                    height: height,
                    backgroundColor: COLORS.softGray,
                }}
                source={{ uri: base64 }}
            />)
    }
    else {
        return (
            <View
                style={{
                    width: width,
                    height: height,
                    backgroundColor: COLORS.softGray,
                    justifyContent: "flex-start",
                    alignItems: "flex-end"
                }}>
                {isUserAccount &&
                    <View
                        style={{ padding: 9 }}
                    >
                        <ButtonForAddingContent
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            widthAndHeight={42}
                            contentType={"photo"}
                            rounded={true}
                        />
                    </View>
                }
            </View>
        )
    }
}