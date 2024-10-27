//
//  ForgottenPassword.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React, { useState, useRef, useEffect } from 'react'
import getColors from '../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, TextInput, Keyboard, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { initiateChangingForgottenPassword } from '../../aws/cognito'




const ForgottenPassword = ({ navigation, route }) => {

    // States
    const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")


    // Navigation values 
    let openedFromSettings = route.params?.openedFromSettings ?? false


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)
    const textInputRef = useRef(null)



    // Initialization
    useEffect(() => {

        let oUsername = route?.params.username ?? ""
        if (oUsername !== "") setUsername(oUsername)
        setError("")
        setTimeout(() => {
            textInputRef.current.focus()
        }, 550)


    }, [])




    async function openNextPage() {

        // Preparation
        Keyboard.dismiss()
        if (username === "") {
            setError(localization.empty_email_and_username)
            return
        } else setError("")



        setIsLoading(true)
        let sentTo
        try {
            sentTo = await initiateChangingForgottenPassword(username.trim().toLowerCase())
        } catch (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }


        setIsLoading(false)
        navigation.navigate("NewPasswordInput", { username: username, sentTo: sentTo, openedFromSettings: openedFromSettings })
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
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.forgot_password} description={localization.enter_email_or_username} />
                </View>



                <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30, paddingRight: 16 - 5 }]} >
                    <TextInput
                        ref={textInputRef}
                        onFocus={() => { setError("") }}
                        autoFocus={false}
                        autoCorrect={false}
                        autoCapitalize={"none"}
                        placeholder={localization.email_address_or_username}
                        value={username}
                        onChangeText={text => setUsername(text)}
                        style={TEXT_STYLES.textInput16Medium}
                        placeholderTextColor='gray'
                        clearButtonMode="always"
                        returnKeyType='next'
                        onSubmitEditing={openNextPage}
                    />
                </View>


                {(error !== "") &&
                    <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} />
                }




                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onPress={openNextPage}
                    condition={(username !== '')}
                    text={localization.next}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                    isLoading={isLoading}
                />


            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default ForgottenPassword



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})
