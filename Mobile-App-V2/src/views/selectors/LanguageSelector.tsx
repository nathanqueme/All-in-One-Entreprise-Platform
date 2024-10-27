//
//  LanguageSelector.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors, { ColorsInterface } from './../../assets/Colors'
import TextSytlesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'
import Divider from '../../components/ui/Divider'
import SearchBar from "../../components/ui/SearchBar"
import localization from '../../utils/localizations'
import { StatusBar, Text, View, TouchableOpacity, Keyboard, Modal, TouchableWithoutFeedback, FlatList, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LanguageMetadata } from '../../Data'
import { languagesInUserLocale } from './../../assets/LanguagesList'
import { ClassicHeader } from '../../components/Headers'




interface LanguageSelectorInterface {
    show: boolean
    setShow: any
    setSelectedLanguageMetadata: any
    alreadyUsedLanguageLocales: string[]
    isLoading?: boolean
    doNotCloseWhenSelect?: boolean
    comment?: string
}
function LanguageSelector({ show, setShow, setSelectedLanguageMetadata, alreadyUsedLanguageLocales, isLoading = false, doNotCloseWhenSelect: doNotCloseWhenSelect = false, comment = "" }: LanguageSelectorInterface) {

    // States
    const [search, setSearch] = useState('')



    // Values
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    let matchingLanguages = languagesInUserLocale.filter(e => { return e.name.toLowerCase().startsWith(search.toLowerCase()) })
        // Sorted aplhabetically 
        // See answer 1397 for more info : https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
        .sort(function (a, b) {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        })



    // Initialization
    useEffect(() => {

        if (!show) return
        setSearch('')

    }, [show])




    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <Modal
                onShow={() => { }}
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
                            headerText={localization.languages}
                            isLoading={isLoading}
                        />



                        <FlatList
                            data={matchingLanguages}
                            keyExtractor={e => { return e.locale }}
                            onScroll={() => { Keyboard.dismiss() }}
                            keyboardDismissMode={"on-drag"}
                            keyboardShouldPersistTaps={"always"}
                            ListHeaderComponent={
                                <View>
                                    {((comment ?? "") !== "") &&
                                        <Text style={[TEXT_STYLES.gray12Text, { marginHorizontal: 20, marginTop: 20, marginBottom: 10 }]}>{comment}</Text>
                                    }
                                    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                                        <SearchBar COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={search} setText={setSearch} becomeActive={false} />
                                    </View>

                                    {matchingLanguages.length !== 0 ? <Divider COLORS={COLORS} marginLeft={20} /> :
                                        <Text style={[TEXT_STYLES.callout, { marginHorizontal: 20, color: COLORS.black }]}>{localization.no_results_found}</Text>
                                    }

                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: insets.bottom }}
                            renderItem={({ item, index }) => (
                                <SelectableLanguageUi
                                    languageMetadata={item}
                                    onPress={() => {
                                        setSelectedLanguageMetadata(item)
                                        if (doNotCloseWhenSelect) return
                                        setShow(false)
                                    }}
                                    alreadyUsed={alreadyUsedLanguageLocales.includes(item.locale)}
                                    textColor={COLORS.black}
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                />
                            )}
                        />



                    </SafeAreaView>
                </SafeAreaProvider>


            </Modal>
        </TouchableWithoutFeedback>
    )
}





interface SelectableLanguageUiInterface {
    languageMetadata: LanguageMetadata
    onPress: () => any
    alreadyUsed: boolean
    textColor: string
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
function SelectableLanguageUi({ languageMetadata, onPress, alreadyUsed, textColor, COLORS, TEXT_STYLES }: SelectableLanguageUiInterface) {
    return (
        <View>
            <TouchableOpacity onPress={onPress} disabled={alreadyUsed} >
                <View
                    style={[{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        margin: 20,
                        opacity: alreadyUsed ? 0.25 : 1
                    }]}>

                    <Text
                        style={[
                            TEXT_STYLES.callout, {
                                color: textColor
                            }]
                        }>{languageMetadata.name}
                    </Text>

                </View>
            </TouchableOpacity>
            <Divider marginLeft={20} COLORS={COLORS} />
        </View>
    )
}





export default LanguageSelector

