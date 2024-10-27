import React, { useState } from 'react'
import '../styles/MainStyles.css'
import colors from '../assets/Colors'
import ActivityIndicator from './ActivityIndicator'
import HeaderButtonsStyling from '../styles/HeaderButtonsStyling'
import { HeaderCloseButtonType, HeaderButtonType, SettingsInfo, getSettingsInfoDescription, ContentType, ProfileButtonType } from './../Types'
import localization from '../utils/localizations'
import { ChevronRight, XMarkIcon, ChevronLeftIcon, PlusSquareIcon, EllipsisIcon, InfoCircleIcon, ClockIcon, ArrowUpRightIcon, QrcodeIcon, SettingsIcon, LogOutIcon, PersonIcon, PhotoIcon, PdfIcon, PlusIcon, ChevronRightIcon, TextIcon, MapIcon, PhoneIcon, PencilIcon, AnalyticsIcon } from '../components/Icons'
import Colors from '../assets/Colors'
import TextStyles from '../styles/TextStyles'
import VerticalDivider from './VerticalDivider'
import { FileImporterOutput, FileImporterOutputObj, ProfileButtonUiMetadataObj } from '../Data'
import { Link } from 'react-router-dom'
import { getTopLevelDomain, isMobileHook } from './functions'
import Divider from './Divider'



const isMobile = isMobileHook()



interface ClassicButtonInterface {
    onClick: () => any
    text: string
    icon?: any
    marginTop?: number
    marginBottom?: number
    horizontalMargin?: number
    backgroundColor?: string
    textColor?: string
    condition?: boolean
    isLoading?: boolean
    smallAppearance?: boolean
    displayABorder?: boolean
    textStyle?: {}
    onlyUi?: boolean
}
/** A large rounded button with the possibility to have a condition and a loader.
   -> Used to open pages in the account creation pages.
*/
export function ClassicButton({
    onClick,
    text,
    icon: icon = undefined,
    marginTop = 0,
    marginBottom = 0,
    horizontalMargin = 0,
    backgroundColor = colors.lightGray,
    textColor = colors.black,
    condition = true,
    isLoading = false,
    smallAppearance = false,
    displayABorder = false,
    textStyle = undefined, // Used to overwrite the default text style
    onlyUi = false
}: ClassicButtonInterface) {


    // UI
    let ui =
        <div className={`flex ${smallAppearance ? "h-8 px-3 rounded" : "w-72 h-12 rounded-xl"} items-center justify-center`}
            style={{
                backgroundColor: backgroundColor,
                opacity: condition ? 1 : 0.3,
                borderWidth: displayABorder ? 1 : 0,
                marginTop: marginTop,
                marginBottom: marginBottom,
                marginInline: horizontalMargin
            }}>
            <div className='flex items-center justify-center' style={{ opacity: isLoading ? 0 : 1 }}>
                {(icon) &&
                    <div className={smallAppearance ? 'pr-1' : 'pr-3'}>
                        {icon}
                    </div>
                }
                {textStyle ?
                    <p style={textStyle}>{text}</p>
                    :
                    <p style={Object.assign({}, (smallAppearance ? TextStyles.medium15 : { fontSize: 17, fontWeight: "500" }), { color: textColor })}>{text}</p>
                }


            </div>
            {isLoading &&
                <div className='absolute'>
                    <ActivityIndicator color={textColor} widthAndHeight={smallAppearance ? 18 : undefined} />
                </div>
            }
        </div>


    if (onlyUi) {
        return (
            <div onClick={() => { onClick() }} className={condition && !isLoading ? 'active:brightness-95' : ''}>
                {ui}
            </div>
        )
    } else {
        return (
            <button disabled={!condition || isLoading} onClick={() => { onClick() }} className={condition && !isLoading ? 'active:brightness-95' : ''}>
                {ui}
            </button>
        )
    }
}





