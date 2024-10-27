//
//  ForContentEditors.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { View, Text, TextInput, Pressable, Platform, TouchableHighlight } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import SectionAppearance from './SectionAppearance'
import DateTimePicker from '@react-native-community/datetimepicker'
import TextAndDescription from './TextAndDescription'
import localization from '../../utils/localizations'
import { ColorsInterface } from './../../assets/Colors'
import { InformationType, getInfoMetada } from '../../Types'
import { ChevronSymbol } from '../Symbols'
import { ImageInputButton } from '../Buttons'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { getUserPreferredLocale } from './../../assets/LanguagesList'
import { LocalizedText } from '../../Data'
import { InfoSymbol } from './InfoDisplay'
import { handleTextAndPreventEmojis } from '../functions'
import { useDispatch } from 'react-redux'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()
import localizedFormat from "dayjs/plugin/localizedFormat"
dayjs.extend(localizedFormat) // enables using formats like 'LT' e.g. : dayjs().format('L LT')
import utc from "dayjs/plugin/utc"
import { TextStylesInterface } from '../styles/TextStyles'
dayjs.extend(utc) // enables utc related functions
// https://day.js.org/docs/en/plugin/utc





// Styles types section : / withName 
/** Section : Wraps the InfoInput into a block with a white background and the name text at its top left corner in small gray.
   With name : Wraps the InfoInput into a row with the name text at its left.
 */
export type InfoInputStyle = 'section' | 'with_name' | 'with_symbol' | 'none'





interface InfoInputInterface {
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    text: string
    setText: (_: string) => any
    style: InfoInputStyle
    infoType: InformationType
    editedInfoType: InformationType
    setEditedInfoType: any
    doneReturnKey: boolean
    multiline?: boolean
    customPlaceholder?: string
    onSubmitEditing?: any
    height?: number
    autoCapitalize?: any
    focusOnAppear?: boolean
    autoCorrect?: boolean
    focusDelay?: number
    phoneKeyboard?: boolean
    displayInRed?: boolean
}
export function InfoInput({
    COLORS,
    TEXT_STYLES,
    text,
    setText,
    style,
    infoType,
    editedInfoType,
    setEditedInfoType,
    doneReturnKey = false,
    multiline = false,
    customPlaceholder = '',
    onSubmitEditing, height = undefined,
    autoCapitalize = "none",
    focusOnAppear = false,
    autoCorrect = true,
    focusDelay = 580,
    phoneKeyboard = false,
    displayInRed = false
}: InfoInputInterface) {

    // States
    const [keyboardShown, setKeyboardShown] = useState(false)


    // Values 
    const dispatch = useDispatch()
    let infoMetada = getInfoMetada(infoType)
    let placeholder = customPlaceholder !== '' ? customPlaceholder : infoMetada?.placeholder ?? 'Value'
    const textInputRef = useRef("textInput")


    // Initialization
    useEffect(() => {

        setTimeout(() => {
            if (keyboardShown || !focusOnAppear) return // Avoids showing keyboard once modal disappeared
            (textInputRef.current as any).focus()
            setKeyboardShown(true)
        }, focusDelay)

    }, [])



    // InfoInput UI (Without any style)
    let textInput =
        <TextInput
            ref={textInputRef as any}
            onFocus={() => { setEditedInfoType(infoType) }}
            onEndEditing={() => {
                if (editedInfoType === infoType) {
                    setEditedInfoType(null)
                }
            }}
            style={[
                TEXT_STYLES.medium15, {
                    color: COLORS.black,
                    height: multiline && typeof height === 'number' ? height : style !== "with_symbol" ? 60 : 56,
                    width: '100%',  // Does sort of that not only the textinput's placeholder is tappable.
                    flexShrink: 1,  // flexShrink: 1 makes the text clipped inside the gray capsule + (on iOS makes the clearButton visible)
                }]}
            value={text}
            onChangeText={string => { handleTextAndPreventEmojis(string, setText, dispatch) }}
            placeholder={placeholder}
            placeholderTextColor={displayInRed ? COLORS.red : COLORS.placeholderGray}
            returnKeyType={doneReturnKey ? "done" : "default"}
            clearButtonMode="always" // iOS only 
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            onSubmitEditing={onSubmitEditing}
            keyboardType={phoneKeyboard ? "phone-pad" : "default"}
        />



    return (
        (() => {
            switch (style) {
                case 'section': return (
                    <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={placeholder} children={
                        <View style={{ paddingLeft: 20, paddingRight: 16 - 5, backgroundColor: COLORS.whiteToGray2 }} >
                            {textInput}
                        </View>
                    } />


                )
                case 'with_name': return (
                    <View style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        backgroundColor: COLORS.whiteToGray2,
                        paddingRight: 16 - 5,
                    }}>


                        <View style={{
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            width: 110,
                            paddingRight: 12,
                            paddingLeft: 20,
                        }}>
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}
                                style={[TEXT_STYLES.calloutMedium, { color: displayInRed ? COLORS.red : COLORS.black }]}
                            >{infoMetada?.name ?? localization.value}</Text>
                        </View>


                        {textInput}


                    </View>
                )
                case 'with_symbol':
                    return (
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: "flex-start",
                            paddingLeft: 20,
                            backgroundColor: COLORS.whiteToGray2,
                            paddingRight: Platform.OS ? 16 - 5 : 20, // clear button on iOS
                        }}>

                            <View style={{ width: 30, height: 30, marginRight: 20, alignItems: "center", justifyContent: "center" }}>
                                <InfoSymbol COLORS={COLORS} infoType={infoType} color={displayInRed ? COLORS.red : undefined} />
                            </View>

                            {textInput}

                        </View>
                    )
                default: return textInput
            }
        })()
    )

}





