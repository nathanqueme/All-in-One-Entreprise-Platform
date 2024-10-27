//
//  AccountTypeSelector.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState } from 'react'
import getColors from './../../assets/Colors'
import TextStylesProvider from '../../components/styles/TextStyles'
import SelectedCircle from '../../components/ui/SelectedCircle'
import localization from '../../utils/localizations'
import { useColorScheme, StatusBar, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ClassicButton } from '../../components/Buttons'


// Global data 
import { useDispatch } from 'react-redux'
import { updateSignUpValue } from '../../state/slices/signUpSlice'
import { accountTypeDescritpions } from '../../utils/typesLocalizations'



export default function AccountTypeSelector({ navigation, }) {

    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const account_types = [
        {
            account_type: "hotel",
            description: accountTypeDescritpions.hotel,
        },
        {
            account_type: "restaurant",
            description: accountTypeDescritpions.restaurant,
        },
    ]


    // States 
    const [accountType, setAccountType] = useState(account_types[0].account_type)


    // Global data
    const dispatch = useDispatch()



    function openNextPage() {
        dispatch(updateSignUpValue({ key: 'account_type', value: accountType }))
        navigation.navigate("EmailInput")
    }




    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>

                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />




                <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { navigation.goBack() }} />
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.account_type} description={localization.select_account_type} />
                </View>




                <View style={{ paddingHorizontal: 30 }}>


                    {account_types.map((item) => {
                        return (
                            <TouchableWithoutFeedback key={item.account_type} onPress={() => { setAccountType(item.account_type) }}>
                                <View style={{ paddingVertical: 15 }}>
                                    <SelectableItemUI TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} account_type={item.account_type} description={item.description} selectedBType={accountType} textColor={COLORS.black} />
                                </View>
                            </TouchableWithoutFeedback>

                        )
                    })
                    }



                </View>




                <ClassicButton
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onPress={openNextPage}
                    text={localization.next}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                />




            </SafeAreaView>
        </SafeAreaProvider>
    )
}




const SelectableItemUI = ({ account_type, description, selectedBType, textColor, COLORS, TEXT_STYLES }) => {
    return (
        <View style={{ alignContent: 'flex-start', justifyContent: 'space-between', flexDirection: 'row' }}>
            <Text style={[TEXT_STYLES.calloutMedium, { color: textColor }]}>{description}</Text>

            <SelectedCircle COLORS={COLORS} isSelected={account_type === selectedBType} />

        </View>
    )
}




const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },

})