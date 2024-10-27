//
//  AccountDeletionPage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors from './../../../../../assets/Colors'
import TextSytlesProvider from '../../../../../components/styles/TextStyles'
import RedError from "../../../../../components/ui/RedError"
import localization from '../../../../../utils/localizations'
import MultipleInputsContainer from '../../../../../components/ui/MultipleInputsContainer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar, StyleSheet, View, TextInput, useColorScheme, TouchableOpacity, Alert, Keyboard } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../../../../components/Headers'
import { ChevronLargeSymbol, EyeSymbol } from '../../../../../components/Symbols'
import { ClassicButton } from '../../../../../components/Buttons'
import { deleteContent } from '../../../../../aws/s3'
import { CachedSessionMetadataObj, cacheSessionMetadata, refreshAndUpdateUserJwtToken, signInUserAndReturnCognitoUser } from '../../../../../aws/cognito'
import { deleteAccountMainData, deletePost, deletePostCategoryMetadata, deleteProfile, deleteRelatedItem, getAccountMainData, getProfile, queryAllPostCategories, queryPostsByMostRecents, queryRelatedItemsByMostRecent } from '../../../../../aws/dynamodb'
import { AccountMainDataObj, GeolocationObj, ImageDataObj, Post } from '../../../../../Data'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { getErrorDescription } from '../../../../../components/AlertsAndErrors'
import { getFileName } from '../../../../../components/functions'


// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../../../../state/slices/uiStatesSlice'


