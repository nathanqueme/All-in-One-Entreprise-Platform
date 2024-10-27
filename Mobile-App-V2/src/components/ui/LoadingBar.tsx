//
//  LoadingBar.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View, Animated } from 'react-native'
import { ColorsInterface } from './../../assets/Colors'



interface ProgressBarInterface {
    progress: Animated.Value
    COLORS: ColorsInterface
    isLoading?: boolean
    backgroundColor?: string 
}
export function LoadingBar({ progress, isLoading, COLORS, backgroundColor = COLORS.lightGray }: ProgressBarInterface) {

    return (
        <View
            style={{
                opacity: isLoading ? 1:0,
                height: 2,
                backgroundColor: backgroundColor,
                flexDirection: 'row',
                overflow: 'hidden',
                width: '100%',
            }}>

            <Animated.View
                style={[
                    {
                        backgroundColor: COLORS.darkBlue,
                        width: '100%',
                        height: '100%',
                        left: 0
                    },
                    {transform: [{ translateX: progress }]}
                ]}
            />
        </View>
    )
}