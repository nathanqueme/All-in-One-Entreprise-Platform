//
//  Buttons.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState } from 'react'
import { TouchableHighlight, TouchableOpacity, Pressable, Text, View, ActivityIndicator, Image, LayoutChangeEvent, Keyboard } from 'react-native'
import Divider from './ui/Divider'
import VerticalDivider from './ui/VerticalDivider'
import HeaderButtonsStyling from './styles/HeaderButtonsStyling'
import ButtonForAddingContent from './ui/ButtonForAddingContent'
import localization from '../utils/localizations'
import { ColorsInterface } from './../assets/Colors'
import { HeaderCloseButtonType, HeaderButtonType, ProfileButtonType, ContentType, SettingsInfo, getSettingsInfoDescription } from '../Types'
import { EllipsisSymbol, XMarkSymbol, InfoCircleSymbol, PlusSquareSymbol, WebsiteSymbol, ChevronSymbol, QRCodeSymbol, SettingsSymbol, ReloadSymbol, TextSymbol, PhoneSymbol, PhotoSymbol, AnalyticsSymbol } from './Symbols'
import { ProfileButtonUiMetadataObj } from '../Data'
import { ArrowUpRight, PdfSymbol, MapSymbol, ChevronLeftSymbol, LogOut } from './Symbols'
import { TextTapGesturesFacilitator } from './TapGesturesFacilitators'
import { TextStylesInterface } from './styles/TextStyles'






export interface ClassicButtonInterface {
    onPress: () => any
    text: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    symbol?: any
    topMargin?: number
    bottomMargin?: number
    horizontalMargin?: number
    backgroundColor?: string
    textColor?: string
    condition?: boolean
    isLoading?: boolean
    smallAppearance?: boolean
    displayABorder?: boolean
}
/** A large rounded button with the possibility to have a condition and a loader.
   -> Used to open pages in the account creation pages.
*/
export function ClassicButton({
    onPress,
    text,
    COLORS,
    TEXT_STYLES,
    symbol = undefined,
    topMargin = 0,
    bottomMargin = 0,
    horizontalMargin = 0,
    backgroundColor = COLORS.lightGray,
    textColor = COLORS.black,
    condition = true,
    isLoading = false,
    smallAppearance = false,
    displayABorder = false,
}: ClassicButtonInterface) {


    // Values 
    const borderRadius = smallAppearance ? 7 : 12
    const height = smallAppearance ? 32 : 44
    const textFont = smallAppearance ? TEXT_STYLES.calloutMedium : { fontSize: 17, fontWeight: "500" }


    return (
        <TouchableHighlight
            onPress={onPress}
            disabled={!condition || isLoading}
            style={{
                alignItems: 'stretch',
                justifyContent: "center",
                marginTop: topMargin,
                marginBottom: bottomMargin,
                marginHorizontal: horizontalMargin,
                borderRadius: borderRadius,
            }}>
            <View
                style={{
                    width: smallAppearance ? undefined : "100%",
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: backgroundColor,
                    borderRadius: borderRadius,
                    height: height, // fixed height if the text gets scaled down to fit
                    opacity: condition ? 1 : 0.3,
                    // paddingHorizontal: smallAppearance ? 12 : undefined,
                    borderWidth: displayABorder ? 1 : 0,
                    borderColor: COLORS.capsuleGray
                }}>

                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    {(symbol) &&
                        <View style={{ marginRight: 0 }}>
                            {symbol}
                        </View>
                    }

                    <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        style={Object.assign({}, textFont, {
                            paddingHorizontal: 12,
                            color: textColor,
                            opacity: isLoading ? 0 : (condition ? 1 : 0.7),
                        }) as any}>{text}</Text>

                </View>

                {isLoading &&
                    <View style={{ position: 'absolute' }}>
                        <ActivityIndicator color={textColor} />
                    </View>
                }

            </View>
        </TouchableHighlight>
    )
}



interface HeaderCloseButtonInterface {
    onClose: any
    closeButtonType: HeaderCloseButtonType
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    disabled?: boolean
    color?: string
}
/**
 * A text or symbol button placed at the left of headers to close the view.
 */
