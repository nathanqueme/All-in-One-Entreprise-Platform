//
//  MultipleInputsContainer.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import MainStylesProvider from '../styles/MainStyles'
import { View, StyleSheet } from 'react-native'
import { ColorsInterface } from '../../assets/Colors'

interface MultipleInputsContainerInterface {
    firstTextInput: any
    secondTextInput: any 
    COLORS: ColorsInterface
}
export default function MultipleInputsContainer({ firstTextInput, secondTextInput, COLORS } : MultipleInputsContainerInterface) {
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)
    return (
        <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30 }]}>
            <View style={styles.iOSClearButtonAligner} children={firstTextInput} />


            {/* White seperator */}
            <View style={{ backgroundColor: COLORS.whiteToGray2, height: 4, width: '100%' }} />



            <View style={styles.iOSClearButtonAligner} children={secondTextInput} />
        </View>
    )
}



const styles = StyleSheet.create({
    // Pushes the clear button on iOS so it has 20 of padding horizontally on both sides 
    iOSClearButtonAligner: {
        width: "100%", paddingRight: 16 - 5
    },
})