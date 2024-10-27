//
//  BottomSheetRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import SelectedCircle from './ui/SelectedCircle';
import TextAndDescription from './ui/TextAndDescription';
import { ColorsInterface } from './../assets/Colors';
import { StyleSheet, View, Pressable, PanResponder, Animated, TouchableOpacity, BackHandler } from 'react-native'
import { easing } from './animations';
import { ChevronSymbol } from './Symbols';
import { ClassicHeader } from './Headers';
import { HeaderCloseButtonType } from '../Types';
import { TextStylesInterface } from './styles/TextStyles';



// (NEW)
interface BottomSheetInterface {
    headerText: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    header?: any // Custom header 
    headerHeight?: number // Height the custom header 
    show: boolean
    setShow: any
    bottom_inset: number
    content_height: number
    content: any
    backgroundColor?: string 
    textColor?: string 
}
export function BottomSheet({ headerText, COLORS, TEXT_STYLES, header, headerHeight = 44.5, show, setShow, bottom_inset, content_height, content, backgroundColor = COLORS.whiteToGray, textColor = COLORS.black }: BottomSheetInterface) {


    // Props values 
    const SAFE_AREA_AND_SPACE = 60 + bottom_inset
    const SPACE_TO_HIDE_BACKGROUND = 300
    const SHEET_HEIGHT = 12 + 4 + 12 + headerHeight + StyleSheet.hairlineWidth + content_height + SAFE_AREA_AND_SPACE



    // States
    const [isShown, setIsShown] = useState(true)
    const toDragAmount = useRef(new Animated.Value(0)).current  // From 0 to 0.7 (appears) then 0.7 to 0 (disappears, when scrolling)  --> 0 : no black background / 0.7: black background
    const pan = useRef(new Animated.ValueXY({ x: 0, y: SHEET_HEIGHT })).current
    // The following values are modifiable and readable inside the pan responder others like const [_, set_] = useState() are not
    let prevPan = 0  // 
    let draggedEnought = false // 

     


    // Initialization (Hides it) + handling hide/show
    useEffect(() => {
        switch (show) {
            case true: showBottomSheet(); break
            case false: hideBottomSheet(); break
            default: return
        }
    }, [show])







    // Pan gesture 
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (event, gestureState) => isDraggedEnought(gestureState),
            // Ok
            onPanResponderGrant: () => {
                pan.setOffset({
                    y: pan.y._value - prevPan // Does equivalent of pan.flattenOffset() 
                })
            },
            onPanResponderMove: (event, gestureState) => {
                let vy = gestureState.vy
                let dy = gestureState.dy



                if (dy > 0) {
                    let draggedAmount = dy / (SHEET_HEIGHT + SHEET_HEIGHT * 0.3) // Stange that 1/3 more is needed to work properly
                    toDragAmount.setValue(0.7 * 1 - draggedAmount)
                } else {
                    draggedEnought = false // Canceled  
                }


                if (vy > 0.7) {
                    draggedEnought = true
                }



                pan.y.setValue(dy >= 0 ? dy : dy * 0.2) // If the user tries to push it in the wrong direction (bottom from top), it indicates it by working less. 
            },
            onPanResponderRelease: (event, gestureState) => {
                prevPan = pan.y._value // Used to do the equivalent of pan.flattenOffset() as it does not works because it gets changed 


                if (draggedEnought) { hideBottomSheet() } // Dragged quickly and a little (Young people mostly)
                else if (gestureState.dy >= SHEET_HEIGHT / 2) { hideBottomSheet() } // Dragged super slowly up to 50% of the sheet's height
                else { resetBottomSheet() }


            },
        })
    ).current


    // Makes the buttons inside the panResponder tappable has tapping them slightly was moving the panResponder.
    const isDraggedEnought = ({ moveX, moveY, dx, dy }) => {
        const draggedDown = dy > 7
        const draggedUp = dy < -7

        prevPan = pan.y._value // Used to do the equivalent of pan.flattenOffset() as it does not works because it gets changed
        // This corrects an issue at the begining --> the initialization of the const pan = useRef(new Animated.ValueXY({ x: 0, y: SHEET_HEIGHT })).current 
        // with a y of SHEET_HEIGHT creates a gap of SHEET_HEIGHT y which does like if the person had already swiped
        // which needs to be cleared, with something like above.
    
        return (draggedDown || draggedUp)
    }



    function showBottomSheet() {
        animateVariable(pan.y, 0)  // Bottom sheet
        animateVariable(toDragAmount, 0.7)  // Background opacity
        setIsShown(true)
    }


    // Success
    const [backHandler, setBackHandler]: [any, any] = useState()
    function hideBottomSheet(withoutAnimation = false) {
        let duration = withoutAnimation ? 0 : 260

        if (backHandler !== undefined) backHandler?.remove()

        // Bottom sheet
        animateVariable(pan.y, SHEET_HEIGHT + 0, duration) // + 10 for security otherwise we see it a little for instance son iPhone 13 without this
        // Background opacity
        animateVariable(toDragAmount, 0, duration)
        draggedEnought = false
        setIsShown(false)
        setShow(false) // Resets the value outside of the bottom sheet 

    }


    // Failure
    function resetBottomSheet() {
        animateVariable(pan.y, 0)  // Bottom sheet
        animateVariable(toDragAmount, 0.7) // Background opacity
    }


    function animateVariable(variableToEdit, value, duration = 260) {
        Animated.timing(variableToEdit, {
            toValue: value,
            useNativeDriver: true,
            duration: duration,
            easing: easing
        }).start()
    }







    // Go back support for Android
    useEffect(() => {

        if (show) {
            // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
            const handler = BackHandler.addEventListener("hardwareBackPress", () => {
                // Prepare for potential overwritte
                hideBottomSheet()
                handler.remove()
                return true // Indicates that has overwritten the back action
            })
            setBackHandler(handler)
        }

    }, [show])






    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                position: 'absolute'
            }}
            pointerEvents={'box-none'} >


            {/* Gray background */}
            <Pressable onPress={() => { hideBottomSheet() }} style={{ height: '100%', width: '100%', position: 'absolute' }} pointerEvents={isShown ? 'auto' : 'box-none'} >
                <Animated.View
                    pointerEvents={'box-none'}
                    style={{
                        backgroundColor: 'black',
                        opacity: toDragAmount,
                        width: '100%',
                        height: '100%',
                        position: 'absolute'
                    }} />
            </Pressable>


            <Animated.View style={{
                backgroundColor: backgroundColor,
                width: '100%',
                position: 'absolute',
                bottom: 0 - SPACE_TO_HIDE_BACKGROUND,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: SAFE_AREA_AND_SPACE + SPACE_TO_HIDE_BACKGROUND,
                alignItems: 'center',
                transform: [{ translateY: pan.y }] // Gesture
            }}
                {...panResponder.panHandlers} // Handles Gesture
            >
                <GrayCapsule backgroundColor={COLORS.capsuleGray}/>
                {header !== undefined ?
                    header
                    :
                    <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                        onClose={() => { }}
                        closeButtonType={"" as HeaderCloseButtonType}
                        headerText={headerText}
                        makeTextFit={true}
                        backgroundColor={backgroundColor}
                        textColor={textColor}
                        dividerColor={textColor}
                    />
                }
                {content}
            </Animated.View>


        </View>
    )
}



