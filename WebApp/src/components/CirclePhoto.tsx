import React from "react"
import '../styles/MainStyles.css'
import '../styles/TextStyles.css'
import Colors from '../assets/Colors'
import ButtonForAddingContent from '../components/Buttons'
import { useEffect } from "react"
import { useState } from "react"



interface CirclePhotoInterface {
    src: string
    widthAndHeight: number
    alt?: string
    isAccountManagerPreview?: boolean
    displayLetterIfNoPhoto?: string
    borderWidth?: number
    hoverEffect?: boolean
}
/**
 * 
 * TODO : the "CirclePhoto" is slightly larger with a photo --> creates a padding 
 * 
 */
export default function CirclePhoto({ src, alt = "Circle photo", isAccountManagerPreview = false, displayLetterIfNoPhoto = "", widthAndHeight, borderWidth = 2, hoverEffect = false}: CirclePhotoInterface) {

    // States 
    const [showAlt, setShowAlt] = useState(false)
    let adaptiveLetterSize = widthAndHeight / 36  // em


    if ((src ?? "") !== "") {
        return (
            <div className={`unselectable ${hoverEffect && "hover:brightness-95"}`} unselectable={"on"} style={{ width: widthAndHeight, height: widthAndHeight, borderRadius: widthAndHeight }}>
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    className={`align-middle object-cover items-center justify-center flex`}
                    width={widthAndHeight}
                    height={widthAndHeight}
                    style={{ borderWidth: borderWidth, borderRadius: widthAndHeight, pointerEvents: "none", color: showAlt ? Colors.smallGrayText : "transparent" }}
                    onLoad={() => { setShowAlt(true) }}
                    onError={() => { setShowAlt(true) }}
                    
                /> 
            </div>
        )
    } else if (displayLetterIfNoPhoto !== "") {
        return (
            <div
                className={`flex rounded-full items-center justify-center ${hoverEffect && "hover:brightness-95"}`}
                style={{
                    backgroundColor: Colors.softGray,
                    width: widthAndHeight,
                    height: widthAndHeight,
                    borderWidth: borderWidth
                }}
            >
                <p className='uppercase' style={{
                    // headline
                    fontSize: 17 * adaptiveLetterSize,
                    fontWeight: "600"
                }}>{displayLetterIfNoPhoto}</p>
            </div>
        )
    }
    else {
        return (
            <ButtonForAddingContent
                widthAndHeight={widthAndHeight}
                contentType={isAccountManagerPreview ? "account_management" : "photo"}
                rounded={true}
                borderWidth={borderWidth}
                hoverEffect={hoverEffect}
            />
        )
    }
}