interface ChevronCircleButtonInterface {
    onClick: () => any
    leftDirection?: boolean
}
/**
 * A chevron in a gray circle. Used for showing content on the right or the left on large devices like desktops.
 * (Used on wide devices)
*/
export function GoLeftOrRightButton({ onClick, leftDirection = false }: ChevronCircleButtonInterface) {

    return (
        <div className={`bg-red-50 rounded-full active:brightness-90 shadow-md cursor-pointer`} style={{ backgroundColor: Colors.softGray, padding: 5 }} onClick={() => { onClick() }}>
            {leftDirection ?
                <ChevronLeftIcon size={"1.4em"} />
                :
                <ChevronRightIcon size={"1.4em"} />
            }
        </div>
    )
}





interface ButtonForAddingContentInterface {
    widthAndHeight: number
    contentType?: ContentType
    rounded?: boolean
    borderWidth?: number
    iconSize?: number
    hoverEffect?: boolean
}
export default function ButtonForAddingContent({ widthAndHeight, contentType = "any", rounded = false, borderWidth = 2, iconSize = undefined, hoverEffect = false }: ButtonForAddingContentInterface) {


    // Values
    let adaptiveIconSize = widthAndHeight / 40  // em


    return (
        <div
            className={`${rounded ? "rounded-full" : ""} ${hoverEffect && "hover:brightness-95"} flex items-center justify-center hover:brightness-95`}
            style={{
                backgroundColor: Colors.whiteToGray,
                width: widthAndHeight,
                height: widthAndHeight,
                borderWidth: borderWidth
            }}>
            {
                (() => {
                    switch (contentType) {
                        case "photo": return <PhotoIcon size={`${adaptiveIconSize}em`} color={Colors.smallGrayText} />
                        case "account_management": return <PersonIcon fontSize={16 * adaptiveIconSize} color={Colors.smallGrayText} />
                        case "pdf": return <div className='flex flex-col items-center'>
                            <PdfIcon size={`${adaptiveIconSize}em`} color={Colors.smallGrayText} />
                            <p className='gray13'>{"pdf"}</p>
                        </div>
                        default: return <PlusIcon size={iconSize ? `${iconSize}em` : `${adaptiveIconSize}em`} />
                    }
                })()
            }
        </div>
    )
}









interface HeaderCloseButtonInterface {
    onClose: () => any
    closeButtonType: HeaderCloseButtonType
    disabled?: boolean
    color?: string
}
/**
   A text or symbol button placed at the left of headers to close the view.
 */
export const HeaderCloseButton = ({ onClose, closeButtonType, disabled = false, color = colors.black }: HeaderCloseButtonInterface) => {


    // N.B.: some icons have extra padding so this is adjusted thanks to style={{ margin: "- ... px" }}

    switch (closeButtonType) {
        case 'xmark': return (
            <div role={"button"} style={{ margin: "-10px" }} onClick={() => { if (!disabled) onClose() }}>
                <XMarkIcon size='2.3em' color={color} />
            </div>
        )
        case 'cancelText': return (
            <div role={"button"} onClick={() => { if (!disabled) onClose() }} >
                <p className='hover:opacity-70' style={Object.assign({}, TextStyles.calloutMedium, { color: color })}>{localization.cancel}</p>
            </div>
        )
        case 'closeText': return (
            <div role={"button"} onClick={() => { if (!disabled) onClose() }} >
                <p className='hover:opacity-70' style={Object.assign({}, TextStyles.calloutMedium, { color: color })}>{localization.close}</p>
            </div>
        )
        // 'chevronLeft' and others 
        default: return (
            <div role={"button"} style={{ margin: "-9px" }} onClick={() => { if (!disabled) onClose() }} >
                <ChevronLeftIcon size='2.1em' color={color} />
            </div>
        )
    }
}