interface InfoInputFieldAsButtonInterface {
    infoType: InformationType
    infoValue: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    infoDescription?: string
    customPlaceholder?: any
    onPress: any
}
/** An InfoInput with its name that behaves as a button : opens a view when touched rather than changing text. 
    + Has the ability to display a description under the black value.
*/
export function InfoInputWithNameAsButton({ infoType, infoValue, COLORS, TEXT_STYLES, infoDescription = '', customPlaceholder, onPress }: InfoInputFieldAsButtonInterface) {

    let infoMetada = getInfoMetada(infoType)

    return (
        <View
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: COLORS.whiteToGray2,
                paddingRight: 20,
            }}>


            {/* Name */}
            <View
                style={{
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: 110,
                    paddingRight: 12,
                    paddingLeft: 20,
                }}>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    style={[TEXT_STYLES.calloutMedium, { color: COLORS.black }]}
                >{infoMetada?.name ?? ""}</Text>
            </View>



            <Pressable
                onPress={onPress}
                style={{
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flex: 1,
                    paddingRight: 12,
                    paddingVertical: 20
                }}>


                <TextAndDescription
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    text={infoValue ? infoValue : (customPlaceholder ?? '' !== '' ? customPlaceholder : infoMetada.placeholder)}
                    description={infoDescription}
                    textColor={infoValue ? COLORS.black : COLORS.placeholderGray}
                />


            </Pressable>
        </View>
    )
}






// NEW 
interface InfoInputButtonInterface {
    infoType: InformationType
    description?: string
    infoValue: string
    customPlaceholder?: any
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
export function InfoInputButton({ infoType, description, infoValue, customPlaceholder, onPress, COLORS, TEXT_STYLES }: InfoInputButtonInterface) {

    let infoMetada = getInfoMetada(infoType)
    let hasAValue = infoValue !== ""

    return (
        <TouchableHighlight
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: COLORS.whiteToGray2,
                    paddingHorizontal: 20,
                    height: 56,
                }}>


                <View style={{ width: 30, height: 30, marginRight: 20, alignItems: "center", justifyContent: "center" }}>
                    <InfoSymbol COLORS={COLORS} infoType={infoType} />
                </View>

                <View
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "flex-start",
                        flexDirection: "column",
                        justifyContent: 'center',
                        paddingRight: 12,
                    }}>
                    {((description ?? "") !== "") &&
                        <Text style={[TEXT_STYLES.gray12Text, { marginBottom: 3 }]}>{description}</Text>
                    }
                    <Text numberOfLines={1} style={[TEXT_STYLES.medium15, { color: COLORS.black }]}>{hasAValue ? infoValue : (customPlaceholder ?? '' !== '' ? customPlaceholder : infoMetada.placeholder)}</Text>
                </View>

                <ChevronSymbol />

            </View>
        </TouchableHighlight>
    )
}







