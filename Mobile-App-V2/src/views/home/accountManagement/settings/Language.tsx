//
//  Language.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import getColors from './../../../../assets/Colors'
import TextSytlesProvider from '../../../../components/styles/TextStyles'
import localization from '../../../../utils/localizations'
import { StatusBar, StyleSheet, View, Text, Linking, Platform, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../../../components/Headers'
import { ChevronLargeSymbol } from '../../../../components/Symbols'
import { ClassicButton } from '../../../../components/Buttons'



const Language = ({ navigation }) => {

    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
             <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


            <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} />
                <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.display_language} description={localization.change_language_steps} />
            </View>



            <Text style={[
                TEXT_STYLES.calloutMedium, {
                    paddingHorizontal: 30,
                    paddingVertical: 20,
                    color: COLORS.black
                }]}>{Platform.OS === "ios" ?
                    localization.appleLanguageIndications
                    :
                    localization.androidLanguageIndications
                }</Text>


            {Platform.OS === "ios" &&
                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onPress={async () => { await Linking.openSettings() }}
                    text={localization.continue}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                />
            }


        </SafeAreaView>
    )
}

export default Language







const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})


















/*

//
//  Language.tsx
//  atSight (Any_id_RN2)
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, StyleSheet, View, Text, Linking, Platform, FlatList, Pressable } from 'react-native'
import getColors from '../../../../assets/Colors'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import TextSty from '../../../components/styles/'
import { ClassicHeader } from '../../../components/Headers'
import SelectedCircle from './../../../components/ui/SelectedCircle'
import { ClassicButton } from '../../../components/Buttons'
import localization from '../../../utils/localizations'
import { appSupportedLanguageLocales, getUserPreferredLocale, languagesInUserLocale } from '../../../../assets/LanguagesList'
import { useEffect } from 'react'
import { useState } from 'react'




const Language = ({ navigation }) => {

    // States 
    /*
    const [userLocale, setUserLocale]: [string, any] = useState()


    // Values 
    const insets = useSafeAreaInsets()


    // Initialization
    useEffect(() => {

        setUserLocale(getUserPreferredLocale().split("-")[0] ?? "en")
        AsyncStorage.setItem('@user_locale', userLocale)

    }, [])
*/

    
   //  return (
       /*
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={['top', 'right', 'left']}>
                <StatusBar barStyle='dark-content' backgroundColor={COLORS.white} />


                <ClassicHeader
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={"chevronLeft"}
                    headerText={localization.display_language}
                />



                {Platform.OS !== "ios" ?
                    <View>
                        <Text style={[
                            TEXT_STYLES.calloutMedium, {
                                paddingHorizontal: 30,
                                paddingVertical: 20,
                                color: COLORS.black
                            }]}>{localization.appleLanguageIndications}</Text>



                        <ClassicButton
                            onPress={async () => { await Linking.openSettings() }}
                            text={localization.continue}
                            topMargin={20}
                            horizontalMargin={30}
                            backgroundColor={COLORS.darkBlue}
                            textColor={COLORS.white}
                        />
                    </View>
                    :


                    <FlatList
                        data={appSupportedLanguageLocales}
                        keyExtractor={e => { return e }}
                        ListHeaderComponent={
                            <Text style={[TEXT_STYLES.gray13Text, { padding: 20 }]}>{"Select the language that you want and restart the application."}</Text>
                        }
                        contentContainerStyle={{ paddingBottom: insets.bottom }}
                        renderItem={({ item, index }) => (

                            <SelectableLanguage
                                locale={item}
                                selectedLocale={userLocale}
                                setUserLocale={setUserLocale}
                            />

                        )}
                    />

                }



            </SafeAreaView>
        </SafeAreaProvider>
    
  //   )
// } 

// export default Language







const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})



*/



/*
// A selectable category with its name and selectedCircle.
interface SelectableLanguageInterface {
    locale: string
    selectedLocale: string
    setUserLocale: any
}
const SelectableLanguage = ({ locale, selectedLocale, setUserLocale }: SelectableLanguageInterface) => {

    // UI States values
    let isSelected = locale === (selectedLocale ?? "")


    function getLanguageNameInUserLanguage() {
        let language = languagesInUserLocale.find(e => e.locale === locale) ?? { name: "", locale: locale }
        return language.name
    }


    return (
        <Pressable
            onPress={() => { setUserLocale(locale) }}
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                marginHorizontal: 20,
            }}>

            <View
                style={{
                    height: 60,
                    justifyContent: "center",
                    alignSelf: "flex-start",
                    flex: 1
                }}>
                <Text
                    numberOfLines={1}
                    // adjustsFontSizeToFit issues on android : makes (really) small even when not needed
                    style={[TEXT_STYLES.callout, { color: COLORS.black, marginRight: 20 }]}
                >{getLanguageNameInUserLanguage()}</Text>
            </View>

            <SelectedCircle isSelected={isSelected} />

        </Pressable>
    )
}
*/

