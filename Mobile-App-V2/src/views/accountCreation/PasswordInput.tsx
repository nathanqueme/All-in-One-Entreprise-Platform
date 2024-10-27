//
//  PasswordInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, TextInput, TouchableOpacity, BackHandler, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol, EyeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'

// Global data 
import { useDispatch } from 'react-redux'
import { updateSignUpValue } from '../../state/slices/signUpSlice'




const PasswordInput = ({ navigation }) => {

    // States
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)


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





    // Show keyboard 
    useEffect(() => {
        setTimeout(() => {
            textInputRef.current.focus()
        }, 550)
    }, [])



    // Clear error
    useEffect(() => {
        setError("")
    }, [password])






    async function openNextPage() {
        if (password.length < 6) {
            setError(localization.empty_password)
            return
        }
        dispatch(updateSignUpValue({ key: "password", value: password }))
        backHandler?.remove()
        navigation.push('AddressInput')
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
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { }} hide={true} />
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.password} description={localization.password_input_description} />
                </View>



                <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30 }]} >
                    <View style={{ justifyContent: "flex-start", alignContent: "stretch", alignItems: "center", flexDirection: "row" }}>
                        <TextInput
                            ref={textInputRef}
                            onFocus={() => { setError("") }}
                            autoFocus={false}
                            placeholder={localization.password}
                            textContentType='newPassword'
                            value={password}
                            onChangeText={text => setPassword(text)}
                            style={TEXT_STYLES.textInput16MediumInRow}
                            placeholderTextColor='gray'
                            returnKeyType='next'
                            secureTextEntry={!showPassword}
                            onSubmitEditing={openNextPage}
                        />

                        <TouchableOpacity onPress={() => { setShowPassword(!showPassword) }} style={{ paddingRight: 12 }}>
                            <EyeSymbol COLORS={COLORS} size={22} outlined={showPassword} color={"gray"} />
                        </TouchableOpacity>
                    </View>
                </View>


                {error ? <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} /> : null}



                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    isLoading={isLoading}
                    onPress={openNextPage}
                    condition={password.length >= 6}
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


export default PasswordInput


const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})