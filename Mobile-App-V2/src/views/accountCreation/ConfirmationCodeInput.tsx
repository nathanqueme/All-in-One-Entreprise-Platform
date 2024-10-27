//
//  ConfirmationCodeInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useEffect, useState, useRef } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import { StatusBar, StyleSheet, View, TextInput, Keyboard, Text, TouchableOpacity, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SlidingAlert } from '../../components/SlidingAlert'
import { sendConfirmationCode, confirmRegistration, verifyAttribute } from '../../aws/cognito'

// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectSignUpValues } from '../../state/slices/signUpSlice'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import localization from '../../utils/localizations'



const ConfirmationCodeInput = ({ navigation, route }) => {

    // States 
    const [code, setCode] = useState('')
    const [keyboardShown, setKeyboardShown] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)


    // Navigation values 
    const newEmail = route.params?.newEmail ?? '' // When opened adter email attribute edited in a AccountInfoPage
    const username = route.params?.username ?? '' // Same 


    // Global data
    const uiStates = useSelector(selectUiStates)
    const signUpValues = useSelector(selectSignUpValues)
    const dispatch = useDispatch()
    const email = signUpValues?.email ?? ''



    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)
    const textInputRef = useRef("textInput")
    const insets = useSafeAreaInsets()
    const openedAfterEmailEdited = newEmail !== ''




    useEffect(() => {

        setTimeout(() => {
            if (keyboardShown) return
            (textInputRef.current as any).focus()
            setKeyboardShown(true)
        }, 550)

    }, [])




    async function confirmCode() {

        // Preparation
        Keyboard.dismiss()
        setError("")
        if (code.replace(/\s+/g, '').length < 6) {
            setError(localization.empty_confirmation_code)
            return
        }
        setIsLoading(true)



        // Checks code
        try {

            switch (openedAfterEmailEdited) {

                case true:
                    // 1 - Check 
                    const result2 = await verifyAttribute('email', code.replace(/\s+/g, ''))


                    // 2 - Update Ui 
                    dispatch(updateUiStateValue({ attribute: 'updatedAppearance', value: true }))
                    setIsLoading(false)
                    navigation.goBack()
                    break


                case false:
                    // Checks
                    await confirmRegistration(email.replace('@', ''), code.replace(/\s+/g, ''))

                    // Update Ui
                    setIsLoading(false)
                    navigation.navigate('PasswordInput')
                    break


            }

        } catch (error) {

            // Slows down the process a little
            setTimeout(() => {
                setIsLoading(false)
                if (error.code === 'CodeMismatchException') {
                    setError(localization.invalid_confirmation_code)
                } else if (error.code === 'LimitExceededException') {
                    setError(localization.limit_reached)
                }
                else {
                    setError(getErrorDescription(error).message)
                }
            }, 150)

        }


    }




    return (
        <View style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />



                    <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                        <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} hide={!openedAfterEmailEdited} />
                        <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.confirmation_code} description={localization.formatString(localization.enter_code_sent_to, openedAfterEmailEdited ? newEmail : email) as string} descriptionButtonText={localization.resend_code} onPress={async () => {
                            try {
                                const result = await sendConfirmationCode(openedAfterEmailEdited ? username : signUpValues.email.replace('@', ''))
                                dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "copied_alert" }))
                            } catch (error) {
                                alert(error)
                            }
                        }} />
                    </View>



                    <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30, paddingRight: 16 - 5 }]} >
                        <TextInput
                            ref={textInputRef as any}
                            autoFocus={false}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            placeholder={localization.code}
                            value={code}
                            onChangeText={text => {
                                setCode(text)
                                setError("")
                            }}
                            onFocus={() => {
                                setError("")
                            }}
                            style={TEXT_STYLES.textInput16Medium}
                            placeholderTextColor='gray'
                            clearButtonMode="always"
                            returnKeyType='next'
                            keyboardType='number-pad'
                            onSubmitEditing={() => { confirmCode() }}
                        />
                    </View>


                    {(error !== "") &&
                        <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} />
                    }


                    <ClassicButton
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        isLoading={isLoading}
                        onPress={() => { confirmCode() }}
                        condition={code.length >= 6}
                        text={openedAfterEmailEdited ? localization.continue : localization.next}
                        topMargin={20}
                        horizontalMargin={30}
                        backgroundColor={COLORS.darkBlue}
                        textColor={"white"}
                    />


                    {!openedAfterEmailEdited &&
                        <TouchableOpacity
                            disabled={isLoading}
                            onPress={async () => { navigation.goBack() }}
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                        ><Text
                            style={{
                                color: isLoading ? COLORS.capsuleGray : COLORS.darkBlue,
                                fontSize: 15,
                                fontWeight: "500",
                                marginVertical: 30,
                            }}>{localization.change_email_address}</Text>
                        </TouchableOpacity>
                    }



                </SafeAreaView>
            </SafeAreaProvider>


            <SlidingAlert
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                topInset={insets.top}
                bottomInset={insets.bottom}
                slidingAlertType={uiStates.slidingAlertType}
                resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                slideFromBottom={false}
                customText={localization.formatString(localization.code_sent_to, openedAfterEmailEdited ? newEmail : email) as string}
            />


        </View>
    )
}

export default ConfirmationCodeInput



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})