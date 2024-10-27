import React, { useRef, useEffect } from 'react'
import Divider from './Divider'
import localization from '../../utils/localizations'
import { ColorsInterface } from '../../assets/Colors'
import { useDispatch, useSelector } from 'react-redux'
import { Animated, Keyboard, Text, TouchableHighlight, View } from 'react-native'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { animateAnimatableValue } from '../functions'
import { TextStylesInterface } from '../styles/TextStyles'


interface EmojiAlertInterface {
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/** 
 * Shows / Hides itself with an animation.
*/
export function EmojiAlert({ COLORS, TEXT_STYLES }: EmojiAlertInterface) {

    const dispatch = useDispatch()
    const emojiAlert = useSelector(selectUiStates).emojiAlert

    return (
        <AlertUi
            title={localization.emojis_forbidden_on_AtSight}
            description={localization.if_you_want_to_use_emojis}
            show={emojiAlert}
            onPress={(index) => {
                let updateUiStateValuePayload: updateUiStateValuePayload = { attribute: "emojiAlert", value: false }
                dispatch(updateUiStateValue(updateUiStateValuePayload))
            }}
            bottom_description={localization.usual_emojis}
            COLORS={COLORS}
            TEXT_STYLES={TEXT_STYLES}
        />
    )
}


interface AlertUiInterface {
    title: string
    description: string
    show: boolean
    onPress: (index: number) => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    bottom_description?: string
}
export default function AlertUi({
    title,
    description,
    show,
    onPress,
    COLORS,
    TEXT_STYLES,
    bottom_description,
}: AlertUiInterface) {


    const opacity = useRef(new Animated.Value(0)).current // 0 - 1 
    const bgOpacity = useRef(new Animated.Value(0)).current // 0 - 0.7
    const animatedSize = useRef(new Animated.Value(1.1)).current  // 1.1 - 1


    useEffect(() => {
        if (show) {
            showAlert()
        } else {
            hideAlert()
        }
        if (show) Keyboard.dismiss()
    }, [show])


    function showAlert() {
        animateAnimatableValue(opacity, 1, 170)
        animateAnimatableValue(bgOpacity, 0.7, 170)
        animateAnimatableValue(animatedSize, 1, 170)
    }
    function hideAlert() {
        animateAnimatableValue(opacity, 0, 0)
        animateAnimatableValue(bgOpacity, 0, 0)
        animateAnimatableValue(animatedSize, 1.1, 0)
    }


    if (show) {
        return (
            <View style={{ display: "flex", flexDirection: "column", top: 0, height: "100%", width: "100%", position: "absolute", alignItems: "center", justifyContent: "center", zIndex: 70 }}>

                <Animated.View style={{ height: "100%", width: "100%", backgroundColor: "black", opacity: bgOpacity, position: "absolute", top: 0, zIndex: 71 }} />

                <Animated.View style={[{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.whiteToGray, borderRadius: 12, width: 270, zIndex: 72, opacity: opacity }, { transform: [{ scale: animatedSize }] }]}>

                    {/* Title + Description */}
                    <View style={{ paddingTop: 27, paddingBottom: 27, paddingLeft: 10, paddingRight: 10 }}>
                        <Text style={[TEXT_STYLES.headline, { color: COLORS.black, paddingLeft: 27, paddingRight: 27, textAlign: "center" }]}>{title}</Text>
                        <Text style={[TEXT_STYLES.gray13Text, { paddingTop: 6, textAlign: "center" }]}>{description}</Text>
                        {bottom_description &&
                            <Text style={{ fontSize: 19, color: COLORS.black, paddingLeft: 27, paddingRight: 27, textAlign: "center", paddingTop: 6, }}>{bottom_description}</Text>
                        }
                    </View>

                    <View style={{ width: "100%" }}>
                        <Divider COLORS={COLORS}/>
                    </View>


                    <TouchableHighlight
                        onPress={() => { onPress(0) }}
                        activeOpacity={0.9}
                        style={{ width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, }}
                    >
                        <View style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", justifyContent: "center", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingTop: 13, paddingBottom: 13, backgroundColor: COLORS.whiteToGray }} >
                            <Text style={[TEXT_STYLES.callout, { color: COLORS.black }]}>{localization.ok}</Text>
                        </View>
                    </TouchableHighlight>

                </Animated.View>
            </View>
        )
    } else {
        return null
    }
}

