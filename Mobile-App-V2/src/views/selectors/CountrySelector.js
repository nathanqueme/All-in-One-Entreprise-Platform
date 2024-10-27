//
//  CountrySelector.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React, { useState, useEffect } from 'react'
import getColors from '../../assets/Colors'
import SearchBar from "../../components/ui/SearchBar"
import TextSytlesProvider from '../../components/styles/TextStyles'
import localization from '../../utils/localizations'
import countriesInUserLanguage from '../../assets/CountriesList'
import Divider from '../../components/ui/Divider'
import { StatusBar, Text, View, TouchableOpacity, Keyboard, Modal, TouchableWithoutFeedback, FlatList, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ClassicHeader } from '../../components/Headers'




const CountrySelector = ({ displayCallingCodes, showSelector, setShowSelector, handleSelection }) => {

    // States
    const [search, setSearch] = useState('')
    const [countries, setCountries] = useState([])


    // Values
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let matchingCountries =
        countries.filter(Country => { return Country.name.toLowerCase().startsWith(search.toLowerCase().trim()) || Country.calling_code.startsWith(search.trim()) })
            // Sorted aplhabetically 
            // See answer 1397 for more info : https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            .sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })



    function getCountries() {
        console.log("\n\n\n-------------Init countries-------------")

        setCountries(countriesInUserLanguage)

    }


    // Initialization
    useEffect(() => {
        if (!showSelector) {
            setCountries([])
            setSearch('')
        }
        else {
            setTimeout(() => {
                getCountries()
            }, 400)
        }

    }, [showSelector])





    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <Modal
                onShow={() => { }}
                animationType="slide"
                transparent={true}
                visible={showSelector}
                onRequestClose={() => { setShowSelector(false) }}
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
                            onClose={() => {
                                Keyboard.dismiss()
                                setShowSelector(false)
                            }}
                            closeButtonType={'cancelText'}
                            headerText={displayCallingCodes ? localization.calling_codes : localization.countries}
                        />






                        <FlatList
                            data={matchingCountries}
                            keyExtractor={e => { return e.country_code }}
                            contentContainerStyle={{ paddingBottom: insets.bottom }}
                            keyboardDismissMode={"on-drag"}
                            keyboardShouldPersistTaps={"always"}
                            ListHeaderComponent={
                                <View>
                                    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                                        <SearchBar COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={search} setText={setSearch} becomeActive={false} />
                                    </View>

                                    {countries.length > 0 ?
                                        matchingCountries.length !== 0 ? <Divider COLORS={COLORS} marginLeft={20} /> :
                                            <Text style={[TEXT_STYLES.callout, { marginHorizontal: 20, color: COLORS.black }]}>{localization.no_results_found}</Text>
                                        :
                                        null
                                    }

                                </View>
                            }
                            renderItem={({ item }) => (
                                <View>
                                    <SelectableCountryUi
                                        country={item}
                                        displayCallingCodes={displayCallingCodes}
                                        onPress={() => {
                                            handleSelection(item)
                                            Keyboard.dismiss()
                                        }}
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                    />
                                    <Divider COLORS={COLORS} marginLeft={20} />
                                </View>
                            )}
                        />




                    </SafeAreaView>
                </SafeAreaProvider>


            </Modal>
        </TouchableWithoutFeedback>
    )
}




/**
 * 
 * The name of the language and optionally its country code at the right.
 * e.g. : Switzerland +41      
 * 
*/
const SelectableCountryUi = ({ country, displayCallingCodes, onPress, COLORS, TEXT_STYLES }) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[{ alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', margin: 20 }]}>
                <Text style={[TEXT_STYLES.callout, { color: COLORS.black }]}>{country.name}</Text>

                {displayCallingCodes ? <Text style={[TEXT_STYLES.callout, { color: COLORS.black }]}>+{country.calling_code}</Text> : null}
            </View>

        </TouchableOpacity>
    )
}





export default CountrySelector

