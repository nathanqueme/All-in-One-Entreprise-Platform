//
//  EmailInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useEffect, useState, useRef } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, TextInput, Keyboard, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { queryProfileByEmail } from '../../aws/dynamodb'
import { signUpUser, sendConfirmationCode } from '../../aws/cognito'
import { ActionEventObj, getLogTime, atag } from '../../analytics/index'

// Controller
import { useSelector, useDispatch } from 'react-redux'
import { updateSignUpValue, selectSignUpValues } from '../../state/slices/signUpSlice'
import { ExecuteStatementCommandOutput } from '@aws-sdk/client-dynamodb'
import { isAnEmail } from '../../components/functions'




const EmailInput = ({ navigation }) => {

    // States
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [checking, setChecking] = useState(false)


    // Global data
    const dispatch = useDispatch()


    // Values 
    const textInputRef = useRef(null)
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)





    useEffect(() => {
        setError("")
    }, [email])



    useEffect(() => {
        setTimeout(() => {
            textInputRef.current.focus()
        }, 550)
    }, [])



    async function openNextPage() {

        // Preparation
        const trimmedEmail = email.replace(/\s+/g, '')
        Keyboard.dismiss()
        setError('')




        // 1 - Check email validity
        if (!isAnEmail(trimmedEmail)) {
            setError(localization.empty_email)
            return
        }
        console.log("\nStep 1 done")




        // 2 - Check email availability
        setChecking(true)
        let result: ExecuteStatementCommandOutput
        try {
            result = await queryProfileByEmail(trimmedEmail)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setChecking(false)
            return
        }
        if (result.Items.length > 0) {
            setChecking(false)
            setError(localization.email_already_used)
            return
        }
        console.log("Step 2 done")





        /** 3 - Register user with dummy password 

        N.B. : the username used to signUp will never be used later.

        Using the email without '@' as the username and a dummy password is done so that people can create an account a secured way and that the process happens the way we want to : 
        -> The email is confirmed just after entering the email and before entering the password ---> More joyfull + People can't create an account for an other person as they will be blocked at the verification -> secured 
        -> The user can click on next and then come back to change the email 
        -> If the user has closed the app and restarts creating its account it works 
        */
        let event = ActionEventObj("sign_up", getLogTime())
        try {
            const result = await signUpUser(trimmedEmail.replace('@', ''), '------', trimmedEmail)
            dispatch(updateSignUpValue({ key: "email", value: trimmedEmail }))
            setChecking(false)
            navigation.navigate("ConfirmationCodeInput")
            // ANALYTICS
            dispatch(atag({ "event_type": "action", "event": event }))
        } catch (error) {

            // Works even if the email is already used (An account has already beeing registered or completely created)
            if ('UsernameExistsException' === error.code) {
                // Resends code 
                try {
                    const result = await sendConfirmationCode(trimmedEmail)
                    dispatch(updateSignUpValue({ key: "email", value: trimmedEmail }))
                    navigation.navigate("ConfirmationCodeInput")
                    // ANALYTICS
                    dispatch(atag({ "event_type": "action", "event": event }))
                } catch (error) {
                    alert(error)
                }
            } else {
                setError(error?.message ?? "Error")
            }

            
            console.log(error.message)
        

            console.log("Step 3 done")
            setChecking(false)
        }
    }



    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} />
                    <TitleAndSubTitle  TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.email_address} description={localization.email_input_description} />
                </View>



                <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30, paddingRight: 16 - 5 }]} >
                    <TextInput
                        ref={textInputRef}
                        onFocus={() => { setError("") }}
                        autoFocus={false}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        placeholder={localization.email_address}
                        value={email}
                        onChangeText={text => setEmail(text)}
                        style={TEXT_STYLES.textInput16Medium}
                        placeholderTextColor='gray'
                        clearButtonMode="always"
                        returnKeyType='next'
                        keyboardType='email-address'
                        onSubmitEditing={() => { openNextPage() }}
                    />
                </View>


                {error ? <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} /> : null}


                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    isLoading={checking}
                    onPress={() => { openNextPage() }}
                    condition={(email !== '')}
                    text={localization.next}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                />





            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default EmailInput



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})