export const HeaderCloseButton = ({ onClose, closeButtonType, COLORS, TEXT_STYLES, disabled = false, color = COLORS.black }: HeaderCloseButtonInterface) => {

    // States 
    const [width, setWidth] = useState(40)



    function determineTextDimensions(layoutEvent: LayoutChangeEvent) {
        let width = layoutEvent.nativeEvent.layout.width
        setWidth(width)
    }



    switch (closeButtonType) {
        case 'xmark': return (
            <Pressable onPress={onClose} disabled={disabled} >
                <XMarkSymbol color={color} COLORS={COLORS} />
            </Pressable>
        )
        case 'cancelText': return (
            <TouchableOpacity onPress={onClose} disabled={disabled} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[
                            TEXT_STYLES.calloutMedium, {
                                color: color
                            }
                        ]}>{localization.cancel}</Text>
                } />
            </TouchableOpacity>
        )
        case 'closeText': return (
            <TouchableOpacity onPress={onClose} disabled={disabled} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[
                            TEXT_STYLES.calloutMedium, {
                                color: color
                            }
                        ]}>{localization.close}</Text>
                } />
            </TouchableOpacity>
        )
        // 'chevronLeft' and others 
        default: return (
            <Pressable onPress={onClose} disabled={disabled} >
                <ChevronLeftSymbol COLORS={COLORS} color={color} />
            </Pressable>
        )
    }
}




interface HeaderButtonInterface {
    onPress: any
    buttonType: HeaderButtonType
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    condition?: boolean
    blueWhenTappable?: boolean
    color?: string
}
/**  A text or symbol button placed at the right of headers.
 */
export const HeaderButton = ({ onPress, buttonType, COLORS, TEXT_STYLES, condition = true, blueWhenTappable = false, color = COLORS.black }: HeaderButtonInterface) => {

    // States 
    const [width, setWidth] = useState(40)


    // Values 
    let buttonStylingSheet = HeaderButtonsStyling.getButtonStylingSheet(condition, blueWhenTappable, COLORS)
    let buttonColor = color === COLORS.black ? buttonStylingSheet.buttonColor : { color: color }


    function determineTextDimensions(layoutEvent: LayoutChangeEvent) {
        let width = layoutEvent.nativeEvent.layout.width
        setWidth(width)
    }



    switch (buttonType) {
        case 'addSymbol': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <PlusSquareSymbol color={color} COLORS={COLORS} />
            </TouchableOpacity>
        )
        case 'ellipsisSymbol': return (
            <Pressable onPress={onPress} disabled={!condition} style={{}} >
                <EllipsisSymbol color={color} COLORS={COLORS} />
            </Pressable>
        )
        case 'info': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <InfoCircleSymbol color={color} COLORS={COLORS} />
            </TouchableOpacity>
        )
        case 'phoneSymbol': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <PhoneSymbol color={color} size={23} COLORS={COLORS} />
            </TouchableOpacity>
        )
        case 'settings': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <SettingsSymbol color={color} COLORS={COLORS} />
            </TouchableOpacity>
        )
        case 'editText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[
                            TEXT_STYLES.calloutMedium,
                            buttonColor
                        ]
                        }>{localization.edit}</Text>
                } />
            </TouchableOpacity>
        )
        case 'sendText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.send}</Text>
                } />
            </TouchableOpacity>
        )
        case 'confirmText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.confirm}</Text>
                } />
            </TouchableOpacity>
        )
        case 'okText': return (
            <TouchableOpacity onPress={onPress} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, { color: COLORS.darkBlue }]}
                    >{localization.ok}</Text>
                } />
            </TouchableOpacity>
        )
        case 'deleteText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.delete}</Text>
                } />
            </TouchableOpacity>
        )
        case 'continueText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.continue}</Text>
                } />
            </TouchableOpacity>
        )
        case 'selectText': return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.select}</Text>
                } />
            </TouchableOpacity>
        )
        // Done and others 
        default: return (
            <TouchableOpacity onPress={onPress} disabled={!condition} >
                <TextTapGesturesFacilitator width={width} height={40} content={
                    <Text
                        onLayout={determineTextDimensions}
                        style={[TEXT_STYLES.calloutMedium, buttonColor]}
                    >{localization.done}</Text>
                } />
            </TouchableOpacity>
        )
    }
}



