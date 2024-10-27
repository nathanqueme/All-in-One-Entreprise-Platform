import React, { useEffect } from "react"
import Colors from "../../assets/Colors"
import { useNavigate } from "react-router-dom"
import { HeaderCloseButtonType } from "../../Types"
import { SheetCloseButton } from "../Buttons"
import { ClassicHeader } from "../headersComponents"
import { WindowHeight } from "../WindowHeight"




interface WideDevicesSheetInterface {
    headerText: string
    show: boolean
    onClickHide: () => any
    content: any
    closeButtonType?: HeaderCloseButtonType
}
/**
 * The equivalent of the "BottomSheet" on small devices.
 * Displays a classic header and the given content.
 */
export default function WideDevicesSheet({ headerText, show, onClickHide, content, closeButtonType = "" as any }: WideDevicesSheetInterface) {


    const windowHeight = WindowHeight()


    if (show) {
        return (
            <div className='fixed inset-0 flex justify-center items-center z-50'>

                {/* Black background */}
                <div className='flex w-full h-full absolute z-30 bg-black bg-opacity-70' onClick={() => { onClickHide() }} />

                {/* Close button */}
                <SheetCloseButton onClick={() => { onClickHide() }} />

                {/* Selector */}
                <div className={`bg-clip-content flex flex-col z-50 rounded-xl w-96 mx-5 overflow-hidden`} style={{ backgroundColor: Colors.whiteToGray2, maxHeight: windowHeight - (20 * 2) }}>

                    <ClassicHeader
                        onClose={() => {
                            onClickHide()
                        }}
                        closeButtonType={closeButtonType}
                        headerText={headerText}
                        backgroundColor={Colors.clear}
                    />

                    {/* Searchbar + Countries */}
                    <div className='overflow-y-scroll overflow-x-hidden'>
                        {content}
                    </div>
                </div >
            </div>
        )
    } else {
        return null
    }
}



