import React from 'react'
import { useState } from 'react'
import Colors from '../../assets/Colors'
import { WindowHeight } from '../WindowHeight'


interface LoadingScreenInterface {

}
/**
 * (THIN & LARGE DEVICES)
 * 
 * Displays a blank page with AtSight's "A" icon in small and in the middle on top of whatever is presented on the Ui.
 */
export default function LoadingScreen({ }: LoadingScreenInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values
    const atsightIcon = require("../../assets/images/app_icon_260.png")
    const iconHeightAndWidth = window.screen.width * 0.14
    const iconMaxHeightAndWidth = 90
    const windowHeight = WindowHeight()


    return (
        <div className='flex flex-col items-center justify-center absolute z-50 top-0 bg-white w-screen overflow-hidden scrollbar-hide' style={{ height: windowHeight }}>
            <img alt='AtSight' src={atsightIcon} width={iconHeightAndWidth} height={iconHeightAndWidth} style={{ maxWidth: iconMaxHeightAndWidth, maxHeight: iconMaxHeightAndWidth, color: showAlt ? Colors.smallGrayText : "transparent" }} onLoad={() => { setShowAlt(true) }} onError={() => { setShowAlt(true) }} />
        </div>
    )
}