// NEW
// A rectangle image tappable or a button with a photo icon
interface ImageInputButtonInterface {
    uri: string
    onPress: () => any
    COLORS: ColorsInterface
    displayPhotoInputInRed?: boolean
}
export function ImageInputButton({ uri, onPress, COLORS, displayPhotoInputInRed }: ImageInputButtonInterface) {

    /**
    const WIDTH = 86
    const HEIGHT = 106
    */
    const WIDTH = 88
    const HEIGHT = 114

    return (
        <TouchableHighlight onPress={() => { Keyboard.dismiss(); onPress() }} activeOpacity={1}>
            {(uri !== "") ?
                <Image
                    style={{ resizeMode: 'cover', width: WIDTH, height: HEIGHT }}
                    source={{ uri: uri }}
                /> :
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: "center",
                        width: WIDTH,
                        height: HEIGHT,
                        borderColor: displayPhotoInputInRed ? COLORS.red : '#DDDCDD',
                        borderWidth: 0.75,
                        backgroundColor: COLORS.whiteToGray,
                    }}>
                    <PhotoSymbol size={35} COLORS={COLORS} color={displayPhotoInputInRed ? COLORS.red : COLORS.black} />
                </View>
            }

        </TouchableHighlight>
    )
}



interface FileImporterButtonInterface {
    uri: string
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    contentType?: ContentType
    backgroundColor?: string
}
/**  
 * A square used to open the native file pickers. Displays an image of the file if any. (image of the photo or screen shot of the pdf)
 */
export function FileImporterButton({ uri, onPress, COLORS, TEXT_STYLES, contentType = "any", backgroundColor }: FileImporterButtonInterface) {
    if (uri !== "") {
        return (
            <TouchableHighlight onPress={onPress}>
                <Image
                    style={{ resizeMode: 'cover', width: 70, height: 70 }}
                    source={{ uri: uri }}
                />
            </TouchableHighlight>
        )
    } else {
        return (
            <TouchableHighlight onPress={onPress}>
                <ButtonForAddingContent widthAndHeight={70} contentType={contentType} backgroundColor={backgroundColor} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>
            </TouchableHighlight>
        )
    }
}






interface SimpleCenteredButtonInterface {
    text: string
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    hideTopDivider?: boolean
    hideBottomDivider?: boolean
    destructiveColor?: boolean
    marginVertical?: number
    isLoading?: boolean
    backgroundColor?: string
}
/** 
   A view that displays a button with centered text between dividers at the top and the bottom and a white background. 
    - Dividers can be hidden.
    - The text is by default in blue but can be in red
*/
export function SimpleCenteredButton({ text, onPress, COLORS, TEXT_STYLES, hideTopDivider = false, hideBottomDivider = false, destructiveColor = false, marginVertical = 0, isLoading = false, backgroundColor = COLORS.whiteToGray2 }: SimpleCenteredButtonInterface) {
    return (

        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
        >
            <View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: backgroundColor,
                    marginVertical: marginVertical
                }}
            >
                <View style={{ width: '100%', opacity: hideTopDivider ? 0 : 1 }}>
                    <Divider COLORS={COLORS} />
                </View>

                <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <Text
                        style={[
                            TEXT_STYLES.calloutMedium, {
                                color: destructiveColor ? COLORS.red : COLORS.darkBlue,
                                marginVertical: 20,
                                marginHorizontal: 40,
                                textAlign: 'center',
                                opacity: isLoading ? 0 : 1
                            }]}
                    >{text}</Text>

                    <ActivityIndicator pointerEvents="none" style={{ position: "absolute", opacity: isLoading ? 1 : 0 }} />

                </View>

                <View style={{ width: '100%', opacity: hideBottomDivider ? 0 : 1 }}>
                    <Divider COLORS={COLORS} />
                </View>

            </View>
        </TouchableOpacity>

    )
}