interface SelectionFieldInterface {
    textWhenNoSelection: string
    text: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    description?: string
    onPress: () => any
}
/**
 *  A view that displays a selection if any and that behaves as a button : opens a view when touched.
 *  - Able to display a text and its description as the selection
*/
export function SelectionField({ textWhenNoSelection, text, COLORS, TEXT_STYLES, description = "", onPress }: SelectionFieldInterface) {
    return (
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: COLORS.whiteToGray2,
            paddingRight: 20,
        }}>


            <Pressable
                onPress={onPress}
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 1,
                    paddingRight: 12,
                    paddingVertical: 20,
                    paddingLeft: 20,
                }}>


                <TextAndDescription
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    text={text ? text : textWhenNoSelection}
                    description={text ? description : ''}
                />

            </Pressable>


            <ChevronSymbol />

        </View>
    )
}







interface TimePickerInterface {
    text: string
    date: Date
    setDate: (_: Date) => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/** 
 * Displays a title and a time that the user can modify via native time pickers 
 */
export function TimePickerField({ text, date, setDate, COLORS, TEXT_STYLES }: TimePickerInterface) {

    // Values
    const userLocale = getUserPreferredLocale()


    async function openAndroidTimerPricker() {
        try {
            DateTimePickerAndroid.open({
                value: date,
                mode: 'time',
                onChange: (event, date) => {
                    date.setSeconds(0, 0)
                    setDate(date)
                },

            })


        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }

    }


    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 20,
            backgroundColor: COLORS.whiteToGray2,
        }}>
            <View style={{
                flex: 1,
                alignSelf: 'center',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                paddingRight: 35,
                paddingVertical: 20 // Applied on the text rather than the Time picker 
            }}>
                <Text style={[
                    TEXT_STYLES.calloutMedium, {
                        color: COLORS.black,
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                    }]}>{text}</Text>
            </View>





            {Platform.OS === 'android' ?
                <Pressable
                    onPress={() => { openAndroidTimerPricker() }}
                    style={{
                        height: 34,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        backgroundColor: COLORS.lightGray,
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{
                        fontSize: 16,
                        color: COLORS.black

                        // On android there is an issue with dates : 12:00AM is 12:00PM and vice versa

                    }}>{dayjs(date).locale(userLocale.split("-")[0]).format("LT")}</Text>
                </Pressable>

                :

                <DateTimePicker
                    value={date}
                    style={{ width: 90 }}
                    onChange={(event, date) => {
                        date.setUTCSeconds(0, 0)
                        setDate(date)
                    }}
                    locale={userLocale.split("-")[0]}
                    mode='time'
                    textColor='black'
                    accentColor='black'
                    display='default'
                />
            }



        </View >
    )
}





interface LargePhotoAndDescriptionFieldInterface {
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    photo_uri: string
    onPress: () => any
    placeholder: string
    description: LocalizedText
    onPressWriteInOtherLanguage: () => any
    languages: string[]
    //
    paddingHorizontal?: number
    paddingTop?: number
    paddingBottom?: number
    displayPhotoInputInRed?: boolean
}
export function LargePhotoAndDescriptionField({ COLORS, TEXT_STYLES, photo_uri, onPress, placeholder, description, onPressWriteInOtherLanguage, languages = [], paddingHorizontal = 20, paddingTop = 20, paddingBottom = 10, displayPhotoInputInRed = false }: LargePhotoAndDescriptionFieldInterface) {


    // Values 
    const hasADescription = (description?.text ?? "") !== ""


    return (
        <View
            style={{
                flex: 1,
                display: "flex",
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                paddingHorizontal: paddingHorizontal,
                paddingTop: paddingTop,
                paddingBottom: paddingBottom
            }}
        >


            <ImageInputButton
                COLORS={COLORS}
                uri={photo_uri}
                onPress={onPress}
                displayPhotoInputInRed={displayPhotoInputInRed}
            />


            {/* Description */}
            <Pressable
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    paddingLeft: paddingHorizontal,
                    height: "100%",
                }}
                onPress={() => { onPressWriteInOtherLanguage() }}
            >

                <View
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                    }}
                >
                    <Text style={[TEXT_STYLES.gray12Text, { marginTop: 8 }]}>{localization.description}</Text>
                    <Text numberOfLines={3} style={[{ color: hasADescription ? COLORS.black : COLORS.placeholderGray, marginTop: 7, fontSize: 17.5, fontWeight: "500", }]}>{hasADescription ? description.text : placeholder}</Text>
                </View>

                {/* Write in other language */}
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", height: 20 }}>
                    <Text></Text>
                    <Text numberOfLines={1} style={[TEXT_STYLES.gray12Text]}>{`${languages.join(", ")}`}</Text>
                </View>

            </Pressable>
        </View>
    )
}