const AccountDeletionPage = ({ navigation }) => {

    // States
    const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")



    // Global data 
    const dispatch = useDispatch()
    const uiStates = useSelector(selectUiStates)



    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const firstTextInput = useRef(null)
    const secondTextInput = useRef(null)
    let account_id = uiStates.account_id
    let metadataFilled = username !== "" && password !== ""
    const short_id = uiStates.userAccountMainData?.short_id ?? ""




    // Show keyboard 
    useEffect(() => {
        setTimeout(() => {
            firstTextInput.current.focus()
        }, 550)
    }, [])





    /**
     * 
     * A : Query all items partition key 
     * - 1 - RelatedItems        (account_id + created_date)
     * - 2 - Post categories     (account_id + category_id)
     * - 3 - Posts               (account_id + post_id)
     * - 4 - See if has pdfs + profile photos
     * 
     * 
     * B : Deletion of each item (its values first and then its photos)
     * - 1 - Delete related items 
     * - 2 - Delete posts
     * - 3 - Delete post categories
     * - 4 - Delete AccountMainData 
     * - 5 - Delete Profile 
     * - 6 - Delete pdfs if any (menu + maps)
     * - 7 - Delete profile photo if any 
     * - 8 - Delete cognito user 
     * - 9 - Clear device's cache 
     * 
     * - 10 - Update Ui
     * 
     * 
    */
    async function deleteAccount() {



        Keyboard.dismiss()
        setIsLoading(true)


        // Handles no internet connection error 
        let cognitoUser: CognitoUser = undefined
        try {
            cognitoUser = await signInUserAndReturnCognitoUser(username, password)
        } catch (error) {
            if (error.code === 'NotAuthorizedException') {
                Alert.alert(localization.incorrect_password, localization.incorrect_password_description)
            }
            else {
                setTimeout(() => {
                    alert(getErrorDescription(error).message)
                }, 100)
            }
            setIsLoading(false)
            return
        }





        let jwtToken = await refreshAndUpdateUserJwtToken(uiStates.userAccountMainData.username, dispatch)





        // Part A
        // 
        // 
        // 1
        let relatedItemsIDs = await queryRelatedItemsByMostRecent(account_id, undefined, undefined, "created_date, item_id")
        console.log("\n\nr_i : " + relatedItemsIDs.length)



        // 2 
        let postCategoriesIDs = await queryAllPostCategories(account_id, "category_id")
        console.log("p_c : " + postCategoriesIDs.length)



        // 3 
        let postIDs: Post[] = []
        await Promise.all(postCategoriesIDs.map(async (e) => {
            let postsIdsOfThatCategory = await queryPostsByMostRecents(e.category_id, undefined, undefined, "post_id")
            postIDs = postIDs.concat(postsIdsOfThatCategory)
        }))
        console.log("p : " + postIDs.length)



        // 4 
        let accountMainData = await getAccountMainData(account_id)
        let profile = await getProfile(account_id)









        // Part B 
        // 
        // 
        /* 1 */
        await Promise.all(relatedItemsIDs.map(async (e) => {

            await deleteRelatedItem(account_id, e.created_date, jwtToken)
            let fileName = getFileName("related_item", short_id, e.item_id)
            await deleteContent(jwtToken, "anyid-eu-west-1", fileName)

        }))



        /* 2 */
        await Promise.all(postIDs.map(async (e) => {

            await deletePost(account_id, e.post_id, jwtToken)
            let fileName = getFileName("post", short_id, e.post_id)
            await deleteContent(jwtToken, "anyid-eu-west-1", fileName)

        }))



        /* 3 */
        await Promise.all(postCategoriesIDs.map(async (e) => {

            await deletePostCategoryMetadata(account_id, e.category_id, jwtToken)

        }))



        /* 4 */
        await deleteAccountMainData(account_id, jwtToken)



        /* 5 */
        await deleteProfile(account_id, jwtToken)



        /* 6 */
        if (profile.additional_resources.includes("menu")) {
            let menuPdfFileName = getFileName("pdf", short_id, undefined, true)
            await deleteContent(jwtToken, "anyid-eu-west-1", menuPdfFileName)
        }
        if (profile.additional_resources.includes("map")) {
            let mapPdfFileName = getFileName("pdf", short_id, undefined, false)
            await deleteContent(jwtToken, "anyid-eu-west-1", mapPdfFileName)
        }



        /* 7  */
        if (accountMainData.has_photo) {
            let profilePhotoFileName = getFileName("profile_photo", short_id, undefined)
            await deleteContent(jwtToken, "anyid-eu-west-1", profilePhotoFileName)
            let searchPhotoFileName = getFileName("search_photo", short_id, undefined)
            await deleteContent(jwtToken, "anyid-eu-west-1", searchPhotoFileName)
        }





        /* 8 */
        try {
            cognitoUser.deleteUser(function (error, result) {
                if (error) { alert(error) }

            })
        } catch (error) {
            alert(error)
        }



        /* 9 */
        try {
            await cacheSessionMetadata(username, CachedSessionMetadataObj("", "", ""))
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }
        // user's AccountMainData
        // UI
        let userAccountMainData: updateUiStateValuePayload = { attribute: "userAccountMainData", value: AccountMainDataObj("", "", "", "", "", "hotel", false, false, GeolocationObj("", "", "", "", "", ""), ImageDataObj("", 1)) }
        dispatch(updateUiStateValue(userAccountMainData))
        dispatch(updateUiStateValue({ attribute: "account_id", value: "" }))
        // Cache 
        await AsyncStorage.setItem("@user_account_main_data", "")
        console.log("Step 3 done")




        /* 10 */
        navigation.push("AccountDeleted")
        setIsLoading(false)



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
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.delete_account} description={localization.if_sure_delete_account_enter} />
                </View>




                <MultipleInputsContainer
                    COLORS={COLORS}
                    firstTextInput={
                        <TextInput
                            ref={firstTextInput}
                            placeholder={localization.email_address_or_username}
                            value={username}
                            onChangeText={text => setUsername(text)}
                            style={TEXT_STYLES.textInput16Medium}
                            placeholderTextColor="gray"
                            clearButtonMode="always"
                            autoCapitalize='none'
                            autoCorrect={false}
                            returnKeyType='next'
                            onSubmitEditing={() => { secondTextInput.current.focus() }} //
                            blurOnSubmit={false} // See answer 1 and 429 at https://stackoverflow.com/questions/32748718/react-native-how-to-select-the-next-textinput-after-pressing-the-next-keyboar/36653746 
                        />
                    }
                    secondTextInput={
                        <View style={{ justifyContent: "flex-start", alignContent: "stretch", alignItems: "center", flexDirection: "row" }}>
                            <TextInput
                                ref={secondTextInput}
                                keyboardType='default'
                                placeholder={localization.password}
                                value={password}
                                onChangeText={text => setPassword(text)}
                                style={TEXT_STYLES.textInput16MediumInRow}
                                secureTextEntry={!showPassword}
                                placeholderTextColor='gray'
                                autoCapitalize='none'
                                autoCorrect={false}
                                returnKeyType='done'
                                onSubmitEditing={() => {
                                    if (metadataFilled) {
                                        deleteAccount()
                                    }
                                }}
                            />


                            <TouchableOpacity
                                onPress={() => { setShowPassword(!showPassword) }}
                                style={{ paddingRight: 3 }}>
                                <EyeSymbol
                                    COLORS={COLORS}
                                    size={22}
                                    outlined={showPassword} color={"gray"}
                                />
                            </TouchableOpacity>



                        </View>
                    }
                />




                {(error !== "") &&
                    <View style={{ marginVertical: 25 }}>
                        <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={0} />
                    </View>
                }




                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onPress={() => {
                        deleteAccount()
                    }}
                    condition={metadataFilled}
                    text={localization.next}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                    isLoading={isLoading}
                />



            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AccountDeletionPage



const styles = StyleSheet.create({


    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },


})