interface EditButtonPushedToRightInterface {
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
export function EditButtonPushedToRight({ onPress, COLORS, TEXT_STYLES }: EditButtonPushedToRightInterface) {
    return (
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={onPress}>
                <Text
                    style={[
                        TEXT_STYLES.calloutMedium,
                        {
                            color: COLORS.darkBlue,
                            paddingHorizontal: 20,
                            paddingTop: 10
                        }
                    ]}
                >{localization.edit}</Text>
            </TouchableOpacity>
        </View>
    )
}





interface ProfileButtonsCapsuleInterface {
    buttons: ProfileButtonType[]
    onPress: (profile_button_type: ProfileButtonType) => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/** 
 * A large capsule with buttons on it and a gray rounded border.
 * Buttons have a symbol and text.
 */
export function ProfileButtonsCapsule({ buttons, onPress, COLORS, TEXT_STYLES }: ProfileButtonsCapsuleInterface) {
    return (
        <View style={{
            flex: 1,
            height: 35, // When loading : blank 
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            backgroundColor: COLORS.softGray
            // borderColor: COLORS.capsuleGray,
            // borderWidth: 1.6
        }}>

            {(buttons.length === 0) &&
                <ProfileButton profileButtonType={'edit'} onPress={onPress} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>
            }

            {buttons.includes('map') &&
                <ProfileButton profileButtonType={'map'} onPress={onPress} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>
            }


            {buttons.includes('map') && buttons.includes('menu') ? <VerticalDivider COLORS={COLORS}/> : null}


            {buttons.includes('menu') &&
                <ProfileButton profileButtonType={'menu'} onPress={onPress} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>
            }


        </View>
    )
}






interface ProfileButtonInterface {
    profileButtonType: ProfileButtonType
    onPress: (_: ProfileButtonType) => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
export function ProfileButton({ profileButtonType, onPress, COLORS, TEXT_STYLES }: ProfileButtonInterface) {


    function getProfileButtonUiMetadata() {
        switch (profileButtonType) {
            case 'map': return ProfileButtonUiMetadataObj(localization.map, <MapSymbol size={18.5} COLORS={COLORS} />)
            case 'menu': return ProfileButtonUiMetadataObj(localization.menu, <PdfSymbol size={16.5} COLORS={COLORS} />)
            case 'edit': return ProfileButtonUiMetadataObj(localization.additional_options, <EllipsisSymbol COLORS={COLORS} />)
        }
    }


    const uiMetadata = getProfileButtonUiMetadata()


    return (
        <TouchableOpacity
            onPress={() => onPress(profileButtonType)}
            style={{
                flex: 1,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: "center",
                alignSelf: "center",
                flexDirection: "row",
            }}
        >


            <View style={{
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: "center",
                alignSelf: "center",
                marginHorizontal: 12,
                backgroundColor: COLORS.clear, // Needs this so that text is not clipped vertically
                marginLeft: 12 // Simulates the space of the symbol
            }}>

                {uiMetadata.symbol}

                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    style={[
                        TEXT_STYLES.medium15,
                        {
                            color: COLORS.black,
                            paddingLeft: 5, // Space
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignContent: "center",
                            alignSelf: "center",
                        }
                    ]}
                >{uiMetadata.title}</Text>
            </View>


        </TouchableOpacity>
    )
}




interface SquareProfileButtonInterface {
    profileButtonType: ProfileButtonType
    onPress: any
    COLORS: ColorsInterface
    loadingAppearance?: boolean
}
export function SquareProfileButton({ profileButtonType, onPress, COLORS, loadingAppearance = false }: SquareProfileButtonInterface) {
    return (
        <View style={{
            marginLeft: 7,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 7,
            backgroundColor: COLORS.softGray
            // Border 
            //borderColor: COLORS.capsuleGray,
            //borderWidth: 1.6,
        }}>

            <TouchableOpacity
                disabled={loadingAppearance}
                activeOpacity={1}
                onPress={() => { onPress('website' as ProfileButtonType) }}
                style={{ paddingHorizontal: 7 }}>
                {!loadingAppearance ?
                    (() => {
                        switch (profileButtonType) {
                            case 'website': return <WebsiteSymbol size={20} COLORS={COLORS} />
                            case 'edit': return <EllipsisSymbol COLORS={COLORS} />
                        }
                    })()
                    :
                    <View style={{ opacity: loadingAppearance ? 0 : 1 }}>
                        <EllipsisSymbol COLORS={COLORS} />
                    </View>
                }
            </TouchableOpacity >
        </View>
    )
}






interface TranslateTextButtonInterface {
    onPressTranslate: any
    onPressShowTranslation: any
    paddingTop?: number
    isTranslating: boolean
    isTranslated: boolean
    isDisplayingTranslation: boolean
    COLORS: ColorsInterface
}
export function TranslateTextButton({ onPressTranslate, onPressShowTranslation, paddingTop = 8, isTranslating, isTranslated, isDisplayingTranslation, COLORS }: TranslateTextButtonInterface) {
    return (
        <TouchableOpacity
            onPress={() => {

                if (isTranslating) return

                if (isTranslated) {
                    onPressShowTranslation()
                } else {
                    onPressTranslate()
                }

            }}>

            <View style={{ marginTop: paddingTop, justifyContent: "center", alignItems: "flex-start" }}>
                <TextTapGesturesFacilitator
                    width={90}
                    height={40}
                    content={

                        <Text style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color: COLORS.black
                        }}>{isTranslating ?
                            localization.translating : (isTranslated ? (isDisplayingTranslation ?
                                localization.show_original
                                :
                                localization.show_translation) :
                                localization.translate_text
                            )}</Text>

                    } />
            </View>

