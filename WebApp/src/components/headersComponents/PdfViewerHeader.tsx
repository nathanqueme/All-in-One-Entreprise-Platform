//
//  PdfViewerHeader.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/22/22
//

import React from 'react'
import Divider from '../Divider'
import LoadingBar from '../LoadingBar'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import { INNER_PADDING } from '../editingSheetRelated.tsx'
import { ClassicButton, HeaderCloseButton } from '../Buttons'



interface PdfViewerHeaderInterface {
    main_text: string
    text: string
    onClose?: () => any
    closeButton?: boolean
    header_description_div?: any
    condition?: boolean
    showTimetables: boolean
    isLoading: boolean
    loadingBarColor: string
}
/**
 * A text at the left, a close button at the right and a divider at the bottom.
 */
export default function PdfViewerHeader({ main_text, text, onClose = () => { }, closeButton = true, header_description_div = undefined, condition = true, showTimetables, isLoading, loadingBarColor }: PdfViewerHeaderInterface) {
    return (
        <div className={`flex flex-col justify-center items-center w-full`}>
            <div className={`flex items-center ${showTimetables ? "justify-between" : "justify-center"} w-full relative`} style={{ height: 44.5 + 16, paddingLeft: INNER_PADDING, paddingRight: INNER_PADDING }}>
                {showTimetables ?
                    <>
                        <div className='flex items-center justify-center overflow-hidden' >
                            <p style={Object.assign({}, TextStyles.calloutBold, { color: "white" })}>{text}</p>
                            {(header_description_div) && header_description_div}
                        </div>

                        <div className='flex items-center justify-center' style={{ marginLeft: 0 }}>
                            {closeButton &&
                                <ClassicButton
                                    text={localization.back}
                                    textColor={Colors.white}
                                    backgroundColor={Colors.bgGray}
                                    onClick={() => { onClose() }}
                                    smallAppearance
                                    horizontalMargin={8}
                                />
                            }
                        </div>
                    </>
                    :
                    <p style={Object.assign({}, TextStyles.headline, { color: "white" })}>{main_text}</p>
                }

                {!showTimetables &&
                    <div className='absolute right-0' style={{ marginRight: INNER_PADDING }}>
                        <HeaderCloseButton closeButtonType={"xmark"} color={"white"} onClose={() => { onClose() }} />
                    </div>
                }
            </div>

            {/* Dividers */}
            <div className='w-full relative'>
                <Divider />
                <div className='absolute bottom-0 left-0 right-0 z-50'>
                    <LoadingBar
                        isLoading={isLoading}
                        isMainLoadingBar={false}
                        backgroundColor={loadingBarColor}
                    />
                </div>
            </div>

        </div>
    )
}

