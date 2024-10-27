import React from 'react'
import '../../styles/TextStyles.css'
import Divider from '../Divider'
import LoadingBar from '../LoadingBar'
import colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import ActivityIndicator from '../ActivityIndicator'
import TextStyles from '../../styles/TextStyles'
import { HeaderButton, HeaderCloseButton } from '../Buttons'
import { HeaderCloseButtonType, InformationType, HeaderButtonType, getInfoMetada } from '../../Types'






/** 
 * A header with a close button, a title and if needed a button that replaces itself by a OK when the user is typing text.
*/
interface ClassicHeaderInterface {
  onClose: any
  closeButtonType?: HeaderCloseButtonType
  headerText: string
  condition?: boolean
  blueWhenTappable?: boolean
  onClick?: any
  editedInfoType?: InformationType
  setEditedInfoType?: any
  buttonType?: HeaderButtonType
  isLoading?: boolean
  displayOkButtonWhenInfoEdited?: boolean
  hideCancelButtonWhenLoading?: boolean
  showDivider?: boolean
  makeTextFit?: boolean
  showLoadingBar?: boolean
  hideLoadingIndicator?: boolean
  backgroundColor?: string
  textColor?: string
  loadingBarColor?: string
  sticky?: boolean
}
export default function ClassicHeader({
  onClose,
  closeButtonType = 'chevronLeft',
  headerText,
  condition = true,
  blueWhenTappable = false,
  onClick,
  editedInfoType,
  setEditedInfoType,
  buttonType,
  isLoading,
  displayOkButtonWhenInfoEdited,
  hideCancelButtonWhenLoading = true,
  showDivider = true,
  showLoadingBar = false,
  hideLoadingIndicator = false,
  backgroundColor = colors.whiteToGray2,  // mainly used for changing it to colors.whiteToGray
  textColor = colors.black,
  sticky = false,
  loadingBarColor = undefined,
}: ClassicHeaderInterface) {


  // Values
  let show_ok_button = (editedInfoType ?? "") !== "" && (displayOkButtonWhenInfoEdited)
  

  return (
    <div className={`justify-center items-center relative w-full ${sticky ? "sticky top-0 z-50" : ""}`} style={{ backgroundColor: backgroundColor }}>
      {/* Left + Right button */}
      <div
        className='flex items-center justify-between'
        style={{
          marginLeft: 20,
          marginRight: 20,
          height: 45.5
        }}>
        {/* Left button */}
        {((hideCancelButtonWhenLoading ? (isLoading && !hideLoadingIndicator) : false) || ((closeButtonType ?? "") === "" as HeaderCloseButtonType)) ?
          <div
            // Needed so that the button at the rigth stays at the right 
            style={{ width: 10 }} />
          :
          <HeaderCloseButton
            onClose={onClose}
            closeButtonType={closeButtonType as HeaderCloseButtonType}
            color={textColor}
          />
        }


        {/* Right button */}
        {(typeof buttonType !== 'undefined' || (isLoading && !hideLoadingIndicator)) ?
          ((isLoading && !hideLoadingIndicator) ?
            <ActivityIndicator />
            :
            <HeaderButton
              onClick={show_ok_button ? () => { if (setEditedInfoType !== undefined) setEditedInfoType(undefined) } : () => { onClick() }}
              buttonType={show_ok_button ? "okText" : buttonType ?? "doneText"}
              blueWhenTappable={blueWhenTappable}
              condition={condition}
              color={textColor}
            />
            )
          :
          null
        }

      </div>


      {/* Headertext */}
      <p
        className='flex mx-28 items-center justify-center absolute top-0 bottom-0 left-0 right-0 pointer-events-none'
        style={Object.assign({}, TextStyles.headline, { marginLeft: 60, marginRight: 60, backgroundColor: colors.clear, color: textColor })}
      >{
          editedInfoType ?
            getInfoMetada(editedInfoType)?.name ?? localization.value
            :
            headerText
        }</p>


      {/* Dividers */}
      {showDivider &&
        <div>
          <Divider />

          {(showLoadingBar) &&
            <div className='absolute bottom-0 left-0 right-0 z-50'>
              <LoadingBar
                isLoading={isLoading}
                isMainLoadingBar={false}
                backgroundColor={loadingBarColor}
              />
            </div>
          }
        </div>
      }
    </div>
  )
}