        </TouchableOpacity>
    )
}


















interface SettingsButtonInterface {
    settingsInfo: SettingsInfo
    onPress: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    isLoading?: boolean
}
export function SettingsButton({ settingsInfo, onPress, COLORS, TEXT_STYLES, isLoading = false }: SettingsButtonInterface) {
    return (
        <TouchableHighlight
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.9}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    height: 55,
                    backgroundColor: COLORS.whiteToGray2
                }}>
                <View style={{ flexDirection: 'row', paddingRight: 35, flex: 1, alignItems: "center", justifyContent: "flex-start" }}>


                    {
                        (() => {
                            switch (settingsInfo) {
                                case 'your_information':
                                case 'your_qr_code':
                                case 'settings':
                                case 'help':
                                case 'about':
                                case 'sign_out':
                                case 'analytics':
                                    return (
                                        <View style={{
                                            width: 42, // All symbols do not have the same width
                                            justifyContent: "center",
                                            alignItems: "flex-start"
                                        }} >
                                            <SettingsInfoSymbol COLORS={COLORS} settingsInfo={settingsInfo} />
                                        </View>
                                    )
                                default: return (null)
                            }
                        })()
                    }




                    <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        style={[TEXT_STYLES.calloutMedium, { color: COLORS.black }]}
                    >{getSettingsInfoDescription(settingsInfo)}</Text>
                </View>



                {isLoading ?
                    <ActivityIndicator />
                    :
                    <ChevronSymbol />
                }


            </View>
        </TouchableHighlight>
    )
}



export function SettingsInfoSymbol({ settingsInfo, COLORS }: { settingsInfo: SettingsInfo, COLORS: ColorsInterface }) {
    return (
        (() => {
            switch (settingsInfo) {
                case 'help': return <ArrowUpRight size={27} COLORS={COLORS} />
                case 'your_information': return <TextSymbol size={28} COLORS={COLORS} />
                case 'your_qr_code': return <QRCodeSymbol size={26} COLORS={COLORS} />
                case 'settings': return <SettingsSymbol size={23} COLORS={COLORS} />
                case 'about': return <InfoCircleSymbol COLORS={COLORS} />
                case 'sign_out': return <LogOut COLORS={COLORS} />
                case 'analytics': return <AnalyticsSymbol COLORS={COLORS} />
                default: return null
            }
        })()
    )
}



interface CapsuleButtonInterface {
    text: string
    onPress: () => any
    marginTop: number
    marginBottom: number
    marginHorizontal: number
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    isLoading?: boolean
}
/**
 * A button as a text and a rounded gray border around it. 
 * Displays an ActivityIndicator when is loading. 
 */
export function CapsuleButton({ text, onPress, marginTop, marginBottom, marginHorizontal, COLORS, TEXT_STYLES, isLoading }: CapsuleButtonInterface) {
    return (
        <TouchableHighlight
            onPress={() => { onPress() }}
            activeOpacity={0.9}
            style={{
                marginTop: marginTop,
                marginBottom: marginBottom,
                marginHorizontal: marginHorizontal,
                borderRadius: 6
            }}
        >
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderRadius: 6,
                    height: 40,
                    borderColor: COLORS.capsuleGray,
                    backgroundColor: COLORS.whiteToGray2
                }}>
                {isLoading ?
                    <ActivityIndicator />
                    :
                    <Text style={[TEXT_STYLES.calloutMedium, { color: COLORS.black }]}>{text}</Text>
                }
            </View>
        </TouchableHighlight>
    )
}






interface ReloadPageButtonInterface {
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    textColor?: string
}
export function ReloadPageButton({ onPress, COLORS, TEXT_STYLES, textColor = COLORS.black }: ReloadPageButtonInterface) {
    return (
        <TouchableOpacity
            onPress={() => { onPress() }} style={{
                paddingVertical: 30,
                justifyContent: "center",
                alignItems: "center"
            }}>


            <ReloadSymbol size={40} color={textColor} COLORS={COLORS} />


            <Text style={[TEXT_STYLES.medium14, { paddingTop: 15, color: textColor }]}>{localization.try_loading}</Text>
        </TouchableOpacity>
    )
}


