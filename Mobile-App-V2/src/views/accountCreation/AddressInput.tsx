//
//  AddressInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors from './../../assets/Colors'
import MainStylesProvider from '../../components/styles/MainStyles'
import TextStylesProvider from '../../components/styles/TextStyles'
import MultipleInputsContainer from '../../components/ui/MultipleInputsContainer'
import CountrySelector from '../selectors/CountrySelector'
import localization from '../../utils/localizations'
import { StatusBar, Text, TextInput, View, Pressable, Keyboard, TouchableWithoutFeedback, BackHandler, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import { ArrowUpAndDownSymbol } from '../../components/Symbols'
import { GeolocationObj } from '../../Data'


// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { updateSignUpValue, selectSignUpValues } from '../../state/slices/signUpSlice'




export default function AddressInput({ navigation }) {

    // States
    const [showSelector, setShowSelector] = useState(false)
    const [keyboardShown, setKeyboardShown] = useState(false)
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')


    // Values 
    // Handles actions after return keyboard pressed
    const firstTextInputRef = useRef(null)
    const secondTextInputRef = useRef(null)
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const MAIN_STYLES = MainStylesProvider.getStyles(COLORS)


    // Global data
    const signUpValues = useSelector(selectSignUpValues)
    const dispatch = useDispatch()




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





    function openNextPage() {
        dispatch(updateSignUpValue({ key: "geolocation", value: GeolocationObj(city.trim(), country.trim(), '', '', street.trim(), '') }))
        backHandler?.remove()
        navigation.navigate("PhoneNumberInput")
    }


    useEffect(() => {
        let country = signUpValues.geolocation.country
        if (country) { setCountry(country) }


    }, [signUpValues.geolocation.country])



    useEffect(() => {

        dispatch(updateSignUpValue({ key: "geolocation", value: GeolocationObj('', '', '', '', '', '') })) // Reset country_code
        setCountry("") // Clear UI due to other useeffect above

        setTimeout(() => {
            if (keyboardShown) return // Avoids showing keyboard once modal disappeared
            firstTextInputRef.current.focus()
            setKeyboardShown(true)
        }, 550)

    }, [])




    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }} >
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />


                    {/* Header */}
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 30 }}>
                        <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { }} hide={true} />
                        <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.address} description={localization.address_input_description} />
                    </View>



                    <MultipleInputsContainer
                        COLORS={COLORS}
                        firstTextInput={
                            <TextInput
                                ref={firstTextInputRef}
                                autoFocus={false}
                                placeholder={localization.street_address}
                                value={street}
                                onChangeText={text => setStreet(text)}
                                style={TEXT_STYLES.textInput16Medium}
                                placeholderTextColor='gray'
                                clearButtonMode="always"
                                autoCapitalize='words'
                                returnKeyType='next'
                                onSubmitEditing={() => { secondTextInputRef.current.focus() }}
                                blurOnSubmit={false}
                            />}
                        secondTextInput={
                            <TextInput
                                ref={secondTextInputRef}
                                placeholder={localization.city}
                                value={city}
                                onChangeText={text => setCity(text)}
                                style={TEXT_STYLES.textInput16Medium}
                                placeholderTextColor='gray'
                                clearButtonMode="always"
                                autoCapitalize='words'
                                returnKeyType='default'
                            />
                        }
                    />



                    <Pressable onPress={() => { setShowSelector(true) }}
                        style={[MAIN_STYLES.valueInputContainer, { alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 30, marginTop: 20 }]} >
                        <Text style={{
                            color: country ? COLORS.black : 'gray',
                            fontSize: 16,
                            padding: 16,
                            fontWeight: '500', // medium
                        }}>{country ? country : localization.country}</Text>
                        <View style={{ paddingRight: 16 }}>
                            <ArrowUpAndDownSymbol />
                        </View>
                    </Pressable>


                    <View style={{
                        paddingHorizontal: 30,
                        paddingVertical: 20,
                    }}>
                        <ClassicButton
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            onPress={openNextPage}
                            condition={(street !== '' && city !== '' && country !== '')}
                            text={localization.next}
                            topMargin={20}
                            backgroundColor={COLORS.darkBlue}
                            textColor={"white"}
                        />
                    </View>



                    <CountrySelector
                        displayCallingCodes={false}
                        showSelector={showSelector}
                        setShowSelector={setShowSelector}
                        handleSelection={(Country) => {
                            dispatch(updateSignUpValue({ key: "geolocation", value: GeolocationObj(city, Country.name, Country.country_code, '', street, '') }))
                            setShowSelector(false)
                        }}
                    />






                </SafeAreaView>
            </SafeAreaProvider>
        </TouchableWithoutFeedback>
    )
}



