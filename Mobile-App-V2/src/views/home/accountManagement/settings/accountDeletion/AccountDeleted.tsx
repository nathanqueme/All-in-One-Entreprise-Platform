//
//  AccountDeleted.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import getColors from './../../../../../assets/Colors'
import localization from '../../../../../utils/localizations'
import { useColorScheme, StatusBar, StyleSheet, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../../../../components/Headers'
import { CheckMarkCircleSymbol, ChevronLargeSymbol } from '../../../../../components/Symbols'
import { ClassicButton } from '../../../../../components/Buttons'
import TextSytlesProvider from '../../../../../components/styles/TextStyles'




const AccountDeleted = ({ navigation }) => {

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
                    <TitleAndSubTitle COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} title={localization.account_deleted} description={localization.account_successfully_deleted} />
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

                            navigation.navigate("Home")

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


export default AccountDeleted





const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})