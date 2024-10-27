import React from 'react'
import Divider from '../Divider'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations' 




interface AlertInterface {
    title: string
    description: string
    show: boolean
    actionSheetClick: (index: number) => any
}
export default function Alert({
    title,
    description,
    show,
    actionSheetClick,
}: AlertInterface) {
    if (show) {
        return (
            <div className='flex flex-col top-0 h-full w-full fixed items-center justify-center bg-opacity-70 bg-black' style={{ zIndex: 70 }}>


                <div className='flex flex-col items-center justify-center bg-white rounded-xl bg-clip-content' style={{ width: 270 }}>

                    {/* Title + Description */}
                    <div style={{ paddingTop: 27, paddingBottom: 27, paddingLeft: 10, paddingRight: 10 }}>
                        <p className='text-center' style={Object.assign({}, TextStyles.headline, { color: Colors.black, paddingLeft: 27, paddingRight: 27 })}>{title}</p>
                        <p className='text-center' style={Object.assign({}, TextStyles.gray13Text, { paddingTop: 6 })}>{description}</p>
                    </div>

                    <Divider />


                    <div role="button" className='flex flex-col w-full items-center justify-center active:brightness-95 bg-white rounded-b-xl' style={{ paddingTop: 13, paddingBottom: 13 }} onClick={() => { actionSheetClick(0) }}>
                        <p style={Object.assign({}, TextStyles.callout)}>{localization.ok}</p>
                    </div>



                </div>

            </div>
        )
    } else {
        return null
    }
}