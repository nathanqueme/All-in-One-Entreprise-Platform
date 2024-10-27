//
//  Settings.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import getColors from './../../../../assets/Colors'
import localization from '../../../../utils/localizations'
import { StatusBar, ScrollView, Alert, useColorScheme } from 'react-native'
import { ClassicHeader } from '../../../../components/Headers'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SettingsButton } from '../../../../components/Buttons'
import { ScreenViewTracker } from '../../../../analytics'
import TextSytlesProvider from '../../../../components/styles/TextStyles'



function Settings({ navigation }) {


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)


    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"settings"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />




                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'chevronLeft'}
                    headerText={localization.settings}
                    onPress={() => { }}
                />




                <ScrollView contentContainerStyle={{ justifyContent: 'center', paddingBottom: insets.bottom }}>
                    <SettingsButton
                        settingsInfo={"change_password"}
                        onPress={() => {
                            navigation.navigate("ForgottenPassword", { username: "", openedFromSettings: true })
                        }}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                    />
                    <SettingsButton
                        settingsInfo={"language"}
                        onPress={() => { navigation.navigate("Language") }}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                    />
                    <SettingsButton
                        settingsInfo={"delete_account"}
                        onPress={() => {

                            Alert.alert(localization.sure_want_delete_account, localization.deleting_account_will,
                                [
                                    { text: localization.cancel, onPress: () => { } },
                                    {
                                        text: localization.delete, style: 'destructive', onPress: async () => {
                                            navigation.push("AccountDeletionPage")
                                        }
                                    },
                                ]
                            )

                        }}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                    />
                </ScrollView>
            </SafeAreaView>


        </SafeAreaProvider>
    )
}






export default Settings



