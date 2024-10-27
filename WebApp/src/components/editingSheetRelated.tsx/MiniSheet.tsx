//
//  MiniSheet.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/17/22
//

import React, { useEffect } from 'react'
import Divider from '../Divider'
import { HeaderButton } from '../Buttons'



interface MiniSheetInterface {
    content: any
    setShow: (_: boolean) => any
    marginLeft: number
    condition?: boolean
    displayControlBar?: boolean
    absolutePosition?: string
    width?: number | string 
}
/**
 * A small sheet that displays the provided content, a shadow for been easily visible and buttons to do actions. ("Close" and "Select")
 */
export function MiniSheet({ content, setShow = () => { }, marginLeft, condition = true, displayControlBar = true, absolutePosition = "left-0 bottom-0", width = 340 }: MiniSheetInterface) {

    // Values
    const id = "mini_sheet"


    // INITIALIZATION
    useEffect(() => {
        const miniSheetDiv = document.getElementById(id)
        if (miniSheetDiv === null) { return }
        setTimeout(() => {
            window.onclick = handleOuterClick
        }, 100) // WAIT OTHERWISE WILL CLOSE SHEET IMMEDIATLY

        return () => {
            window.onclick = null
        }
    }, [])


    function handleOuterClick(e: MouseEvent) {
        const miniSheetDiv = document.getElementById(id)
        if (miniSheetDiv === null) { console.log("ERROR"); return }
        if (!miniSheetDiv.contains(e.target as any)) {
            setShow(false)
        }
    }


    return (
        <div id={id} className={`rounded-md bg-white shadow-md absolute overflow-x-hidden ${absolutePosition}`} style={{ width: width, borderWidth: 0.1, zIndex: 110, marginLeft: marginLeft }}>
    
            {content}

            {(displayControlBar === true) &&
                <>
                    <Divider />
                    <MiniSheetControlBar onClick={() => { setShow(false) }} onClose={() => { setShow(false) }} condition={condition} />
                </>
            }
        </div>
    )
}




interface MiniSheetControlBarInterface {
    onClose: () => any
    onClick: () => any
    condition?: boolean
}
/**
 * A row with a "Close" button, a "Select" button and a Divider at the top.
*/
export function MiniSheetControlBar({ onClose = () => { }, onClick = () => { }, condition = true }: MiniSheetControlBarInterface) {
    return (
        <div className={`flex flex-col justify-center items-center w-full`}>

            {/* Divider */}
            <Divider />

            <div className='flex items-center justify-between w-full' style={{ height: 32 + (8 * 2), paddingInline: 20 }}>
                <div />
                {/*
                 <HeaderCloseButton
                    onClose={onClose}
                    closeButtonType={"closeText"}
                />
                */}

                <HeaderButton
                    onClick={onClick}
                    buttonType={"selectText"}
                    blueWhenTappable
                    condition={condition}
                />
            </div>

        </div>
    )
}
