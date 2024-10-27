import React from 'react'
import localization from '../../utils/localizations'
import TitleAndSubTitle from '../TitleAndSubTitle'
import { ArrowRightLeaveBoxIcon } from '../Icons'
import { WindowHeight } from '../WindowHeight'
import { ClassicButton } from '../Buttons'





interface Error404ScreenInterface {

}
/**
 * Displays an icon that explains that the page is not founded and that lets and indicates that the user can go back on AtSight's home screen.
*/
export default function Error404Screen({ }: Error404ScreenInterface) {

  const windowHeight = WindowHeight()

  return (
    <div className='flex flex-col items-center justify-center absolute z-50 top-0 bg-white w-screen scrollbar-hide' style={{ height: windowHeight }}>

      <div style={{ paddingBottom: 10 }}>
        <ArrowRightLeaveBoxIcon fontSize={70} />
      </div>
      <TitleAndSubTitle title={localization.page_not_found} subtitle={localization.invalid_link_message} />

      <a href='/' style={{ marginTop: 30 }}>
        <ClassicButton text={localization.go_back_to_home} onClick={() => {  }} />
      </a>

    </div>
  )
}