interface HeaderButtonInterface {
    onClick: any
    buttonType: HeaderButtonType
    condition?: boolean
    blueWhenTappable?: boolean
    color?: string
}
/** 
 * A text or symbol button placed at the right of headers.
*/
export const HeaderButton = ({ onClick, buttonType, condition = true, blueWhenTappable = false, color = colors.black }: HeaderButtonInterface) => {


    // Values 
    let buttonStylingSheet = HeaderButtonsStyling.getButtonStylingSheet(condition, blueWhenTappable)
    let buttonColor = color === colors.black ? buttonStylingSheet.buttonColor : { color: color }
    const className = condition ? 'hover:opacity-70' : ""


    switch (buttonType) {
        case 'xmark': return (
            <div role={"button"} style={{ margin: "-10px" }} onClick={() => { if (condition) onClick() }}>
                <XMarkIcon size='2.3em' color={color} />
            </div>
        )
        case 'settingsIcon': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }}>
                <SettingsIcon size={"1.5em"} />
            </div>
        )
        case 'addSymbol': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <PlusSquareIcon size='1.6em' color={color} />
            </div>
        )
        case 'ellipsisSymbol': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <EllipsisIcon fontSize={22} color={color} />
            </div>
        )
        case 'info': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <InfoCircleIcon color={color} />
            </div>
        )
        case 'pencilIcon': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <PencilIcon color={color} fontSize={23} />
            </div>
        )
        case 'phoneSymbol': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }}>
                <PhoneIcon color={color} fontSize={23} />
            </div>
        )
        case 'editText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.edit}</p>
            </div>
        )
        case 'sendText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.send}</p>
            </div>
        )
        case 'confirmText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.confirm}</p>
            </div>
        )
        case 'okText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.ok}</p>
            </div>
        )
        case 'deleteText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.delete}</p>
            </div>
        )
        case 'continueText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.continue}</p>
            </div>
        )
        case 'selectText': return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.select}</p>
            </div>
        )
        // Done and others 
        default: return (
            <div role={"button"} className={className} onClick={() => { if (condition) onClick() }} >
                <p style={Object.assign({}, TextStyles.calloutMedium, buttonColor)}>{localization.done}</p>
            </div>
        )
    }
}





interface SettingsButtonInterface {
    settingsInfo: SettingsInfo
    onClick: () => any
    isLoading?: boolean
    hideChevron?: boolean
    link?: string
}
/**
 * A cell with an icon (optionally), text and a chevronright icon or an "ActivityIndicator".
 * Can be a link or a button.
*/
export function SettingsButton({ settingsInfo, onClick, isLoading = false, hideChevron = false, link = undefined }: SettingsButtonInterface) {


    // Values 
    let hasALink = link !== ""


    return (
        <a href={link} onClick={() => { if (!isLoading) onClick() }} >
            <div className='flex justify-between items-center px-4 cursor-pointer hover:brightness-95 hover:bg-white' style={{ height: 55 }}>
                <div className='flex mr-6 items-center'>
                    {
                        (settingsInfo === 'your_account' || settingsInfo === 'your_qr_code' || settingsInfo === 'settings' || settingsInfo === 'help' || settingsInfo === "analytics" || settingsInfo === 'about' || settingsInfo === 'sign_out') &&
                        <div className='' style={{
                            width: 40 // All symbols do not have the same width
                        }} >
                            <SettingsInfoSymbol settingsInfo={settingsInfo} />
                        </div>
                    }
                    <p style={Object.assign({}, TextStyles.calloutMedium, { color: colors.black })}>{getSettingsInfoDescription(settingsInfo)}</p>
                </div>

                <div>
                    {isLoading ?
                        <ActivityIndicator />
                        :
                        !hideChevron && <ChevronRight />
                    }
                </div>
            </div>
        </a>
    )

}





