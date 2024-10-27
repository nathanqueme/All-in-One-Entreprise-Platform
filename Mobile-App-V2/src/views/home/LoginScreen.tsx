//
//  LoginScreen.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors from './../../assets/Colors'
import TextStylesProvider from '../../components/styles/TextStyles'
import MultipleInputsContainer from '../../components/ui/MultipleInputsContainer'
import localization from '../../utils/localizations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, Pressable, Keyboard, Alert, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol, EyeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { AccountMainData, ImageDataObj } from '../../Data'
import { CachedSessionMetadata, cacheSessionMetadata, getSessionMetadata, signInUser } from '../../aws/cognito'
import { getErrorDescription } from './../../components/AlertsAndErrors'
import { getAccountMainData } from './../../aws/dynamodb'
import { getContent } from '../../aws/s3'
import { getFileName } from '../../components/functions'


// Global data 
import { useDispatch } from 'react-redux'
import { updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { ActionEventObj, atag, getLogTime } from '../../analytics'




const LoginScreen = ({ navigation }) => {

    // States 
    const firstTextInput = useRef(null)
    const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)


    // Values
    // Handles actions after return keyboard pressed    
    const secondTextInputRef = useRef(null)
    const color_scheme = useColorScheme()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const is_in_dark_color_scheme = color_scheme === "dark"
    let metadataFilled = (username !== '' && password !== '')


    // Global data 
    const dispatch = useDispatch()



    /**
     * - 1 - Sign in 
     * - 2 - Load accountMainData
     * - 3 - Cache session + accountMainData 
     * - 4 - Update Ui
     * - 5 - Save on Analytics
    */
    async function logInUser() {


        // Preparation
        Keyboard.dismiss()
        setIsLoading(true)



        // 1
        let sessionMetadata: CachedSessionMetadata
        try {
            let session = await signInUser(username, password)
            sessionMetadata = await getSessionMetadata(session)
        } catch (error) {
            if (error.code === 'NotAuthorizedException') {
                Alert.alert(localization.incorrect_password, localization.incorrect_password_description)
            }
            else {
                alert(getErrorDescription(error).message)
            }
            setIsLoading(false)
            return
        }
        console.log("Step 1 done")




        // 2.1 : Values 
        let accountMainData: AccountMainData = undefined
        try {
            accountMainData = await getAccountMainData(sessionMetadata.account_id)
            console.log("Step 2.1 done")
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }
        // 2.2 : Photo if any 
        let base64
        if (accountMainData?.has_photo ?? false) {
            try {
                let file_name = getFileName("profile_photo", accountMainData.short_id)
                base64 = await getContent("anyid-eu-west-1", file_name)
                accountMainData.image_data = ImageDataObj(base64, 1)
                console.log("Step 2.2 done")
            } catch (error) {
                alert(error)
            }
        }




        // 3
        // Session
        try {
            await cacheSessionMetadata(username, sessionMetadata)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }
        // user's AccountMainData
        // UI
        let userAccountMainData: updateUiStateValuePayload = { attribute: "userAccountMainData", value: accountMainData }
        dispatch(updateUiStateValue(userAccountMainData))
        // Cache 
        await AsyncStorage.setItem("@user_account_main_data", JSON.stringify(accountMainData))
        console.log("Step 3 done")



        // 4
        setIsLoading(false)
        console.log("Step 4 done")


        // 5 
        let event = ActionEventObj("login", getLogTime())
        dispatch(atag({ "event_type": "action", "event": event }))


        // Then opens user's page
        setTimeout(() => {
            dispatch(updateUiStateValue({ attribute: "account_id", value: sessionMetadata.account_id }))
            navigation.navigate("AccountManager")
        }, 400)


        navigation.navigate("Home") // Goes back 




    }


    useEffect(() => {
        setTimeout(() => {
            firstTextInput.current.focus()
        }, 550)
    }, [])



    return (
        <Pressable style={{ flex: 1 }} onPress={() => { Keyboard.dismiss() }}>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />



                    {/* Header */}
                    <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                        <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} />
                        <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.sign_in} description={localization.enter_email_or_username_to_login} />
                    </View>



                    <MultipleInputsContainer
                        COLORS={COLORS}
                        firstTextInput={
                            <TextInput
                                ref={firstTextInput}
                                placeholder={localization.email_address_or_username}
                                value={username}
                                onChangeText={text => setUsername(text)}
                                style={TEXT_STYLES.textInput16Medium}
                                placeholderTextColor="gray"
                                clearButtonMode="always"
                                autoCapitalize='none'
                                autoCorrect={false}
                                returnKeyType='next'
                                onSubmitEditing={() => { secondTextInputRef.current.focus() }}
                                blurOnSubmit={false} // See answer 1 and 429 at https://stackoverflow.com/questions/32748718/react-native-how-to-select-the-next-textinput-after-pressing-the-next-keyboar/36653746 
                            />
                        }
                        secondTextInput={
                            <View style={{ justifyContent: "flex-start", alignContent: "stretch", alignItems: "center", flexDirection: "row" }}>
                                <TextInput
                                    ref={secondTextInputRef}
                                    keyboardType='default'
                                    placeholder={localization.password}
                                    value={password}
                                    onChangeText={text => setPassword(text)}
                                    style={TEXT_STYLES.textInput16MediumInRow}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor='gray'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    returnKeyType='done'
                                    onSubmitEditing={() => { if (metadataFilled) logInUser() }}
                                />


                                <TouchableOpacity
                                    onPress={() => { setShowPassword(!showPassword) }}
                                    style={{ paddingRight: 3 }}>
                                    <EyeSymbol
                                        COLORS={COLORS}
                                        size={22}
                                        outlined={showPassword} color={"gray"}
                                    />
                                </TouchableOpacity>


                            </View>
                        }
                    />



                    {/* Forgot password ? button */}
                    <TouchableOpacity
                        onPress={() => { navigation.navigate("ForgottenPassword", { username: username }) }}
                        style={{ justifyContent: 'center', alignItems: 'center', }}
                    >
                        <Text style={[TEXT_STYLES.blueTappableText, { textAlign: 'center', marginVertical: 25, }]}>{localization.forgot_password}</Text>
                    </TouchableOpacity>



                    {/* Button */}
                    <ClassicButton
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        onPress={logInUser}
                        text={localization.log_in}
                        backgroundColor={COLORS.darkBlue}
                        textColor={"white"}
                        isLoading={isLoading}
                        condition={metadataFilled}
                        horizontalMargin={30}
                    />



                </SafeAreaView>
            </SafeAreaProvider>
        </Pressable>
    )
}



export default LoginScreen



const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})