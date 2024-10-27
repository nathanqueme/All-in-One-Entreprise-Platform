//
//  ButtonForAddingContent.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import localization from '../../utils/localizations'
import { ColorsInterface } from './../../assets/Colors'
import { View, Text } from 'react-native'
import { PdfSymbol, PersonSymbol, PhotoSymbol, PlusSymbol } from '../Symbols'
import { ContentType } from '../../Types'
import { TextStylesInterface } from '../styles/TextStyles'


interface ButtonForAddingContentInterface {
    widthAndHeight: number
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    contentType?: ContentType
    rounded?: boolean
    backgroundColor?: string 
}
function ButtonForAddingContent({ widthAndHeight, COLORS, TEXT_STYLES, contentType = "any", rounded = false, backgroundColor = COLORS.whiteToGray }: ButtonForAddingContentInterface) {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: "center",
            width: widthAndHeight,
            height: widthAndHeight,
            borderColor: '#DDDCDD',
            borderRadius: rounded ? widthAndHeight : 0,
            borderWidth: 0.75,
            backgroundColor: backgroundColor,
        }}>
            {
                (() => {
                    switch (contentType) {
                        case "photo": return <PhotoSymbol COLORS={COLORS} size={35 * widthAndHeight / 80} />
                        case "account_management": return <PersonSymbol COLORS={COLORS} size={35 * widthAndHeight / 80} color={COLORS.smallGrayText} />
                        case "pdf": return <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <PdfSymbol
                            COLORS={COLORS}
                                size={32 * widthAndHeight / 80}
                                color={COLORS.smallGrayText}
                            />
                            <Text
                                style={[
                                    TEXT_STYLES.gray13Text, {
                                        textAlign: "center"
                                    }]
                                }>{localization.pdf}</Text>
                        </View>
                        default: return <PlusSymbol COLORS={COLORS} size={24} />
                    }
                })()
            }
        </View>
    )
}


export default ButtonForAddingContent