export function SettingsInfoSymbol({ settingsInfo }: { settingsInfo: SettingsInfo }) {
    return (
        (() => {
            switch (settingsInfo) {
                case 'help': return <ArrowUpRightIcon size={"1.3em"} />
                case 'your_account': return <TextIcon fontSize={28} /> // Before was a person
                case 'your_qr_code': return <QrcodeIcon size={"1.7em"} />
                case 'settings': return <SettingsIcon size={"1.5em"} />
                case 'about': return <InfoCircleIcon size={"1.55em"} />
                case 'sign_out': return <LogOutIcon size={"1.7em"} />
                case 'analytics': return <AnalyticsIcon fontSize={25} />
                default: return null
            }
        })()
    )
}





interface CapsuleButtonInterface {
    text: string
    onClick: () => any
    link?: string
    marginTop: number
    marginBottom: number
    marginX: number
    isLoading?: boolean
}
/**
 * A button or a link as a text and a rounded gray border around it. 
 * Displays an ActivityIndicator when is loading. 
 */
export function CapsuleButton({ text, onClick, link, marginTop, marginBottom, marginX, isLoading }: CapsuleButtonInterface) {
    return (
        <a href={link}>
            <div className={`flex h-10 items-center justify-center border rounded-md hover:brightness-95 cursor-pointer bg-white ${marginX ? `mx-${marginX}` : ""} ${marginTop ? `mt-${marginTop}` : ""} ${marginBottom ? `mb-${marginBottom}` : ""}`}
                onClick={() => { onClick() }}
            >
                {isLoading ?
                    <ActivityIndicator color={"black"} widthAndHeight={24} />
                    :
                    <p style={Object.assign({}, TextStyles.calloutMedium, { color: colors.black })}>{text}</p>
                }
            </div>
        </a>
    )
}





interface SideTabButtonInterface {
    link: string
    text: string
    tabIsSelected: boolean
}
/**
 * (Not for devices) 
 * A button with text that opens the provided link. 
 * On hover is black and has a gray border at its left.
 * If selected has black border at its left.
 */
export function SideTabButton({ link, text, tabIsSelected }: SideTabButtonInterface) {

    // States 
    const [isOnHover, setIsOnHover] = useState(false)



    return (
        <a className='' href={link}>
            <div
                className={`w-64 px-4 py-3 active:opacity-60 ${tabIsSelected ? "border-black border-l-2" : "hover:bg-gray-100 border-l-2"}`}
                style={{ borderColor: (!isOnHover && !tabIsSelected) ? colors.clear : undefined }}
                onMouseOver={() => { setIsOnHover(true) }}
                onMouseLeave={() => { setIsOnHover(false) }}
            >
                <p style={Object.assign({}, tabIsSelected ? TextStyles.calloutBold : {}, { color: colors.black })}>{text}</p>
            </div>
        </a>
    )
}











interface ProfileButtonsCapsuleInterface {
    buttons: ProfileButtonType[]
    username: string
}
/** 
 * A large capsule with buttons on it and a gray rounded border.
 * Buttons have a symbol and text.
 */
export function ProfileButtonsCapsule({ buttons, username }: ProfileButtonsCapsuleInterface) {
    return (
        <div
            className='flex flex-1 items-center justify-center'
            style={{
                height: 35,  // When loading : blank 
                borderRadius: 7,
                backgroundColor: colors.softGray
                // BORDER
                // borderColor: colors.capsuleGray,
                // borderWidth: 1.6
            }}>

            {(buttons.length === 0) &&
                <ProfileButton profileButtonType={'edit'} username={username} />
            }

            {buttons.includes('map') &&
                <ProfileButton profileButtonType={'map'} username={username} />
            }

            {(buttons.includes('map') && buttons.includes('menu')) &&
                <VerticalDivider />
            }

            {buttons.includes('menu') &&
                <ProfileButton profileButtonType={'menu'} username={username} />
            }

        </div>
    )
}









