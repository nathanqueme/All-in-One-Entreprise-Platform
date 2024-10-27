import React, { useEffect } from 'react'
import '../../styles/BottomSheetStyles.css'
import GrayCapsule from './GrayCapsule'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import WideDevicesSheet from './WideDevicesSheet'
import ActionSheet from './ActionSheet'
import { useDrag } from '@use-gesture/react'
import { useNavigate } from 'react-router-dom'
import { HeaderButtonType, HeaderCloseButtonType } from '../../Types'
import { ClassicHeader } from '../headersComponents'
import { a, useSpring, config } from '@react-spring/web'
import { isMobileHook } from '../functions'


const isMobile = isMobileHook()



interface BottomSheetInterface {
    show: boolean
    // Display options
    options: string[]
    description?: string
    handleClick?: (buttonIndex: number) => any
    styleForiOS?: boolean
    // Display content
    content?: any
    content_height?: number
    headerText?: string
    header?: any // Custom header 
    headerHeight?: number // Height of the custom header 
}
/**
 * A sheet that slides from the bottom. Can be used to display : 
 *   - 1 : options, with the ability to display a custom style for iOS (to deprecated --> make one style)
 *   - 2 : content such as timetables with a header
*/
export default function BottomSheet({
    show,
    options, description, handleClick = () => { }, styleForiOS = false,
    content, content_height = window.innerHeight * 0.5, headerText = "", header, headerHeight = 44.5
}: BottomSheetInterface) {


    // Values 
    const navigate = useNavigate()
    const hasOptions = options.length > 0
    const hasADescription = (description ?? "") !== ""
    let grayCapsuleHeight = (12 + 12 + 4)
    let optionsHeight = options.length * 60 + (styleForiOS ? 60 + grayCapsuleHeight // gray capsule
        : 0) + (hasADescription ? 60 : 0)
    const height = hasOptions ? optionsHeight : (content_height + headerHeight + grayCapsuleHeight)
    const [{ y }, api] = useSpring(() => ({ y: height }))
    const customOpenAnimationConfig = {
        tension: 280,
        friction: 30
    }



    /** If options are added for instance once the page appears
     * --> avoids the sheet to exceed from the bottom by re aligning it. 
    */
    useEffect(() => {
        if (show) return
        hideBottomSheet(0, true)
    }, [options.length, hasADescription])


    // MOBILE ___________________________________
    // Handles hide/show
    useEffect(() => {
        switch (show) {
            case true: showBottomSheet(); break
            case false: hideBottomSheet(); break
            default: return
        }
    }, [show])
    function showBottomSheet() {
        api.start({ y: 0, immediate: false, config: customOpenAnimationConfig })
    }
    function hideBottomSheet(velocity = 0, immediate = false) {
        if (show) {
            navigate(-1)
        } else {
            api.start({ y: height, immediate: immediate, config: { ...config.stiff, velocity } })
        }
    }
    const bind = useDrag(
        ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel, canceled }) => {
            // if the user drags up passed a threshold, then we cancel
            // the drag so that the sheet resets to its open position
            if (my < -70) cancel()

            // when the user releases the sheet, we check whether it passed
            // the threshold for it to close, or if we reset it to its open positino
            if (last) {
                my > height * 0.5 || (vy > 0.5 && dy > 0) ? hideBottomSheet(vy) : showBottomSheet()
            }
            // when the user keeps dragging, we just move the sheet according to
            // the cursor position
            else api.start({ y: my, immediate: true })
        },
        { from: () => [0, y.get()], filterTaps: true, bounds: { top: 0 }, rubberband: true }
    )
    // ___________________________________________



    // WIDE DEVICES ______________________________
    function hideSheet() {
        navigate(-1)
    }
    // ___________________________________________






    // UI
    const display = y.to((py) => (py < height ? 'block' : 'none'))
    const animatedBgStyle = {
        transform: y.to([0, height], []),
        opacity: y.to([0, height], [0.7, 0.0], 'clamp'),
    }

    if (isMobile) {
        return (
            <div className={`items-center justify-center h-full w-full absolute ${show ? "pointer-events-auto" : "pointer-events-none"}`} style={{ zIndex: 100 }}>

                {/* Black opacity */}
                <a.div className={`bg-black h-screen w-full fixed top-0`} onClick={() => hideBottomSheet()} style={Object.assign({}, animatedBgStyle, { zIndex: 103 })} />

                <a.div className={`bottomSheet ${styleForiOS || !hasOptions ? " rounded-t-xl" : ""}`} {...bind()} style={{ display, bottom: `calc(-100vh + ${height - 100}px)`, zIndex: 104, y }}>
                    {hasOptions ?
                        <>
                            {styleForiOS &&
                                <GrayCapsule />
                            }

                            {hasADescription &&
                                (
                                    styleForiOS ?
                                        <div className='iOSBottomSheetButton'>
                                            <p style={Object.assign({}, TextStyles.gray13Text, { paddingHorizontal: 20 })}>{description}</p>
                                        </div>
                                        :
                                        <div className='flex w-full items-center justify-center' style={{ height: 60 }} >
                                            <p style={Object.assign({}, TextStyles.gray13Text, { paddingHorizontal: 20 })}>{description}</p>
                                        </div>
                                )
                            }

                            {
                                options.map((e, index) => {

                                    // let isLastItem = index === options.length - 1
                                    // let isFirstItem = index === 0

                                    return (
                                        <div
                                            key={e}
                                            className={`active:brightness-95 bg-white  ${styleForiOS ? 'iOSBottomSheetButton' : 'bottomSheetButton'}`}
                                            onClick={() => { handleClick(index) }}
                                            children={<p style={{ fontSize: 16, color: "black" }}>{e}</p>}
                                        />
                                    )
                                })
                            }
                        </>
                        :
                        <>
                            <GrayCapsule />
                            {header !== undefined ?
                                header
                                :
                                <ClassicHeader
                                    onClose={() => { }}
                                    closeButtonType={"" as any}
                                    headerText={headerText}
                                    makeTextFit={true}
                                    backgroundColor={Colors.whiteToGray}
                                    buttonType={"xmark"} // height > window.innerHeight * 0.7
                                    onClick={() => { hideBottomSheet() }}
                                />
                            }
                            {content}
                        </>
                    }
                </a.div >
            </div >
        )
    } else {
        return (
            hasOptions ?
                <ActionSheet
                    show={show}
                    onClickHide={() => { hideSheet() }}
                    options={options}
                    handleClick={(index) => { handleClick(index) }}
                    description={description}
                />
                :
                <WideDevicesSheet
                    headerText={headerText}
                    show={show}
                    onClickHide={() => { hideSheet() }}
                    content={content}
                />
        )
    }
}



