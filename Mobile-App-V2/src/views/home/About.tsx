//
//  About.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import getColors, { ColorsInterface } from '../../assets/Colors'
import TextStylesProvider from '../../components/styles/TextStyles'
import localization from '../../utils/localizations'
import { version } from '../../../package.json'
import { Text, View, StatusBar, ScrollView, useColorScheme, Pressable, TouchableOpacity, StyleSheet, Dimensions, Appearance } from 'react-native'
import { ClassicHeader } from '../../components/Headers'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { openLinkWithInAppWeb } from '../../components/functions'



function Account({ navigation }) {


    // Values 
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)


    let extraInfosUI =
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 30,
            }}>


            {/* App name copyrighted (later) */}
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                    TEXT_STYLES.gray13Text, {
                        paddingHorizontal: 35
                    }]
                }>{localization.copyright_all_rights_reserved}</Text>




            {/* Links */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 4
                }}
            >{<LinkCell
                text={localization.terms}
                link={"https://about.atsight.ch/terms"}
                paddingLeft={35}
                COLORS={COLORS}
            />}



                { // Placed insice a button to align it properly 
                    <Pressable>
                        <Text style={getStyles(COLORS).black13Text}>{"  |  "}</Text>
                    </Pressable>
                }



                {<LinkCell
                    text={localization.privacy}
                    link={"https://about.atsight.ch/privacy"}
                    paddingRight={35}
                    COLORS={COLORS}
                />}
            </View>


        </View>




    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
            <StatusBar
                barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                backgroundColor={COLORS.clear}
                translucent
            />


            <ClassicHeader
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                onClose={() => { navigation.goBack() }}
                closeButtonType={'chevronLeft'}
                headerText={localization.about}
                onPress={() => { }}
            />



            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: insets.bottom
                }}>
                {/* Aligns properly */}
                <View style={{ opacity: 0 }}>
                    {extraInfosUI}
                </View>





                {/* Logo + text */}
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>

                    {/* Description */}
                    <Text
                        style={[
                            TEXT_STYLES.medium14,
                            { paddingTop: 10, color: COLORS.smallGrayText, justifyContent: "center", textAlign: "center", paddingHorizontal: 40 }
                        ]}>{localization.atsight_history}</Text>

                    {/* Version */}
                    <Text style={[
                        TEXT_STYLES.gray13Text, {
                            paddingHorizontal: 30,
                            marginTop: 6,
                            textAlign: 'center'
                        }]}>{localization.version} {version}</Text>

                </View>





                {/* Branding (later with copyright mention) + additionnal ressources  */}
                {extraInfosUI}







            </ScrollView>
        </SafeAreaView>
    )
}



export default Account





function LinkCell({ text, link, paddingLeft = 0, paddingRight = 0, COLORS }) {
    const styles = getStyles(COLORS)
    return (
        <TouchableOpacity
            onPress={() => { openLinkWithInAppWeb(link) }}
            style={{ flex: 1, height: 30, justifyContent: "center", alignItems: "center" }}>
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.black13Text, { paddingLeft: paddingLeft, paddingRight: paddingRight }]}>{text}</Text>
        </TouchableOpacity >
    )
}



function getStyles(COLORS: ColorsInterface) {
    return {
        black13Text: {
            fontSize: 13,
            color: COLORS.black
        }
    }
}