interface ProfileButtonInterface {
    profileButtonType: ProfileButtonType
    username: string
}
/**
 * 
*/
export function ProfileButton({ profileButtonType, username }: ProfileButtonInterface) {


    function getProfileButtonUiMetadata() {
        switch (profileButtonType) {
            case 'map': return ProfileButtonUiMetadataObj(localization.map, <MapIcon size='1.1em' />)
            case 'menu': return ProfileButtonUiMetadataObj(localization.menu, <PdfIcon />)
            case 'edit': return ProfileButtonUiMetadataObj(localization.additional_options, <EllipsisIcon />)
        }
    }


    const uiMetadata = getProfileButtonUiMetadata()


    return (
        <Link
            to={`/${username}/${profileButtonType}${(isMobile) && "_options"}/`}
            className='flex flex-1 items-center justify-center w-max active:opacity-60'
            style={{
                height: 35,
            }}
        >
            <div className='flex items-center justify-center' style={{ marginLeft: 12, marginRight: 12 }}>
                {uiMetadata &&
                    uiMetadata.symbol
                }
                <p className='line-clamp-1' style={Object.assign({}, TextStyles.medium15, { color: colors.black, paddingLeft: 5, })}>{uiMetadata?.title ?? ""}</p>
            </div>
        </Link>
    )
}









interface SquareProfileButtonInterface {
    onClick: () => any
    loadingAppearance?: boolean
}
/**
 * A small button in with a rounded square border and an ellipsis icon.
*/
export function SquareProfileButton({ onClick, loadingAppearance = false }: SquareProfileButtonInterface) {
    return (
        <div
            role={"button"}
            onClick={onClick}
            className='flex items-center justify-center'
            style={{
                marginLeft: 7,
                height: 35,
                width: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 7,
                backgroundColor: colors.softGray
                // Border 
                // borderColor: colors.capsuleGray,
                // borderWidth: 1.6,
            }}>
            <div style={{ opacity: loadingAppearance ? 0 : 1 }}>
                <EllipsisIcon />
            </div>
        </div>
    )
}






interface SheetCloseButtonInterface {
    onClick: () => any
}
/**
 * An xmarck icon displayed at the top right of a sheet. 
 * Used on sheets for wide devices.
 */
export function SheetCloseButton({ onClick }: SheetCloseButtonInterface) {
    return (
        <div role={"button"} className='absolute right-0 top-0 z-50' style={{ marginTop: 20, marginRight: 20, marginBottom: 20, marginLeft: 20 }} onClick={onClick}>
            <XMarkIcon size='2em' color={Colors.white} />
        </div>

    )
}






/**
 * An image of AtSight's "AtSight" logo with the domain name at it's top right and that behaves has a link and opens the home screen.
 */
export function AtSightLogoButton() {


    // Values
    let logoWidth = 90
    let topLevelDomain = getTopLevelDomain(window.location.href)


    return (
        <a className=' unselectable flex items-center justify-center' href={"/"} unselectable={'on'}>
            <img alt='AtSight Icon' src={require("../assets/images/app_icon_260.png")} width={32} height={32} className={'pointer-events-none cursor-pointer shadow-sm bg-transparent'} style={{ marginRight: 7 }} />
            <img
                alt="AtSight"
                draggable={false}
                className='pointer-events-none cursor-pointer'
                src={require("../assets/images/AtSight_logo.png")}
                width={logoWidth}
                style={{ pointerEvents: "none", color: Colors.smallGrayText }}
            />
            <p className="font-medium uppercase mx-1 self-start" style={{ color: Colors.smallGrayText, fontSize: 10, marginTop: -2.5 }} >{topLevelDomain}</p>
        </a>

    )
}
















interface FileImporterButtonInterface {
    uri: string
    setOutput: (_: FileImporterOutput) => any
    contentType?: ContentType
    acceptedFiles: ".png, .jpg, .jpeg" | ".pdf"
}
/**  
 * A square used to open the native file pickers. Displays an image of the file if any. (image of the photo or screen shot of the pdf)
 */
