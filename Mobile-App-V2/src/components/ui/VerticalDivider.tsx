//
//  VerticalDivider.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View } from 'react-native'
import { ColorsInterface } from './../../assets/Colors'


export default function VerticalDivider({ COLORS }: { COLORS: ColorsInterface }) {
    return (
        <View
            style={{
                backgroundColor: COLORS.black,
                width: 1.7,
                height: 16,
            }}
        />
    )
}


