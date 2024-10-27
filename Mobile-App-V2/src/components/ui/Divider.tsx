//
//  Divider.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ColorsInterface } from '../../assets/Colors'

interface DividerInterface {
  COLORS: ColorsInterface
  marginLeft?: number
  marginRight?: number
  color?: string 
}
export default function Divider({ COLORS, marginLeft = 0, marginRight = 0, color = COLORS.black } : DividerInterface) {
  return (
    <View
      style={{
        opacity: 0.23,
        borderBottomColor: color,
        borderBottomWidth : StyleSheet.hairlineWidth,
        marginLeft: marginLeft,
        marginRight: marginRight, 
      }}
    />
  )
}