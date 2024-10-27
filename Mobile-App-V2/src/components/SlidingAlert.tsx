//
//  SlidingAlert.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import localization from '../utils/localizations'
import { TextStylesInterface } from './styles/TextStyles'
import { ColorsInterface } from './../assets/Colors'
import { easing } from './animations'
import { Text, View, Animated, Dimensions } from 'react-native'
import { CheckMarkCircleSymbol, ExclamationMarkCircleSymbol, NoConnectionSymbol, XMarkSymbol } from './Symbols'
import { SlidingAlertType } from '../Types'


interface SlidingAlertInterface {
    topInset: number
    bottomInset: number
    slidingAlertType: SlidingAlertType
    resetSlidingAlertType: any
    slideFromBottom: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    customText?: string
}
export function SlidingAlert({ topInset, bottomInset, slidingAlertType, resetSlidingAlertType, slideFromBottom, COLORS, TEXT_STYLES, customText = "" }: SlidingAlertInterface) {


    // States
    const [persistentType, setPersistentType]: [SlidingAlertType | undefined, any] = useState('copied_alert')


    // Values
    const PADDING = 8
    const SAFE_AREA_AND_SPACE = (slideFromBottom ? bottomInset : topInset) + PADDING
    const HEIGHT = 48
    const TOTAL_HEIGHT = SAFE_AREA_AND_SPACE + HEIGHT
    const offset = useRef(new Animated.Value(0)).current
    const WINDOW_WIDTH = Dimensions.get('window').width



    function animateVariable(variableToEdit, value, duration = 260) {
        Animated.timing(variableToEdit, {
            toValue: value,
            useNativeDriver: true,
            duration: duration,
            easing: easing
        }).start()
    }


    useEffect(() => {
        if (slidingAlertType === '' as any) {
            animateVariable(offset, 0)
        }
        else {
            animateVariable(offset, (slideFromBottom ? - TOTAL_HEIGHT : TOTAL_HEIGHT))
            setPersistentType(slidingAlertType)
            setTimeout(() => {
                resetSlidingAlertType()
            }, 2500)
        }
    }, [slidingAlertType])





    function getSymbolAndTextColor() {
        switch (persistentType) {
            case 'no_connection': 
            case 'profile_not_found':
            case 'copied_alert':
            case 'sent_alert': return "white"
        }
    }


    function getBackgroundColor() {
        switch (persistentType) {
            case 'no_connection': 
            case 'profile_not_found': return COLORS.red
            case 'copied_alert':
            case 'sent_alert': return COLORS.darkBlue
        }
    }


    function getSymbol() {
        let color = getSymbolAndTextColor()
        switch (persistentType) {
            case 'no_connection': return (<NoConnectionSymbol color={color} />)
            case 'profile_not_found': return (<ExclamationMarkCircleSymbol color={color} />)
            case 'copied_alert':
            case 'sent_alert': return (<CheckMarkCircleSymbol color={color} />)
        }
    }

    function getText() {
        switch (persistentType) {
            case 'no_connection': return localization.no_internet_connection
            case 'profile_not_found': return localization.profile_not_found
            case 'copied_alert': return localization.copied_to_clipboard
            case 'sent_alert': return localization.successfully_sent
        }
    }



    return (
        <Animated.View style={{
            transform: [{ translateY: offset }], // Animation
            position: 'absolute',
            top: (slideFromBottom ? null : - HEIGHT),
            bottom: (slideFromBottom ? - HEIGHT : null),
            height: HEIGHT,
            width: WINDOW_WIDTH - PADDING * 2,
            backgroundColor: getBackgroundColor(),
            borderRadius: 12,
            paddingHorizontal: 12,
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}>
            <View style={{ paddingRight: 12 }}>
                {getSymbol()}
            </View>
            <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={[
                    TEXT_STYLES.calloutMedium, {
                        color: getSymbolAndTextColor(),
                        flexShrink: 1
                    }]
                }>{customText !== "" ? customText : getText()}</Text>
        </Animated.View >
    )
}


