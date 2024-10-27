import React from 'react'
import Divider from '../Divider'
import Colors from '../../assets/Colors'
import { AtSightLogoButton } from '../Buttons'



interface LogoHeaderInterface {
    sticky?: boolean
    showDivider?: boolean
    backgroundColor?: string
}
/**
 * Displays a header with the AtSight's clickable logo in the middle.
*/
export default function LogoHeader({ sticky = true, showDivider = true, backgroundColor = Colors.white }: LogoHeaderInterface) {
    return (
        <div className={`justify-center items-center relative w-full ${sticky ? "sticky top-0 z-50" : ""}`} style={{ backgroundColor: backgroundColor }}>
            {/* Left + Right button */}
            <div className='flex flex-col items-center justify-between'
                style={{
                    marginLeft: 20,
                    marginRight: 20,
                    height: 45.5
                }}>

                <AtSightLogoButton />

            </div>


            {/* Dividers */}
            {showDivider && <Divider />}
        </div>
    )
}