export function FileImporterButton({ uri, setOutput, contentType = "any", acceptedFiles }: FileImporterButtonInterface) {
    return (
        <div className=''>
            <input
                className='overflow-hidden absolute pointer-events-none opacity-0' style={{ height: 0.1, width: 0.1 }} // Hidden input as it can not be styled 
                type="file"
                id="notStylableFileInput"
                onChange={(event) => {
                    // https://stackoverflow.com/a/43992687
                    if (event.target.files && event.target.files[0]) {
                        let uri = URL.createObjectURL(event.target.files[0])
                        setOutput(FileImporterOutputObj(event.target.files[0].size, uri))
                    }
                }}
                accept={acceptedFiles}
            />
            {/* Opens file selector on click */}
            <div className='relative'>
                <label htmlFor="notStylableFileInput" className='cursor-pointer'>
                    {(uri !== "") ?
                        <img src={uri} alt="" className={`align-middle object-cover`} style={{ width: 70, height: 70, pointerEvents: "none" }} />
                        :
                        <ButtonForAddingContent widthAndHeight={70} contentType={contentType} />
                    }
                </label>
            </div>
        </div>
    )

}






interface SimpleCenteredButtonInterface {
    text: string
    onClick: () => any
    hideTopDivider?: boolean
    hideBottomDivider?: boolean
    destructiveColor?: boolean
    marginVertical?: number
    isLoading?: boolean
}
/** 
   A view that displays a button with centered text between dividers at the top and the bottom and a white background. 
    - Dividers can be hidden.
    - The text is by default in blue but can be in red
*/
export function SimpleCenteredButton({ text, onClick, hideTopDivider = false, hideBottomDivider = false, destructiveColor = false, marginVertical = 0, isLoading = false }: SimpleCenteredButtonInterface) {
    return (
        <div role={"button"} className={`flex flex-col items-center justify-center ${isLoading ? "" : "active:opacity-60"}`} onClick={() => { if (!isLoading) onClick() }} style={{ backgroundColor: colors.whiteToGray2, marginBottom: marginVertical, marginTop: marginVertical }}>
            <div style={{ width: '100%', opacity: hideTopDivider ? 0 : 1 }}>
                <Divider />
            </div>

            <div className='flex items-center justify-center w-screen'>
                <p
                    className='text-center'
                    style={Object.assign({}, TextStyles.calloutMedium, {
                        color: destructiveColor ? colors.red : colors.darkBlue,
                        marginLeft: 40,
                        marginRight: 40,
                        marginBottom: 20,
                        marginTop: 20,
                        opacity: isLoading ? 0 : 1
                    })}
                >{text}</p>

                <div className='' style={{ position: "absolute", opacity: isLoading ? 1 : 0 }}>
                    <ActivityIndicator />
                </div>
            </div>

            <div style={{ width: '100%', opacity: hideBottomDivider ? 0 : 1 }}>
                <Divider />
            </div>
        </div>
    )
}





interface TranslateTextButtonInterface {
    onPressTranslate: any
    onPressShowTranslation: any
    paddingTop?: number
    isTranslating: boolean
    isTranslated: boolean
    isDisplayingTranslation: boolean
}
export function TranslateTextButton({ onPressTranslate, onPressShowTranslation, paddingTop = 8, isTranslating, isTranslated, isDisplayingTranslation }: TranslateTextButtonInterface) {
    return (
        <div
            role={"button"}
            className={isMobile ? `hover:opacity-70` : `active:opacity-70`}
            onClick={() => {

                if (isTranslating) return

                if (isTranslated) {
                    onPressShowTranslation()
                } else {
                    onPressTranslate()
                }

            }} style={{ marginTop: paddingTop, justifyContent: "center", alignItems: "flex-start" }}>
            <p style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.black
            }}>{isTranslating ?
                localization.translating : (isTranslated ? (isDisplayingTranslation ?
                    localization.show_original
                    :
                    localization.show_translation) :
                    localization.translate_text
                )}</p>
        </div>
    )
}




