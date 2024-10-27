//
//  PhoneNumberInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import RedError from "../../components/ui/RedError"
import CountrySelector from '../selectors/CountrySelector'
import CountryAndCallingCode from '../../components/ui/CountryAndCallingCode'
import localization from '../../utils/localizations'
import { checkPhoneValidity } from '../../components/functions'
import { StatusBar, StyleSheet, View, TextInput, Keyboard, BackHandler, useColorScheme } from "react-native"
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { PhoneNumberObj } from '../../Data'


// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { updateSignUpValue, selectSignUpValues } from '../../state/slices/signUpSlice'




const PhoneNumberInput = ({ navigation }) => {

    // States
    const [showSelector, setShowSelector] = useState(false)
    const [calling_code, setCallingCode] = useState('33')
    const [country_code, setCountryCode] = useState('FR')
    const [number, setNumber] = useState('')
    const [error, setError] = useState('')


    // Global data
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)
    const signUpValues = useSelector(selectSignUpValues)
    const textInputRef = useRef(null)



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





    const openNextPage = () => {
        Keyboard.dismiss()
        const trimmedNumber = number.slice().trim().replace(/\s/g, '')
        if (trimmedNumber === "" || trimmedNumber.length < 5 || country_code === "") {
            setError(localization.enter_valid_phone_number)
            return
        }


        dispatch(updateSignUpValue({ key: "phoneNumber", value: PhoneNumberObj(trimmedNumber, country_code.trim(), calling_code.trim()) }))
        backHandler?.remove()
        navigation.navigate("NameInput")
    }



    useEffect(() => {
        setTimeout(() => {
            textInputRef.current.focus()
        }, 550)
    }, [])



    useEffect(() => {
        setError("")
    }, [number, country_code])



    useEffect(() => {
        let calling_code = signUpValues.phoneNumber.calling_code.trim()
        if (calling_code) { setCallingCode(calling_code) }

        let country_code = signUpValues.phoneNumber.country_code.trim()
        if (country_code) { setCountryCode(country_code) }

    }, [signUpValues.phoneNumber])






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
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.phone_number} description={localization.phone_input_description} />
                </View>



                <View style={[
                    MAIN_STYLES.valueInputContainer, {
                        marginHorizontal: 30,
                        paddingRight: 16 - 5,
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        flexDirection: 'row',
                    }]}
                >



                    <View style={{ paddingLeft: 16 }} >
                        <CountryAndCallingCode
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            country_code={country_code}
                            calling_code={calling_code}
                            onPress={() => { setShowSelector(true) }}
                        />
                    </View>






                    <TextInput
                        ref={textInputRef}
                        onFocus={() => { setError("") }}
                        autoFocus={false}
                        placeholder={localization.phone_number}
                        value={number}
                        onChangeText={(newtext) => { checkPhoneValidity(number, newtext, setNumber, setError) }}
                        style={[TEXT_STYLES.textInput16Medium, { flexShrink: 1 }]}  // flexShrink: 1 makes the text clipped inside the gray capsule + (on iOS makes the clearButton visible)
                        placeholderTextColor='gray'
                        clearButtonMode="always"
                        returnKeyType='next'
                        keyboardType='phone-pad'
                        dataDetectorTypes={"phoneNumber"}
                        onSubmitEditing={openNextPage}
                    />
                </View>


                {error ? <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} /> : null}


                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onPress={openNextPage}
                    condition={(number !== '')}
                    text={localization.next}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                />



                <CountrySelector
                    displayCallingCodes={true}
                    showSelector={showSelector}
                    setShowSelector={setShowSelector}
                    handleSelection={(Country) => {
                        dispatch(updateSignUpValue({ key: "phoneNumber", value: PhoneNumberObj(signUpValues.phoneNumber.number, Country.country_code, Country.calling_code) }))
                        setShowSelector(false)
                    }}
                />



            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default PhoneNumberInput



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})