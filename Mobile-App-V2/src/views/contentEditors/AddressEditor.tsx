//
//  AddressEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SectionAppearance from '../../components/ui/SectionAppearance'
import CountrySelector from '../selectors/CountrySelector'
import RedError from '../../components/ui/RedError'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import TextSytlesProvider from '../../components/styles/TextStyles'
import { StatusBar, View, ScrollView, Keyboard, Modal, TouchableWithoutFeedback, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { InfoInput, InfoInputWithNameAsButton } from '../../components/ui/ForContentEditors'
import { Geolocation, GeolocationObj, Page } from '../../Data'
import { getAddressDescription, geolocationWasChangedChecker } from '../../components/functions'
import { geocodeAddress } from '../../aws/location'
import { updateAttribute } from '../../components/AttributeEditingFunctions'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { SimpleCenteredButton } from '../../components/Buttons'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, UiStatesInterface } from '../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { EmojiAlert } from '../../components/ui/AlertUi'




// A view to edit a value from the information page. (Description, account name, links, ...)
interface AddressEditorInterface {
    show: boolean
    setShow: any
    originalGeolocation: Geolocation
    setGeolocation: any
    updatesAddress?: boolean
    page: Page
    username?: string
    addressCanBeDeleted?: boolean
}
const AddressEditor = ({ show, setShow, originalGeolocation, setGeolocation, updatesAddress = false, page, username, addressCanBeDeleted = true }: AddressEditorInterface) => {

    // States
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [country_code, setCountryCode] = useState('')
    //
    const [editedInfoType, setEditedInfoType] = useState('')
    const [showSelector, setShowSelector] = useState(false)
    const [error, setError] = useState("")


    // Global data
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let isNewAddress = (originalGeolocation?.country ?? '') === ''
    let metadataFilled =
        city !== '' &&
        country !== ''
    let metadataWasChanged = geolocationWasChangedChecker(GeolocationObj(city, country, "", "", street, ""), originalGeolocation)



    // Initialization
    useEffect(() => {

        if (!show) return
        setError("")
        setStreet(originalGeolocation?.street ?? '')
        setCity(originalGeolocation?.city ?? '')
        setCountryCode(originalGeolocation?.iso ?? '')
        // use user's acccount country as the default value so the user does not have to enter it each time.
        setCountry(originalGeolocation?.country ?? (pageAccountMainData?.account_main_data.geolocation.country ?? ''))


    }, [show])



    // Clear error
    useEffect(() => {
        setError("")
    }, [editedInfoType, street, city, country, country_code])



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
                onRequestClose={() => { closeViewAndResetSelectedInfoType() }}
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
                            headerText={localization.address} // Displays address when no value is edited.
                            condition={isNewAddress ? metadataFilled : metadataFilled && metadataWasChanged}
                            onPress={async () => {

                                let addressAsGeolocation = GeolocationObj(city, country, '', '', street, '')
                                Keyboard.dismiss()

                                // Update or launch update
                                switch (updatesAddress) {
                                    case false:

                                        setGeolocation(addressAsGeolocation)
                                        setShow(false)
                                        break

                                    case true:


                                        // 1 - Update UI
                                        // Displays 'ActivityIndicator'
                                        setError('')
                                        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: true }))



                                        // 2 - Geocode the address to obtain a geolocation
                                        let newGeolocation
                                        let addressDescription = getAddressDescription(addressAsGeolocation)


                                        // 
                                        try {
                                            const { iso, zip, region, longitude, latitude } = await geocodeAddress(addressDescription)
                                            newGeolocation = GeolocationObj(city, country, iso, region, street, zip, latitude, longitude)
                                        } catch (error) {
                                            alert(getErrorDescription(error).message)
                                            dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                                            return
                                        }




                                        // 3 - Update value 
                                        try {
                                            await updateAttribute(dispatch, page, 'geolocation', newGeolocation, username, uiStates.jwtTokenWasRefreshed)
                                            closeViewAndResetSelectedInfoType()
                                        } catch (error) {
                                            alert(error)
                                            dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                                        }
                                        break
                                }

                            }}
                            editedInfoType={editedInfoType as InformationType}
                            setEditedInfoType={setEditedInfoType}
                            buttonType={'doneText'}
                            isLoading={uiStates.isUpdatingInfo}
                            displayOkButtonWhenInfoEdited={true}
                        />



                        <ScrollView
                            style={{ backgroundColor: COLORS.whiteGray }}
                            keyboardDismissMode={'on-drag'}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <View style={{ marginTop: 40 }}>



                                {/* Street + City */}
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.main_info} children={
                                    <View>
                                        <InfoInput
                                            text={street}
                                            setText={setStreet}
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            style={'with_name'}
                                            infoType={'street'}
                                            autoCapitalize={'words'}
                                            editedInfoType={editedInfoType as InformationType}
                                            setEditedInfoType={setEditedInfoType}
                                            customPlaceholder={localization.street_address_optional}
                                            doneReturnKey={false}
                                            focusOnAppear={true}
                                        />

                                        <Divider COLORS={COLORS} marginLeft={110} />

                                        <InfoInput
                                            text={city}
                                            setText={setCity}
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            style={'with_name'}
                                            infoType={'city'}
                                            autoCapitalize={'words'}
                                            editedInfoType={editedInfoType as InformationType}
                                            setEditedInfoType={setEditedInfoType}
                                            doneReturnKey={false}
                                        />
                                    </View>
                                } />






                                {/* Error */}
                                {(error !== '') &&
                                    <RedError
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        error={error}
                                        marginTop={20}
                                        marginH={20}
                                        alignItems={'flex-start'}
                                        textAlign={'left'}
                                    />
                                }




                                {/* Country */}
                                <View style={{ paddingTop: 35 }}>
                                    <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.additional_info} children={
                                        <InfoInputWithNameAsButton
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            infoType={'country'}
                                            infoValue={country}
                                            onPress={() => { setShowSelector(true) }}
                                        />
                                    } />
                                </View>




                                {/* Delete button */}
                                {(!isNewAddress && addressCanBeDeleted) &&
                                    <SimpleCenteredButton
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        text={localization.delete}
                                        onPress={() => {
                                            setGeolocation(undefined)
                                            setShow(false)
                                        }}
                                        destructiveColor={true}
                                        marginVertical={35}
                                    />
                                }






                            </View>
                        </ScrollView>





                    </SafeAreaView>
                </SafeAreaProvider>



                {/* Modal */}
                <CountrySelector
                    displayCallingCodes={false}
                    showSelector={showSelector}
                    setShowSelector={setShowSelector}
                    handleSelection={(Country) => {

                        setCountry(Country.name)
                        setCountryCode(Country.country_code)
                        setShowSelector(false)

                    }}
                />
                <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />



            </Modal>
        </TouchableWithoutFeedback>
    )
}




export default AddressEditor
