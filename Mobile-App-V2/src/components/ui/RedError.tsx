//
//  RedError.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from "react"
import { View, Text } from 'react-native'


export default function RedError({ error, textAlign = "center", alignItems = "center", marginH = 30, marginTop, COLORS, TEXT_STYLES }) {
    return (
        <View
            style={{
                justifyContent: "center",
                alignItems: alignItems as any,
                marginTop: marginTop,
                marginHorizontal: marginH,
            }}>

            <Text
                style={[
                    TEXT_STYLES.footnote, {
                        color: COLORS.red,
                        textAlign: textAlign as any,
                    }]}
            >{error}</Text>

        </View>
    )
}