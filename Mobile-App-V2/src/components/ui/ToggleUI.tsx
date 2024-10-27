//
//  ToggleUI.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View, Text, Switch, Platform, Pressable } from 'react-native'
import { TextStylesInterface } from '../styles/TextStyles'
import { ColorsInterface } from './../../assets/Colors'



interface ToggleUIInterface {
    title: string
    description?: string
    value: boolean
    onSetValue: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    paddingVertical?: number
    disabled?: boolean
}
function ToggleUI({ title, description = "", value, onSetValue, COLORS, TEXT_STYLES, paddingVertical = 20, disabled = false }: ToggleUIInterface) {
    return (
        <Pressable 
        onPress={() => { onSetValue(!value) }}
        style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: "center",
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: paddingVertical,
            backgroundColor: COLORS.whiteToGray2,

        }}>
            <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.calloutMedium, { color: COLORS.black }]} >{title}</Text>

                {(description !== "") &&
                    <Text style={[TEXT_STYLES.gray13Text, { paddingTop: 6 }]}>{description}</Text>
                }
            </View>



            <View style={{ paddingLeft: 35, opacity: Platform.OS === "android" && disabled ? 0.5 : 1 }}>
                <Switch
                    disabled={disabled}
                    trackColor={{ true: COLORS.darkBlue }}
                    onValueChange={boolean => { onSetValue(boolean) }}
                    value={value}
                />
            </View>



        </Pressable>
    )
}



export default ToggleUI