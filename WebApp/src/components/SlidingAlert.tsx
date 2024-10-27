import React, { useState, useEffect } from 'react'
import '../styles/MainStyles.css'
import localization from '../utils/localizations'
import { SlidingAlertType } from '../Types'
import Colors from '../assets/Colors'
import { a, useSpring, config } from '@react-spring/web'
import { NoConnectionIcon, ExclamationMarkCircleIcon, CheckMarkCircleIcon } from '../components/Icons'
import { isMobileHook } from './functions'


const isMobile = isMobileHook()



interface SlidingAlertInterface {
    slidingAlertType: SlidingAlertType
    resetSlidingAlertType: () => any
    customText?: string
}
function SlidingAlert({ slidingAlertType = "copied_alert", resetSlidingAlertType, customText = "" }: SlidingAlertInterface) {


    // States 
    const [persistentType, setPersistentType]: [SlidingAlertType, any] = useState('' as any)


    // Values 
    const customOpenAnimationConfig = {
        tension: 280,
        friction: 30
    }
    let height = 48 + 10
    const [{ y }, api] = useSpring(() => ({ y: -height }))


    // Animation
    useEffect(() => {
        if (slidingAlertType as any !== "") {
            setPersistentType(slidingAlertType)
            show()
            setTimeout(() => {
                hide()
            }, 2500)
        }
    }, [slidingAlertType])
    function show() {
        api.start({ y: 0, immediate: false, config: customOpenAnimationConfig })
    }
    function hide(velocity = 0) {
        api.start({ y: -height, immediate: false, config: { ...config.stiff, velocity } })
        resetSlidingAlertType()
    }
    /*
    const bind = useDrag(
        ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel, canceled }) => {
           // hide on drag 
        },
        { from: () => [0, y.get()], filterTaps: true, bounds: { top: 0 }, rubberband: true }
    )
    */


    // Values
    const opacity = y.to((py) => (py !== -height ? 1 : 0 ))
    let symbolAndTextColor = getSymbolAndTextColor()
    let screenWidthWithHorizontalPadding = "calc(100% - 20px )"


    // Ui
    function getSymbolAndTextColor() {
        switch (persistentType) {
            case 'no_connection':
            case 'profile_not_found':
            case 'copied_alert':
            case 'sent_alert': return Colors.white
        }
    }

    function getBackgroundColor() {
        switch (persistentType) {
            case 'no_connection':
            case 'profile_not_found': return Colors.red
            case 'copied_alert':
            case 'sent_alert': return Colors.darkBlue
        }
    }

    function getSymbol() {
        let color = symbolAndTextColor
        switch (persistentType) {
            case 'no_connection': return (<NoConnectionIcon color={color} size={"1.5em"} />)
            case 'profile_not_found': return (<ExclamationMarkCircleIcon color={color} size={"1.8em"} />)
            case 'copied_alert':
            case 'sent_alert': return (<CheckMarkCircleIcon color={color} size={"1.8em"} />)
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
        <div className={`flex items-start justify-center h-full w-full pointer-events-none absolute top-0`} style={{ zIndex: 101 }}>
                <a.div
                    className='flex justify-start items-center rounded-lg fixed top-0'
                    style={{
                        opacity, 
                        backgroundColor: getBackgroundColor(),
                        height: "3rem",
                        maxWidth: screenWidthWithHorizontalPadding,
                        minWidth: isMobile ? screenWidthWithHorizontalPadding : "35%",
                        marginTop: 10,
                        paddingLeft: 10,
                        paddingRight: 20,
                        zIndex: 103,
                        y
                    }}
                    // {...bind()}
                >
                    <div className='pr-3'>{getSymbol()}</div>
                    <p className='truncate' style={{ color: symbolAndTextColor }}>{customText !== "" ? customText : getText()}</p>
                </a.div>
        </div >
    )
}

export default SlidingAlert