// (NEW)
export function GrayCapsule({ backgroundColor }: { backgroundColor }) {
    return (
        <View style={{
            width: '11%',
            height: 4,
            backgroundColor: backgroundColor, // colors.capsuleGray,
            marginVertical: 12,
            borderRadius: 200
        }} />
    )
}





// (NEW)
type BottomSheetButtonStyle = "chevron_right_style" | "selected_circle_style"
interface BottomSheetButtonInterface {
    text: string
    onPress: () => any 
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    description?: string
    style?: BottomSheetButtonStyle
    isSelected?: boolean
}
export function BottomSheetButton({ text, onPress, COLORS, TEXT_STYLES, description, style, isSelected }: BottomSheetButtonInterface) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={1}
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
            }}>


            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    height: 60,
                    width: '100%',
                }}>
                <View style={{ marginHorizontal: 20 }}>
                    <TextAndDescription
                        text={text}
                        description={description}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                    />
                </View>


                {style === 'selected_circle_style' &&
                    <View style={{ paddingRight: 20 }}>
                        <SelectedCircle isSelected={isSelected} COLORS={COLORS}/>
                    </View>
                }


                {style === 'chevron_right_style' &&
                    <View style={{ paddingRight: 20 }}>
                        <ChevronSymbol />
                    </View>
                }


            </View>

        </TouchableOpacity>
    )
}

