//
//  CategoryAppearance.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import { ColorsInterface } from './../../assets/Colors'
import { View, Text, Pressable } from 'react-native'
import { CounterCapsule } from '../ui/CounterCapsule'
import { TextStylesInterface } from '../styles/TextStyles'



interface CategoryAppearanceInterface {
    title: string
    children: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    itemsCount?: number
    paddingTop?: number
    paddingBottom?: number
    loadingAppearance?: boolean
    subtitle?: string
    onPress?: any
    hideItemsCountButton?: boolean
    wasCreated?: boolean
}
/**
  * Displays the title, a subtitle and the post count of the given postCategory. 
*/
export default function CategoryAppearance({ title, children, COLORS, TEXT_STYLES, itemsCount = 0, paddingTop = 0, paddingBottom = 0, loadingAppearance = false, subtitle = "", onPress, hideItemsCountButton = false, wasCreated = false }: CategoryAppearanceInterface) {


    // States 
    const [wasCreatedAppearance, setWasCreatedAppearance] = useState(false)
    useEffect(() => {

        if (wasCreated) {
            setWasCreatedAppearance(true)
            setTimeout(() => {
                setWasCreatedAppearance(false)
            }, 950)
        }

    }, [wasCreated])


    return (
        <View style={{
            width: '100%',
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            backgroundColor: wasCreatedAppearance ? COLORS.newItemBlue : COLORS.clear,
        }}>


            {/* Top : info */}
            <Pressable
                onPress={onPress}
                style={{
                    paddingVertical: 13, // Originaly 8
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }}
            >


                {/* Name + description */}
                <View style={{ alignItems: 'flex-start' }}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={[
                            TEXT_STYLES.medium15, {
                                color: loadingAppearance ? COLORS.clear : COLORS.black,
                                backgroundColor: loadingAppearance ? COLORS.softGray : COLORS.clear,
                            }]}
                    >{title}</Text>

                    {subtitle.length > 0 &&
                        <Text
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={{
                                fontSize: 12,
                                paddingTop: 3, // NEW
                                color: loadingAppearance ? COLORS.clear : COLORS.smallGrayText,
                            }}
                        >{subtitle}</Text>
                    }
                </View>


                {/* Post count */}
                {!loadingAppearance && !hideItemsCountButton ?
                    <CounterCapsule itemsCount={itemsCount} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/> : null
                }
            </Pressable>


            {children}
        </View>
    )
}


