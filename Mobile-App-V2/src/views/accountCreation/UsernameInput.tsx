//
//  UsernameInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, TextInput, Keyboard, BackHandler, useColorScheme } from 'react-native'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { checkUsernameValidity } from '../../components/functions'
import { getAccountMainDataAttributesByUsername } from '../../aws/dynamodb'


// Global data 
import { useDispatch } from 'react-redux'
import { updateSignUpValue } from '../../state/slices/signUpSlice'




const UsernameInput = ({ navigation }) => {

    // States 
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')


    // Global data
    const dispatch = useDispatch()


    // Values 
    const textInputRef = useRef(null)
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)



    // Disable go back support for Android
    const [backHandler, setBackHandler]: [any, any] = useState() // used to stop disabling the back button
    useEffect(() => {

        // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
        const handler = BackHandler.addEventListener("hardwareBackPress", () => {
            // ... (Do nothing)
            return true // Indicates that has overwritten the back action 
        })
        setBackHandler(handler)

    }, [])





    useEffect(() => {
        setTimeout(() => {
            textInputRef.current.focus()
        }, 550)
    }, [])


    // Reset error
    useEffect(() => {
        if (username.length) {
            setError("")
        }
    }, [username])



    async function openNextPage() {

        const trimmedUsername = username.replace(/\s+/g, '')
        Keyboard.dismiss()
        setError("")


        if (trimmedUsername.length === 0) {
            setError(localization.empty_username)
            return
        }



        // 1 - Check username validity
        let firstCharacter = trimmedUsername.charAt(0)
        let lastCharacter = trimmedUsername.charAt(trimmedUsername.length - 1)
        if (firstCharacter === ".") {
            setError(localization.username_start_error)
            return
        }
        if (lastCharacter === ".") {
            setError(localization.username_end_error)
            return
        }
        if (username.length > 26) {
            setError(localization.username_length_error)
            return
        }



        /* 2 - Check username availability
        */
        setIsLoading(true)
        let account_id = ""
        try {
            const accountMainDataAttributes = await getAccountMainDataAttributesByUsername(trimmedUsername, "account_id")
            account_id = accountMainDataAttributes?.account_id ?? ""
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }
        if (account_id !== "") {
            setIsLoading(false)
            setError(localization.not_available_username_error)
            return
        }

        // Slows down 
        setTimeout(() => {
            setIsLoading(false)
            dispatch(updateSignUpValue({ key: "username", value: trimmedUsername }))
            backHandler?.remove()
            navigation.navigate("ProfilePhotoInput")
        }, 250)



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
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} hide />
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.username} description={localization.username_input_description} />
                </View>



                <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30, paddingRight: 16 - 5 }]} >
                    <TextInput
                        ref={textInputRef}
                        onFocus={() => { setError("") }}
                        autoFocus={false}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        placeholder={localization.username}
                        value={username}
                        onChangeText={(newtext) => { checkUsernameValidity(username, newtext, setUsername, setError) }}
                        style={TEXT_STYLES.textInput16Medium}
                        placeholderTextColor='gray'
                        clearButtonMode="always"
                        returnKeyType='next'
                        onSubmitEditing={openNextPage}
                    />
                </View>


                {error ? <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} /> : null}


                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    isLoading={isLoading}
                    onPress={openNextPage}
                    condition={(username !== '')}
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


export default UsernameInput



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})