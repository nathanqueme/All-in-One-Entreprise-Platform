import React from 'react'
import localization from '../../utils/localizations'
import TitleAndSubTitle from '../TitleAndSubTitle'
import { ArrowRightLeaveBoxIcon } from '../Icons'



/**
 * Displays an icon that explains that the page is not founded and that indicates that the user can go back on AtSight's home screen.
*/
export default function Error404Ui() {
    return (
        <div className='flex flex-col items-center justify-center' style={{ paddingTop: 90 }}>
            <div style={{ paddingBottom: 10 }}>
                <ArrowRightLeaveBoxIcon fontSize={70} />
            </div>
            <TitleAndSubTitle title={localization.page_not_found} subtitle={localization.invalid_link_message} descriptionButtonText={localization.go_back_to_home} link={"/"} />
        </div>
    )
}

