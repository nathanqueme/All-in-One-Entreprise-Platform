//
//  TextAndDescription.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { Text, View } from 'react-native'
import React from 'react'
import { ColorsInterface } from './../../assets/Colors'
import { CertificationBadge } from '../Symbols'
import { TextStylesInterface } from '../styles/TextStyles'


/** 
   A view that displays text and its description if any at the bottom. 
   - The a single line text is by default black and gets truncated when tacking to much space.
   - The single line description is in gray and gets truncated too when too large.
 */
interface TextAndDescriptionInterface {
    text: string
    description: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    numberOfLinesForDescription?: number
    doNotLimitDescriptionNumberOfLines?: boolean
    textColor?: string
    certificationBadge?: boolean
    paddingLeft?: number
    alignItemsCenter?: boolean
}
export default function TextAndDescription({ text, description, COLORS, TEXT_STYLES, numberOfLinesForDescription = 1, doNotLimitDescriptionNumberOfLines = false, textColor = COLORS.black, certificationBadge = false, paddingLeft = 0, alignItemsCenter = false }: TextAndDescriptionInterface) {
    return (
        <View style={{ justifyContent: "center", alignItems: alignItemsCenter ? "center" : "flex-start", paddingLeft: paddingLeft }}>
            {/* Headertext + (badge) */}
            <View style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
            }}>

                <Text
                    numberOfLines={1}
                    style={[
                        TEXT_STYLES.calloutMedium,
                        {
                            color: textColor,
                            textAlign: alignItemsCenter ? "center" : "left"
                        }
                    ]}
                >{text}
                </Text>


                {certificationBadge &&
                    <View style={{ paddingLeft: 4 }}>
                        <CertificationBadge small={true} COLORS={COLORS}/>
                    </View>
                }
            </View>





            {/* Gray description */}
            {((description ?? "") !== "") &&
                <Text
                    numberOfLines={doNotLimitDescriptionNumberOfLines ? undefined : numberOfLinesForDescription}
                    ellipsizeMode='tail'
                    style={[
                        TEXT_STYLES.gray13Text,
                        { marginTop: 4, textAlign: alignItemsCenter ? "center" : "left" }
                    ]}
                >{description}
                </Text>
            }

        </View>
    )
}


