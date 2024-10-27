//
//  NewPasswordInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors from './../../assets/Colors'
import TextStylesProvider from '../../components/styles/TextStyles'
import MultipleInputsContainer from '../../components/ui/MultipleInputsContainer'
import RedError from '../../components/ui/RedError'
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, TextInput, View, TouchableOpacity, Keyboard, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol, EyeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { initiateChangingForgottenPassword, updateForgottenPassword } from '../../aws/cognito'



// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { SlidingAlert } from '../../components/SlidingAlert'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'




const NewPasswordInput = ({ navigation, route }) => {

    // States
    const [verificationCode, setVerificationCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)


    // Navigation values 
    let { username, sentTo, openedFromSettings } = route.params


    // Values 
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const firstTextInputRef = useRef(null)
    const secondTextInputRef = useRef(null)
    let metadataFilled = verificationCode !== "" && newPassword !== ""


    // Global data
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)

    // Initialization
    useEffect(() => {
        setTimeout(() => {
            (firstTextInputRef.current as any).focus()
        }, 550)
    }, [])



    // Clear 
    useEffect(() => {
        setError("")
    }, [verificationCode, newPassword])




    /**
     * - 1 - Update password 
     * - 2 - Update  Ui
    */
    async function updateNewPassword() {

        // Preparation
        Keyboard.dismiss()
        setIsLoading(true)
        setError("")


        // 1
        try {
            await updateForgottenPassword(username, verificationCode, newPassword)
        } catch (error) {
            setTimeout(() => {
                setError(error.message)
                setIsLoading(false)
            }, 160)

            return
        }


        // 2
        setIsLoading(false)
        navigation.navigate("PasswordChanged", { sentTo: sentTo, openedFromSettings: openedFromSettings })

    }





    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }} >
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />



                    {/* Header */}
                    <View style={{ paddingVertical: 30, justifyContent: 'center', alignItems: 'center', }}>
                        <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} />
                        <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.new_password} description={localization.formatString(localization.enter_code_sent_to, sentTo) as string + ". " + localization.then_choose_password} descriptionButtonText={localization.resend_code} onPress={async () => {
                            try {
                                await initiateChangingForgottenPassword(username.trim().toLowerCase())
                                dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "copied_alert" }))
                            } catch (error) {
                                setError(error.message)
                                return
                            }
                        }} />
                    </View>




                    <MultipleInputsContainer
                        COLORS={COLORS}
                        firstTextInput={
                            <TextInput
                                ref={firstTextInputRef}
                                autoFocus={false}
                                placeholder={localization.verification_code}
                                value={verificationCode}
                                onChangeText={text => setVerificationCode(text)}
                                style={TEXT_STYLES.textInput16Medium}
                                placeholderTextColor='gray'
                                clearButtonMode="always"
                                keyboardType={"number-pad"}
                                returnKeyType='next'
                                onSubmitEditing={() => { secondTextInputRef.current.focus() }}
                                blurOnSubmit={false}
                                onFocus={() => { setError("") }}
                            />}
                        secondTextInput={
                            <View style={{ justifyContent: "flex-start", alignContent: "stretch", alignItems: "center", flexDirection: "row" }}>
                                <TextInput
                                    ref={secondTextInputRef}
                                    placeholder={localization.new_password}
                                    value={newPassword}
                                    onChangeText={text => setNewPassword(text)}
                                    secureTextEntry={!showPassword}
                                    style={TEXT_STYLES.textInput16MediumInRow}
                                    placeholderTextColor='gray'
                                    autoCapitalize='words'
                                    returnKeyType='default'
                                    onSubmitEditing={() => {
                                        updateNewPassword()
                                    }}
                                    onFocus={() => { setError("") }}
                                />

                                <TouchableOpacity onPress={() => { setShowPassword(!showPassword) }} style={{ paddingRight: 3 }}>
                                    <EyeSymbol COLORS={COLORS} size={22} outlined={showPassword} color={"gray"} />
                                </TouchableOpacity>

                            </View>
                        }
                    />




                    {(error !== "") &&
                        <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} />
                    }




                    <View style={{
                        paddingHorizontal: 30,
                        paddingVertical: 20,
                    }}>
                        <ClassicButton
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            onPress={updateNewPassword}
                            condition={metadataFilled}
                            text={localization.next}
                            topMargin={20}
                            backgroundColor={COLORS.darkBlue}
                            textColor={"white"}
                            isLoading={isLoading}
                        />
                    </View>



                </SafeAreaView>


                <SlidingAlert
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    topInset={insets.top}
                    bottomInset={insets.bottom}
                    slidingAlertType={uiStates.slidingAlertType}
                    resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                    slideFromBottom={false}
                    customText={localization.formatString(localization.code_sent_to, sentTo) as string}
                />


            </View>
        </SafeAreaProvider>
    )
}


export default NewPasswordInput

