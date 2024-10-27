//
//  AccountManager.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState } from 'react'
import getColors from '../../../assets/Colors'
import Divider from '../../../components/ui/Divider'
import CirclePhoto from '../../../components/ui/CirclePhoto'
import TextAndDescription from '../../../components/ui/TextAndDescription'
import localization from '../../../utils/localizations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Keychain from 'react-native-keychain'
import { View, StatusBar, ScrollView, Alert, useColorScheme } from 'react-native'
import { ClassicHeader } from '../../../components/Headers'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { CapsuleButton, SettingsButton } from '../../../components/Buttons'

// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../../state/slices/uiStatesSlice'
import { openAndLoadNewProfilePage } from '../../../state/slices/pagesSlice'
import { ActionEventObj, atag, getLogTime } from '../../../analytics'
import TextSytlesProvider from '../../../components/styles/TextStyles'



interface AccountManagerSheetInterface {
    navigation
}
export default function AccountManager({ navigation }: AccountManagerSheetInterface) {

    // States
    const [isSigningOut, setIsSigningOut] = useState(false)


    // Values 
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)

    // Global values 
    const uiStates = useSelector(selectUiStates)



    /**
     * - 1 - Clear cache containing session tokens 
     * - 2 - Clear cached profile photo
     * - 3 - Update Ui 
     * - 4 - Save on Analytics
     */
    async function signOut() {

        // Preparation
        setIsSigningOut(true)


        // 1 
        await Keychain.resetGenericPassword()
        let payload: updateUiStateValuePayload = { attribute: "account_id", value: "" }


        // 2
        await AsyncStorage.setItem("@user_account_main_data", "")
        let profilePhotoPayload: updateUiStateValuePayload = { attribute: "userAccountMainData", value: undefined }


        // 3
        setTimeout(() => {
            navigation.navigate("Home")
            setIsSigningOut(false)
            dispatch(updateUiStateValue(profilePhotoPayload))
            dispatch(updateUiStateValue(payload))
        }, 300)


        // 4 
        let event = ActionEventObj("log_out", getLogTime())
        dispatch(atag({ "event_type": "action", "event": event }))

    }


    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['right', 'left']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <View style={{ flex: 1, position: "absolute", top: insets.top, zIndex: 50, width: "100%" }}>
                    <ClassicHeader
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        onClose={() => { navigation.goBack() }}
                        closeButtonType={'chevronLeft'}
                        headerText={""}
                        onPress={() => { navigation.navigate('Settings') }}
                        showDivider={false}
                        backgroundColor={COLORS.clear}
                        buttonType={'settings'}
                    />
                </View>



                <ScrollView
                    style={{ height: `100%`, paddingTop: 44.5 + insets.top }}
                    keyboardDismissMode={'on-drag'}
                    keyboardShouldPersistTaps={'handled'}

                >
                    <View style={{ marginBottom: insets.bottom, justifyContent: 'flex-start' }}>



                        {/* Current selected account */}
                        <View
                            style={{
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 20,
                                paddingBottom: 16,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>

                            <CirclePhoto
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                base64={uiStates.userAccountMainData?.image_data?.base64 ?? ""}
                                widthAndHeight={80}
                                displayLetterIfNoPhoto={uiStates.userAccountMainData?.account_name?.slice(0, 1)}
                            />

                            <View style={{ marginTop: 10 }}>
                                <TextAndDescription
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    text={uiStates.userAccountMainData?.account_name ?? ""}
                                    description={uiStates.userAccountMainData?.username ?? ""}
                                    certificationBadge={uiStates.userAccountMainData?.certified ?? false}
                                    alignItemsCenter
                                />
                            </View>

                        </View>





                        {/* Buttons */}
                        <SettingsButton
                            settingsInfo={'your_information'}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            onPress={() => {
                                // Opens user's page
                                let payload: updateUiStateValuePayload = { attribute: "account_id", value: uiStates.userAccountMainData?.account_id ?? "" }
                                dispatch(updateUiStateValue(payload))
                                dispatch(openAndLoadNewProfilePage(uiStates.userAccountMainData?.account_id ?? "", uiStates.userAccountMainData?.short_id ?? "", navigation, uiStates.userAccountMainData?.username ?? "", true, true, true) as any)
                            }} />
                        <SettingsButton settingsInfo={'your_qr_code'} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} onPress={() => { navigation.navigate('QrCodePage') }} />
                        <Divider COLORS={COLORS} />
                        {/* TODO: In the futur replace symbol with "2 persons"or "3 persons" and replace the name "Analytics" by "(Your) Visibility" */}
                        <SettingsButton settingsInfo={'analytics'} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} onPress={() => { navigation.navigate('Analytics') }} />
                        <Divider COLORS={COLORS} />


                        {/* Sign out */}
                        <CapsuleButton
                            text={localization.sign_out}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            onPress={() => {
                                Alert.alert(localization.formatString(localization.sure_want_sign_out, uiStates.userAccountMainData?.username ?? "") as string, "",
                                    [
                                        { text: localization.cancel, onPress: () => { } },
                                        { text: localization.sign_out, style: 'destructive', onPress: async () => { await signOut() } },
                                    ]
                                )
                            }}
                            marginTop={3 * 5}
                            marginBottom={3 * 5}
                            marginHorizontal={3 * 5}
                            isLoading={isSigningOut}
                        />
                        <Divider COLORS={COLORS} />



                    </View>
                </ScrollView>







            </SafeAreaView>
        </SafeAreaProvider>
    )
}




