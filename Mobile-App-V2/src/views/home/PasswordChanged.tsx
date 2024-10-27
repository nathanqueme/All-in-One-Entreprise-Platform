//
//  PasswordChanged.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import getColors from './../../assets/Colors'
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { CheckMarkCircleSymbol, ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'
import TextSytlesProvider from '../../components/styles/TextStyles'



const PasswordChanged = ({ navigation, route }) => {

    // Navigation values 
    let { sentTo, openedFromSettings } = route.params

    // Values
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />



                {/* Header */}
                <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { }} hide={true} />
                    <TitleAndSubTitle COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} title={localization.password_changed} description={localization.formatString(localization.password_of_was_changed, sentTo) as string} />
                </View>



                <View style={{ paddingVertical: 20, justifyContent: "center", alignItems: "center" }}>
                    <CheckMarkCircleSymbol size={90} color={COLORS.darkBlue} />
                </View>



                <View style={{
                    paddingHorizontal: 30,
                    paddingVertical: 20,
                }}>
                    <ClassicButton
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        onPress={() => {

                            if (openedFromSettings) {
                                navigation.navigate("Account")
                            } else {
                                navigation.navigate("Login")
                            }

                        }}
                        text={localization.close}
                        topMargin={20}
                        backgroundColor={COLORS.darkBlue}
                        textColor={"white"}
                    />
                </View>



            </SafeAreaView>
        </SafeAreaProvider>

    )
}


export default PasswordChanged


const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})