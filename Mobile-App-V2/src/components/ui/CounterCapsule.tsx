//
//  CirclePhoto.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { ColorsInterface } from './../../assets/Colors'
import { Text, View } from 'react-native'
import { ChevronRightFatSymbol } from '../Symbols'
import { TextStylesInterface } from '../styles/TextStyles'


interface CounterCapsuleInterface {
    itemsCount: number
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    displayChevron?: boolean
}
export function CounterCapsule({ itemsCount, COLORS, TEXT_STYLES, displayChevron = true }: CounterCapsuleInterface) {
    return (
        <View
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: COLORS.softGray,
                padding: 3,
                paddingHorizontal: 7,
                borderRadius: 4.5
            }}
        >

            <Text
                numberOfLines={1}
                style={[
                    TEXT_STYLES.medium15, {
                        color: COLORS.black
                    }
                ]}>{itemsCount}</Text>


            {displayChevron &&
                <View style={{ paddingLeft: 4 }}>
                    <ChevronRightFatSymbol color={COLORS.black} />
                </View>
            }

        </View>
    )
}
