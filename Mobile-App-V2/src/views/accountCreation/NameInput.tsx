//
//  NameInput.tsx
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
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'

// Global data 
import { useDispatch } from 'react-redux'
import { updateSignUpValue } from '../../state/slices/signUpSlice'




export default function NameInput({ navigation }) {

    // States
    const [name, setName] = useState('')
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
    }, [navigation])



    const openNextPage = () => {

        const trimmedName = name.trim()

        if (trimmedName === "") {
            setError(localization.empty_name)
            return
        }

        Keyboard.dismiss()
        dispatch(updateSignUpValue({ key: "account_name", value: trimmedName }))
        backHandler?.remove()
        navigation.navigate("UsernameInput")
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
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.name} description={localization.name_input_description} />
                </View>



                <View style={[MAIN_STYLES.valueInputContainer, { marginHorizontal: 30, paddingRight: 16 - 5 }]} >
                    <TextInput
                        ref={textInputRef}
                        onFocus={() => { setError("") }}
                        autoFocus={false}
                        autoCorrect={false}
                        autoCapitalize={'words'}
                        placeholder={localization.name}
                        value={name}
                        onChangeText={text => setName(text)}
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
                    onPress={openNextPage}
                    condition={(name !== '')}
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




const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})