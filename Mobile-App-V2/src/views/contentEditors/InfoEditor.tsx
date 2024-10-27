//
//  InfoEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import RedError from "../../components/ui/RedError"
import localization from '../../utils/localizations'
import { StatusBar, View, ScrollView, Keyboard, Text, Alert, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { InformationType, getInfoMetada } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { LinkObj, Page } from '../../Data'
import { updateAttribute, updateEmailAttribute } from '../../components/AttributeEditingFunctions'
import { checkUsernameValidity } from '../../components/functions'

// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { selectUiStates, updateUiStateValue, UiStatesInterface } from '../../state/slices/uiStatesSlice'
import { selectPagesProfiles } from '../../state/slices/profilesSlice'
import { EmojiAlert } from '../../components/ui/AlertUi'
import TextSytlesProvider from '../../components/styles/TextStyles'




// A view to edit a value from the 'AccountInfoPage'. (Description, account name, links, ...)
const InfoEditor = ({ navigation, route }) => {

    // States 
    const [originalValue, setOriginalValue] = useState('')
    const [value, setValue]: [string, any] = useState('')
    const [autoCorrect, setAutoCorrect] = useState(true)
    //
    const [error, setError] = useState('')
    const [editedInfoType, setEditedInfoType] = useState('')


    // Navigation values 
    const { page } = route.params
    const { page_number, account_id } = page as Page


    // Global data
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page_number })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page_number })
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const username = pageAccountMainData?.account_main_data.username ?? ''
    const { selectedInfoType, selectedInfoValue, isUpdatingInfo, updatedAppearance } = uiStates
    let infoMetada = getInfoMetada(selectedInfoType)


    // Initialization
    useEffect(() => {

        // Shallow copy see (1) in the "PostEditor" for explanations
        setOriginalValue(typeof selectedInfoValue === "object" ? Object.assign({}, selectedInfoValue) : selectedInfoValue)

        setValue(selectedInfoValue)
        setError('')
        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
        dispatch(updateUiStateValue({ attribute: 'updatedAppearance' as keyof UiStatesInterface, value: false }))

        switch (selectedInfoType) {
            case 'username':
            case 'email':
            case 'website_link': setAutoCorrect(false); break
            default: break
        }



    }, [])



    // Clear error
    useEffect(() => {
        setError("")
    }, [editedInfoType])



    // Updated email 
    useEffect(() => {

        setError('')
        // Once the confirmation code view disappears that one re-appears and needs to be able to re-edit the email address so the original value has to be updated.
        if (updatedAppearance) setOriginalValue(value)

    }, [updatedAppearance])


    // Indicates if an info can be updated based on its type and value (e.g. a description can be updated has empty but the account's name can not.)
    function canBeUpdated() {
        let wasModified = originalValue !== value

        switch (selectedInfoType) {
            case 'website_link': return wasModified
            default: return wasModified && value !== ''
        }

    }


    function closeViewAndResetSelectedInfoType() {
        navigation.goBack()
        dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: '' }))
    }


    async function launchUpdate() {
        // Launch update
        switch (selectedInfoType) {
            // A
            case 'email':
                try {
                    await updateEmailAttribute(dispatch, page, value, username, uiStates.jwtTokenWasRefreshed, navigation)
                } catch (error) {
                    alert(error)
                    dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                }
                break


            // B 
            default:
                try {

                    // Format data before 
                    let valueToUpdate
                    switch (selectedInfoType) {
                        case 'website_link': valueToUpdate = LinkObj('Website', value); break
                        default: valueToUpdate = value; break
                    }
                    await updateAttribute(dispatch, page, selectedInfoType, valueToUpdate, username, uiStates.jwtTokenWasRefreshed, pageProfile.profile.links?.slice() ?? [])
                    closeViewAndResetSelectedInfoType()

                } catch (error) {
                    alert(error)
                    dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                }
                break


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


                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { closeViewAndResetSelectedInfoType() }}
                    closeButtonType={updatedAppearance ? 'chevronLeft' : 'cancelText'}
                    headerText={infoMetada?.name ?? ""}
                    condition={canBeUpdated()}
                    onPress={async () => {


                        setError('')
                        Keyboard.dismiss()


                        if (selectedInfoType == 'username') {
                            Alert.alert(localization.sure_want_change_username, localization.changing_username_will_change_qr_warning,
                                [
                                    { text: localization.cancel, onPress: () => { } },
                                    { text: localization.ok, style: 'destructive', onPress: async () => { launchUpdate() } },
                                ]
                            )
                        }
                        else launchUpdate()




                    }}
                    editedInfoType={selectedInfoType}
                    setEditedInfoType={setEditedInfoType}
                    buttonType={updatedAppearance ? undefined : 'doneText'}
                    isLoading={isUpdatingInfo}
                />



                <ScrollView
                    style={{ backgroundColor: COLORS.whiteGray }}
                    keyboardDismissMode={'on-drag'}
                    keyboardShouldPersistTaps={'handled'}
                >



                    {/* 
                       All info with a single input expected : 
                       - the 'description'
                       - 'address' + 'phone_number' as they have multiple inputs filed. 
                    */}
                    <View style={{ marginTop: 40 }}>
                        <InfoInput
                            text={value}
                            setText={(text) => {

                                setError('')

                                if (selectedInfoType === "username") {
                                    checkUsernameValidity(username, text, setValue, setError)
                                } else {
                                    setValue(text)
                                }


                                if (uiStates.updatedAppearance) {
                                    dispatch(updateUiStateValue({ attribute: 'updatedAppearance' as keyof UiStatesInterface, value: false }))
                                }
                            }}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            style={'section'}
                            infoType={selectedInfoType}
                            editedInfoType={editedInfoType as InformationType}
                            setEditedInfoType={setEditedInfoType}
                            doneReturnKey={true}
                            focusOnAppear={true}
                            autoCorrect={autoCorrect}
                            phoneKeyboard={selectedInfoType === "phoneNumber"}
                        />
                    </View>






                    {/* Email updated text */}
                    {updatedAppearance &&
                        <Text
                            style={{
                                textAlign: 'left',
                                padding: 20,
                                fontSize: 13,
                                color: COLORS.darkBlue
                            }}
                        >{selectedInfoType ?
                            localization.email_address_successfully_updated
                            :
                            localization.phone_number_successfully_updated}
                        </Text>
                    }


                    {/* Error */}
                    {error !== '' &&
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




                </ScrollView>

            </SafeAreaView>


            {/* Modals */}
            <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />


        </SafeAreaProvider>
    )
}



export default InfoEditor
