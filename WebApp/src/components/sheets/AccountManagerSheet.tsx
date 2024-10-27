//
//  AccountManagerSheet.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 07/27/22.
//


// @ts-check
import React, { useState, useEffect } from 'react'
import '../../styles/TextStyles.css'
import Divider from '../Divider'
import Colors from '../../assets/Colors'
import CirclePhoto from '../CirclePhoto'
import TextAndDescription from '../TextAndDescription'
import localization from '../../utils/localizations'
import { ClassicHeader } from '../headersComponents'
import { SettingsButton, CapsuleButton, HeaderButton } from '../Buttons'
import { WindowHeight } from '../WindowHeight'
import { Link, useNavigate } from 'react-router-dom'
import { isMobileHook } from '../functions'
import { SettingsIcon } from '../Icons'



const isMobile = isMobileHook()



interface AccountManagerSheetInterface {
    show: boolean
    setShow: (_: any) => any
    headerHeight: number
}
/**
  * On desktops looks like an "ActionSheet".
  * On small devices looks like a page occupying the full width.
 */
export default function AccountManagerSheet({ show, setShow, headerHeight }: AccountManagerSheetInterface) {

    // States
    const [isSigningOut, setIsSigningOut] = useState(false)

    // Values 
    const navigate = useNavigate()
    let windowHeight = WindowHeight()



    // Handles touched outside
    useEffect(() => {

        if (!show) return
        setTimeout(() => {
            window.onclick = handleOuterClick
        }, 5) // Avoids handling the first click that opens the sheet as an outside click

        // Stops scrolls in background 
        // if (parentDiv === null) return
        // parentDiv.addEventListener('wheel', preventScrollInBackground)

    }, [show])
    function handleOuterClick(e: MouseEvent) {
        if (!document.getElementById('accountManagerSheet')?.contains(e.target as any)) {
            hideSheet()
        }
    }
    function hideSheet() {
        window.onclick = null
        setShow(false)
        // if (parentDiv === null) return
        // parentDiv.removeEventListener('wheel', preventScrollInBackground)
    }
    //function preventScrollInBackground(e: WheelEvent) {
    // e.preventDefault()
    //}



    useEffect(() => {
        // window.onpopstate = overrideGoBack
    }, [show])
    /**
     * Overrides the go back button to make the sheet cancelable.
    */
    function overrideGoBack(e: PopStateEvent) {
        if (show) {
            // window.history.forward()
            // hideSheet()
        }
    }







    function signOut() {

        setIsSigningOut(true)

        window.onclick = null // Avoids an unwanted issue (closing sheet)
        setTimeout(() => {
            window.onclick = handleOuterClick
        }, 5)
    }




    if (show) return (
        <div
            id="accountManagerSheet"
            className={`flex flex-col z-50 ${isMobile ? "w-full min-h-screen absolute top-0" : "rounded-xl w-96 mx-5 fixed top-0 right-0 shadow-lg border"}`}
            style={{
                backgroundColor: Colors.whiteToGray2,
                maxHeight: isMobile ? undefined : windowHeight - headerHeight - 20,
                marginTop: !isMobile ? headerHeight - headerHeight * 0.07 : undefined // header's height
            }}>
            {isMobile &&
                <ClassicHeader
                    onClose={() => {
                        setShow(false)
                        if (isMobile) navigate(-1)
                    }}
                    onClick={() => {
                        navigate("/accounts/settings/")
                    }}
                    closeButtonType={'xmark'}
                    buttonType={"settingsIcon"}
                    headerText={""}
                    backgroundColor={Colors.clear}
                    showDivider={false}
                />
            }



            {/* Current selected Account (large CirclePhoto + Place's name + account's name) */}
            {/* Your account + Your visibility + Your QR code */}
            {/* Settings */}
            {/* List of other accounts + Add an account (create account with already have an account ? -> sign in) +  */}
            <div className='overflow-scroll pb-10 bg-clip-border'>

                <div className={`mx-4 mb-4 flex ${isMobile ? "items-center justify-center" : "items-start justify-between"}`} style={{ marginTop: 16 }}>
                    {!isMobile && <div />}

                    {/* Current selected account */}
                    <div className='flex flex-col items-center justify-center' style={{ marginTop: !isMobile ? 20 : undefined }}>
                        <CirclePhoto
                            src={""}// uiStates.userAccountMainData?.image_data?.base64 ?? ""}
                            widthAndHeight={80}// * scalingRatio}
                            displayLetterIfNoPhoto={"N"}// uiStates.userAccountMainData?.account_name?.slice(0, 1)}
                        />
                        <div className='mt-2'>
                            <TextAndDescription
                                text={"Account name test"}// uiStates.userAccountMainData?.account_name ?? ""}
                                description={"Description test"}//uiStates.userAccountMainData?.username ?? ""}
                                certificationBadge={false}//uiStates.userAccountMainData?.certified ?? false}
                                alignItemsCenter
                            />
                        </div>
                    </div>

                    {!isMobile &&
                        <a href={"/accounts/password/change/"} className={"hover:opacity-70"} onClick={() => { if (!isMobile) hideSheet() }}>
                            <SettingsIcon size={"1.3em"} />
                        </a>
                    }
                </div>


                {/* Buttons */}
                <SettingsButton
                    settingsInfo={'your_account'}
                    onClick={() => {
                        if (!isMobile) hideSheet()

                        // Opens account's page
                        /**
                          let payload: updateUiStateValuePayload = { attribute: "account_id", value: uiStates.userAccountMainData?.account_id }
                          dispatch(updateUiStateValue(payload))
                          dispatch(openAndLoadNewProfilePage(uiStates.userAccountMainData?.account_id, navigation, uiStates.userAccountMainData?.username, true, true, true) as any)
                        */

                    }}
                    link={"/george6paris/"}
                />
                {/**
                    Your visibility
                */}
                <SettingsButton
                    settingsInfo={'your_qr_code'}
                    onClick={() => { if (!isMobile) hideSheet() }}
                    link={"/accounts/qr/"}
                />

                <Divider />
                <SettingsButton
                    settingsInfo={'analytics'}
                    onClick={() => { if (!isMobile) hideSheet() }}
                    link={"/analytics"}
                />

                <Divider />
                <div className='flex p-4 justify-start items-center hover:brightness-95 hover:bg-white cursor-pointer' onClick={() => {
                    if (!isMobile) hideSheet()
                }}>
                    <CirclePhoto
                        src={""}// uiStates.userAccountMainData?.image_data?.base64 ?? ""}
                        widthAndHeight={46}// * scalingRatio}
                        displayLetterIfNoPhoto={"N"}// uiStates.userAccountMainData?.account_name?.slice(0, 1)}
                    />

                    <TextAndDescription
                        text={"Account name test"}// uiStates.userAccountMainData?.account_name ?? ""}
                        description={"Description test"}//uiStates.userAccountMainData?.username ?? ""}
                        certificationBadge={false}//uiStates.userAccountMainData?.certified ?? false}
                        paddingLeft={20}
                    />
                </div>
                {/* Capsule button (loading indicator or text) 
                <p
                    className='calloutMedium flex-1 py-2 border mx-4 mt-4 rounded-md hover:brightness-95 cursor-pointer bg-white'
                    onClick={() => {
                        hideSheet()
                        window.location.assign("/accounts/sign_in/")
                    }}>{"Add an other account"}</p>
                <p
                    className='calloutMedium flex-1 py-2 border mx-4 my-4 rounded-md hover:brightness-95 cursor-pointer bg-white'
                    onClick={() => {
                        // loading 
                    }}>{localization.sign_out + " de tous les comptes"}</p>
                */}

                <CapsuleButton
                    text={"Add an other account"}
                    onClick={() => { if (!isMobile) hideSheet() }}
                    link={"/accounts/sign_in/"}
                    marginTop={4}
                    marginBottom={0}
                    marginX={4}
                />
                <CapsuleButton
                    text={localization.sign_out + " de tous les comptes"}
                    onClick={() => { signOut() }}
                    marginTop={4}
                    marginBottom={4}
                    marginX={4}
                    isLoading={isSigningOut}
                />
                <Divider />




            </div>
        </div >
    )
    else { return (null) }
}



