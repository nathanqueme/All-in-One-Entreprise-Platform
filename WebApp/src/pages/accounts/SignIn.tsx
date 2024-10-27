//
//  SignIn.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême.
//


import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import '../../styles/TextStyles.css'
import Colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import TitleAndSubTitle from '../../components/TitleAndSubTitle'
import TextStyles from '../../styles/TextStyles'
import { EyeIcon } from '../../components/Icons'
import { ClassicButton } from '../../components/Buttons'

import appStoreUs from '../../assets/images/downloadOnAppStore/us.svg'
import playStoreUs from '../../assets/images/downloadOnPlayStore/us.png'
import { ParentDivId } from '../../Types'
import { getMainDivMinHeight, isMobileHook } from '../../components/functions'


const isMobile = isMobileHook()


interface SignInInterface {
    footerHeight: number
}
export default function SignIn({ footerHeight }: SignInInterface) {


    // States 
    const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)


    // Values 
    let originUrl = window.location.origin // e.g. : "https://atsight.ch"
    let metadataFilled = (username !== '' && password !== '')


    async function logInUser() {



    }


    return (
        <div id={"SignInPageDiv" as ParentDivId} className='bg-white flex flex-col items-center justify-start' style={{
            minHeight: getMainDivMinHeight()
        }}>
            {/* Gray cell on Web */}
            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 w-96`}>
                <div className='flex py-10'>
                    <TitleAndSubTitle title={localization.sign_in} subtitle={localization.enter_email_or_username} />
                </div>

                {/* Multiple inputs */}
                <div className='grayInputContainer' style={{ backgroundColor: Colors.lightGray }}>
                    <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                        autoComplete='off'
                        spellCheck={false}
                        style={Object.assign({}, TextStyles.calloutMedium , { color: Colors.black })}
                        type='email'
                        placeholder={localization.email_address_or_username}
                        value={username}
                        onChange={event => { setUsername(event.target.value) }}
                    />
                    <div className='bg-white h-1' />
                    <div className='flex items-center justify-between'>
                        <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none flex-grow'
                            autoComplete='off'
                            spellCheck={false}
                            style={Object.assign({}, TextStyles.calloutMedium , { color: Colors.black })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={localization.password}
                            value={password}
                            onChange={event => { setPassword(event.target.value) }}
                        />
                        {/* Show password button */}
                        <button className='pr-4 hover:opacity-70' onClick={() => { setShowPassword(!showPassword) }}>
                            <EyeIcon color={Colors.smallGrayText} size={"1.4em"} striked={!showPassword} />
                        </button>
                    </div>
                </div>

                {/* Forgot password */}
                <div className='py-2'>
                    <a href={originUrl + "/password/reset/"}>
                        <p
                            className='blueTappableText px-16 py-3' // px-16 and p-2 makes it easier to touch 
                        >{localization.forgot_password}</p>
                    </a>
                </div>

                {/* Login button */}
                <ClassicButton
                    onClick={logInUser}
                    text={localization.log_in}
                    backgroundColor={Colors.darkBlue}
                    textColor={"white"}
                    isLoading={isLoading}
                    condition={metadataFilled}
                />
            </div>

            {/* Don't have an account ? Create an account. */}
            <div className={`flex flex-col items-center justify-center w-96 ${isMobile ? "" : "border-2 my-5"} rounded mx-5`}>
                <p className='py-5 text-center' style={TextStyles.callout}>{localization.dont_have_an_account}{
                    <a href={originUrl + "/accounts/sign_up/"} className='blueTappableText whitespace-pre'>{" "}{localization.create_an_account}.</a>
                }</p>
            </div>

            {/* Get the app. */}
            <div className='flex flex-col pb-10 items-center justify-center'>
                <p className='py-5' style={TextStyles.callout}>{localization.get_app}</p>

                {/* Badges (App Store + Google Play) */}
                <div className='flex' style={{}} >
                    <a className='row' href="https://apps.apple.com/us/app/atsight-app/id1629430405">
                        <img
                            src={appStoreUs}
                            style={{ height: window.screen.height * 0.05 }}
                            alt="App Store badge"
                        />
                    </a>

                    <div className='w-2' />


                    <a className='row' href="https://play.google.com/store/apps/details?id=com.atsight">
                        <img
                            src={playStoreUs} // for later : the badge was saved with a width of 800.
                            style={{
                                height: window.screen.height * (0.05 + 0.0005), // has the badge was manually cropped there is about 1 of space around
                            }}
                            alt="Google play badge"
                        />
                    </a>


                </div>
            </div>

        </div>
    )
}

