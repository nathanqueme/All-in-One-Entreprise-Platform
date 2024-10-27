//
//  TapGesturesFacilitators.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View } from 'react-native'


interface SymbolTapGesturesFacilitatorInterface {
    widthAndHeight?: number
    content: any
}
/**
 * Adds an invisible rectangle over a symbol to make the tappable space larger. So to make symbols more easily tappable.
 * This should not have any impact on the alignment of the symbol.
 */
export default function SymbolTapGesturesFacilitator({ widthAndHeight = 35, content }: SymbolTapGesturesFacilitatorInterface) {
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {content}
            <View
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                    position: 'absolute',
                    // backgroundColor: "blue", // --> uncomment to see what it does  
                    opacity: 0.5
                }}></View>
        </View>
    )
}


interface TextTapGesturesFacilitatorInterface {
    width: number
    height: number
    content: any
}
export function TextTapGesturesFacilitator({ width = 40, height = 40, content }: TextTapGesturesFacilitatorInterface) {
    return (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
            {content}
            <View
                style={{
                    width: width + 40,
                    height: height,
                    position: 'absolute',
                    // backgroundColor: "blue", // --> uncomment to see what it does  
                    opacity: 0.5
                }}></View>
        </View>
    )
}

