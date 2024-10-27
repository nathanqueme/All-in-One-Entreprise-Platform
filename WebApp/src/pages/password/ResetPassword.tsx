import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import '../../styles/TextStyles.css'
import Colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import TitleAndSubTitle from '../../components/TitleAndSubTitle'
import RedError from '../../components/RedError'
import SlidingAlert from '../../components/SlidingAlert'
import { ClassicButton } from '../../components/Buttons'
import { CheckMarkCircle, EyeIcon } from '../../components/Icons'
import { WindowHeight } from '../../components/WindowHeight'
import { ParentDivId } from '../../Types'
import TextStyles from '../../styles/TextStyles'
import { isMobileHook } from '../../components/functions'


const isMobile = isMobileHook()


interface ResetPasswordInterface {
  footerHeight: number
}
export default function ResetPassword({ footerHeight }: ResetPasswordInterface) {

  // States 
  // Step 1 
  const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
  // Step 2 
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  // Step 3
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false) // (text + confirmation code input + password input +  )
  const [showSuccess, setShowSuccess] = useState(false) // (text + icon + close button)
  //
  const [sentTo, setSentTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")


  // Values 
  let originUrl = window.location.origin // e.g. : "https://atsight.ch"
  let metadataFilled = (username !== '')
  let metadataFilledStep2 = (verificationCode !== "" && newPassword !== "")



  function launchReset() {

  }



  return (
    <div id={"ResetPasswordDiv" as ParentDivId} className='bg-white flex flex-col items-center justify-start' style={{
      minHeight: WindowHeight() - (footerHeight)
    }}>


      {/* Gray cell on Web for each step */}
      {!showSuccess ?
        (!showNewPasswordInput ?
          /* Step 1 */
          <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 w-96`}>
            <div className='flex py-10'>
              <TitleAndSubTitle title={localization.forgot_password} subtitle={localization.enter_email_or_username} />
            </div>

            {/* Username input */}
            <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
              <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                autoComplete='off'
                spellCheck={false}
                style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                type='email'
                placeholder={localization.email_address_or_username}
                value={username}
                onChange={event => { setUsername(event.target.value) }}
              />
            </div>

            {/* Error */}
            {(error !== "") &&
              <RedError error={error} marginTop={20} />
            }

            {/* Button */}
            <ClassicButton
              onClick={() => { launchReset() }}
              text={localization.next}
              backgroundColor={Colors.darkBlue}
              textColor={"white"}
              isLoading={isLoading}
              condition={metadataFilled}
            />
          </div>


          :


          /* Step 2 */
          <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 w-96`}>
            <div className='flex py-10'>
              <TitleAndSubTitle
                title={localization.new_password}
                subtitle={localization.formatString(localization.enter_code_sent_to, sentTo) as string + " " + localization.then_choose_password}
                descriptionButtonText={localization.resend_code}
                onClick={async () => { }}
              />
            </div>

            {/* Multiple inputs */}
            <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
              <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                autoComplete='off'
                spellCheck={false}
                style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                type='text'
                placeholder={localization.verification_code}
                value={verificationCode}
                onChange={event => { setVerificationCode(event.target.value) }}
              />
              <div className='bg-white h-1' />
              <div className='flex items-center justify-between'>
                <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none flex-grow'
                  autoComplete='off'
                  spellCheck={false}
                  style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={localization.password}
                  value={newPassword}
                  onChange={event => { setNewPassword(event.target.value) }}
                />
                <button className='pr-4 hover:opacity-50' onClick={() => { setShowPassword(!showPassword) }}>
                  <EyeIcon color={Colors.smallGrayText} size={"1.4em"} striked={!showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {(error !== "") &&
              <RedError error={error} marginTop={20} />
            }

            {/* Button */}
            <ClassicButton
              onClick={() => { launchReset() }}
              text={localization.next}
              backgroundColor={Colors.darkBlue}
              textColor={"white"}
              isLoading={isLoading}
              condition={metadataFilledStep2}
            />
          </div>
        )


        :


        /* Step 3 */
        <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 w-96`}>
          <div className='flex py-10'>
            <TitleAndSubTitle title={localization.password_changed} subtitle={localization.formatString(localization.password_of_was_changed, sentTo) as string} />
          </div>

          {/* Check mark icon */}
          <div className='pb-10'>
            <CheckMarkCircle size={"8em"} color={Colors.darkBlue} />
          </div>

          {/* Button */}
          <ClassicButton
            onClick={() => { launchReset() }}
            text={localization.close}
            backgroundColor={Colors.darkBlue}
            textColor={"white"}
            isLoading={isLoading}
            condition={metadataFilled}
          />
        </div>
      }



      <SlidingAlert
        slidingAlertType={"no_connection"}
        resetSlidingAlertType={() => {  }}
        customText={localization.formatString(localization.code_sent_to, sentTo) as string}
      />


    </div >
  )
}