//
//  PhoneNumberEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SectionAppearance from '../../components/ui/SectionAppearance'
import CountrySelector from '../selectors/CountrySelector'
import CountryAndCallingCode from '../../components/ui/CountryAndCallingCode'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, View, ScrollView, Keyboard, Modal, TouchableWithoutFeedback, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { getInfoMetada, InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { Page, PhoneNumber, PhoneNumberObj } from '../../Data'
import { updateAttribute } from '../../components/AttributeEditingFunctions'
import { allPhoneNumberWasChangedChecker, checkPhoneValidity, phoneNumberWasChangedChecker } from '../../components/functions'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, UiStatesInterface } from '../../state/slices/uiStatesSlice'
import TextSytlesProvider from '../../components/styles/TextStyles'





// A view to edit a value from the information page. (Description, account name, links, ...)
interface PhoneNumberEditorInterface {
    show: boolean
    setShow: any
    originalPhoneNumber: PhoneNumber
    setPhoneNumber: any
    updatesPhoneNumber?: boolean
    page?: Page
    username?: string
    phoneNumberCanBeDeleted?: boolean
}
const PhoneNumberEditor = ({ show, setShow, originalPhoneNumber, setPhoneNumber, updatesPhoneNumber = false, page, username, phoneNumberCanBeDeleted = false }: PhoneNumberEditorInterface) => {

    // States
    const [number, setNumber] = useState('')
    const [calling_code, setCallingCode] = useState('33')
    const [country_code, setCountryCode] = useState('FR')
    //
    const [error, setError] = useState('')
    const [showSelector, setShowSelector] = useState(false)


    // Global data
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let phoneNumberMetada = getInfoMetada('phoneNumber')
    let isNewPhoneNumber = originalPhoneNumber?.number ?? '' === ''
    let metadataFilled =
        number !== '' &&
        calling_code !== '' &&
        country_code !== ''
    let metadataWasChanged = phoneNumberWasChangedChecker(PhoneNumberObj(number, calling_code, country_code), originalPhoneNumber)




    // Initialization
    useEffect(() => {

        if (!show) return
        setNumber(originalPhoneNumber?.number ?? '')
        setCallingCode(originalPhoneNumber?.calling_code ?? '')
        setCountryCode(originalPhoneNumber?.country_code ?? '')

    }, [show])


    // Clear error
    useEffect(() => {
        setError("")
    }, [number, country_code])



    function closeViewAndResetSelectedInfoType() {
        setShow(false)
        dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: '' }))
    }


    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={show}
                onRequestClose={() => { setShow(false) }}
            >


                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                        <StatusBar
                            barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                            backgroundColor={COLORS.clear}
                            translucent
                        />


                        <ClassicHeader
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            onClose={() => { setShow(false) }}
                            closeButtonType={'cancelText'}
                            headerText={phoneNumberMetada?.placeholder ?? localization.value}
                            condition={phoneNumberCanBeDeleted || (isNewPhoneNumber ? metadataFilled : metadataFilled && metadataWasChanged)}
                            onPress={async () => {




                                let finalNumber = number.slice().trim().replace(/\s/g, '')
                                let isTooShort = finalNumber.length < 5
                                if (finalNumber === "" || isTooShort || country_code === "") {
                                    if (phoneNumberCanBeDeleted && finalNumber.length === 0) {
                                        setPhoneNumber(undefined); setShow(false)
                                        Keyboard.dismiss()
                                    } else {
                                        setError(localization.enter_valid_phone_number)
                                    }
                                    return
                                } else Keyboard.dismiss()
                                let newPhoneNumber = PhoneNumberObj(finalNumber, country_code, calling_code)




                                // Updates or launch update
                                switch (updatesPhoneNumber) {
                                    case false: setPhoneNumber(newPhoneNumber); setShow(false); break
                                    case true:
                                        try {
                                            await updateAttribute(dispatch, page, 'phoneNumber', newPhoneNumber, username, uiStates.jwtTokenWasRefreshed)
                                            closeViewAndResetSelectedInfoType()
                                        } catch (error) {
                                            alert(error)
                                            dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                                        }
                                }

                            }}
                            editedInfoType={'phoneNumber' as InformationType}
                            buttonType={'doneText'}
                            isLoading={uiStates.isUpdatingInfo}
                            displayOkButtonWhenInfoEdited={false}
                        />



                        <ScrollView
                            style={{ backgroundColor: COLORS.whiteGray }}
                            keyboardDismissMode={'on-drag'}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <View style={{ marginTop: 40 }}>
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={phoneNumberMetada?.placeholder ?? 'Value'} children={


                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        flexDirection: 'row',
                                        paddingLeft: 20,
                                        paddingRight: 16 - 5,
                                        backgroundColor: COLORS.whiteToGray2,
                                    }} >



                                        {/* Country code + Calling code */}
                                        <View style={{ paddingRight: 16 }} >
                                            <CountryAndCallingCode
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                country_code={country_code}
                                                calling_code={calling_code}
                                                onPress={() => { setShowSelector(true) }}
                                            />
                                        </View>




                                        {/* Number */}
                                        <InfoInput
                                            text={number}
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            setText={(newtext) => { checkPhoneValidity(number, newtext, setNumber, setError) }}
                                            style={'none'}
                                            infoType={'phoneNumber'}
                                            editedInfoType={'phoneNumber' as InformationType}
                                            setEditedInfoType={(infoType) => { if ((infoType ?? "") !== "") setError("") }}
                                            doneReturnKey={true}
                                            onSubmitEditing={() => { }}
                                            focusOnAppear={true}
                                        />
                                    </View>
                                } />





                            </View>


                            {(error ?? "") !== "" &&
                                <RedError COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} error={error} marginTop={20} marginH={20} alignItems={'flex-start'} />
                            }



                        </ScrollView>





                    </SafeAreaView>
                </SafeAreaProvider>



                {/* Modal */}
                <CountrySelector
                    displayCallingCodes={true}
                    showSelector={showSelector}
                    setShowSelector={setShowSelector}
                    handleSelection={(Country) => {
                        setCallingCode(Country.calling_code)
                        setCountryCode(Country.country_code)
                        setShowSelector(false)
                    }}
                />






            </Modal>
        </TouchableWithoutFeedback>
    )
}




export default PhoneNumberEditor
