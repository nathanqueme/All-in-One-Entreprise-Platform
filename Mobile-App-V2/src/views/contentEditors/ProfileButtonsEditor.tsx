//
//  ProfileButtonsEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import ToggleUI from '../../components/ui/ToggleUI'
import TextStylesProvider from '../../components/styles/TextStyles'
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, View, ScrollView, Text, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ProfileButtonType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { arrayEquals } from '../../components/functions'
import { Page, Profile } from '../../Data'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { updateProfile } from '../../aws/dynamodb'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectPagesProfiles, updateProfileValue } from '../../state/slices/profilesSlice'
import { selectUiStates } from '../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'




const ProfileButtonsEditor = ({ navigation, route }) => {

    // States 
    const [originalProfileButtons, setOriginalProfileButtons]: [ProfileButtonType[], any] = useState([])
    const [profileButtons, setProfileButtons]: [ProfileButtonType[], any] = useState([])
    const [isLoading, setIsLoading] = useState(false)


    // Navigation values
    const page: Page = route.params.page


    // Global data
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let a = originalProfileButtons.slice().sort(function (a, b) {
        if (a < b) { return -1 }
        if (a > b) { return 1 }
        return 0
    }) ?? []
    let b = profileButtons.slice().sort(function (a, b) {
        if (a < b) { return -1 }
        if (a > b) { return 1 }
        return 0
    }) ?? []
    let profileButtonsWereChanged = !arrayEquals(a, b)


    // Initialization
    useEffect(() => {

        let oProfileButtons = pageProfile?.profile.buttons ?? []

        // Shallow copies see (1) in the "PostEditor" for explanations
        setOriginalProfileButtons(oProfileButtons)
        setProfileButtons(oProfileButtons)

    }, [])





    function updateProfileButtons(profileButtonType: ProfileButtonType) {
        let index = profileButtons.findIndex(e => { return e === profileButtonType })

        // Append 
        if (index === -1) {
            setProfileButtons(previousValues => [...previousValues, profileButtonType])
        }
        // Remove 
        else {
            let updateProfileButtons = [...profileButtons]
            updateProfileButtons.splice(index, 1)
            setProfileButtons(updateProfileButtons)
        }

    }





    /** Process steps : 
        - 1 - Update on DynamoDB
        - 2 - Update UI
    */
    async function publishProfileButtons() {

        // Preparation
        setIsLoading(true)



        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }




        // 1 
        try {
            await updateProfile(page.account_id, "buttons", profileButtons, jwtToken)
        } catch (error) {
            let err = getErrorDescription(error)
            alert(err)
            setIsLoading(false)
            return
        }
        console.log("\nStep 1 done")



        // 2 
        const payload = { page_number: page.page_number, attribute: "buttons" as keyof Profile, newValue: profileButtons }
        dispatch(updateProfileValue(payload))
        setOriginalProfileButtons(profileButtons)
        setIsLoading(false)
        navigation.goBack()

        console.log("Step 2 done")



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
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'cancelText'}
                    headerText={localization.options}
                    condition={profileButtonsWereChanged}
                    onPress={async () => {
                        await publishProfileButtons()
                    }}
                    buttonType={'doneText'}
                    displayOkButtonWhenInfoEdited={true}
                    isLoading={isLoading}
                />



                <ScrollView
                    keyboardDismissMode={'on-drag'}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={{ marginTop: -StyleSheet.hairlineWidth }}>



                        <Text style={[TEXT_STYLES.gray13Text, { padding: 20 }]} >{localization.manage_features_you_want_to_add_to_your_profile_descriptive_text}</Text>



                        <View style={{ paddingVertical: 10 }}>
                            <ToggleUI
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                title={localization.map}
                                description={localization.map_feature_description}
                                value={profileButtons.includes("map")}
                                onSetValue={() => { updateProfileButtons("map") }}
                                paddingVertical={10}
                            />


                            <ToggleUI
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                title={localization.menu}
                                description={localization.menu_feature_description}
                                value={profileButtons.includes("menu")}
                                onSetValue={() => { updateProfileButtons("menu") }}
                                paddingVertical={10}
                            />
                        </View>



                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}





export default ProfileButtonsEditor