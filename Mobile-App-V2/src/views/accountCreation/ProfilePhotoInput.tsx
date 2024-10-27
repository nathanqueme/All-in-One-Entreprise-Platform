//
//  ProfilePhotoInput.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import CirclePhoto from '../../components/ui/CirclePhoto'
import AntDesign from 'react-native-vector-icons/AntDesign'
import ImagePicker from 'react-native-image-crop-picker'
import RedError from "../../components/ui/RedError"
import TextStylesProvider from '../../components/styles/TextStyles'
import AsyncStorage from '@react-native-async-storage/async-storage'
import localization from '../../utils/localizations'
import { StatusBar, Pressable, StyleSheet, View, Platform, ActionSheetIOS, Text, LayoutAnimation, BackHandler, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TitleAndSubTitle } from '../../components/Headers'
import { ChevronLargeSymbol } from '../../components/Symbols'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { ClassicButton } from '../../components/Buttons'
import { generateAndUploadSearchPhoto, uploadImage } from '../../aws/s3'
import { checkShortIdAvailability, putItem } from '../../aws/dynamodb'
import { signInUser, updatePassword, updateUserPoolAttribute, getSessionMetadata, CachedSessionMetadata, cacheSessionMetadata } from '../../aws/cognito'
import { geocodeAddress } from '../../aws/location'
import { getPhoneNumberDescription, getAddressDescription, getImageDimensionRatio, getImageDimension, getFileName, generateID, stringInSearchQueryFormat } from '../../components/functions'
import { AccountMainDataObj, GeolocationObj, ProfileObj, ImageDataObj } from '../../Data'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { actionSheetAnimation } from '../../components/animations'


// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { updateSignUpValue, selectSignUpValues, clearAllSignUpValues } from '../../state/slices/signUpSlice'
import { openProfilePageAfterAccountCreated } from '../../state/slices/pagesSlice'
import { updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'




const ProfilePhotoInput = ({ navigation }) => {
    // States
    const [actionSheet, setActionSheet] = useState(false) // Android 
    const [imageUri, setImageUri] = useState("" as any)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")


    // Global data
    const signUpValues = useSelector(selectSignUpValues)
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const actionSheetOptions = [localization.choose_library_photo, localization.take_photo, localization.cancel]






    // Disable go back support for Android
    const [backHandler, setBackHandler]: [any, any] = useState() // used to stop disabling the back button
    useEffect(() => {

        // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
        const handler = BackHandler.addEventListener("hardwareBackPress", () => {
            // ... (Do nothing)
            return true // Indicates that has overwritten the back action 
        })
        setBackHandler(handler)

    }, [])






    // Android and iOS
    function showActionSheet() {
            LayoutAnimation.configureNext(actionSheetAnimation)
            setActionSheet(true)
        
    }
    function actionSheetPress(index) {
        switch (index) {
            case 0: pickImage(); break
            case 1: openCamera(); break
            case 2: break
            default: console.log("Out of range")
        }
    }




    // Option 1
    function pickImage() {
        ImagePicker.openPicker({
            cropping: true,
            width: 320,
            height: 320,
            mediaType: 'photo',
            loadingLabelText: localization.loading,
            cropperCircleOverlay: true
        }).then(image => {
            setImageUri(image.path)
        })
    }


    // Option 2 
    function openCamera() {
        ImagePicker.openCamera({
            path: 'any-id_profile_photo.jpg',
            cropping: true,
            width: 320,
            height: 320,
            mediaType: 'photo',
            loadingLabelText: localization.loading,
            cropperCircleOverlay: true
        }).then(image => {
            setImageUri(image.path)
        })
    }


    /** Create the account steps
     * - 1 - Sign in user
     * - 2 - Upload the photo if any 
     * - 3 - Geocode the address to obtain a geolocation
     * - 4 - Create a unique short_id and save the account's main info
     * - 5 - Save the account's profile
     * - 6 - Set its password
     * - 7 - Set its phone_number 
     * - 8 - Set its preferred_username
     * - 9 - Cache session metadata 
     * - 10 - Updat Ui
    */
    async function createAccount() {


        // Preparation
        setError("")
        setIsLoading(true)


        // 1
        let sessionMetadata: CachedSessionMetadata = undefined
        try {
            let session = await signInUser(signUpValues.email.replace('@', ''), '------')
            sessionMetadata = await getSessionMetadata(session)
            console.log('\nStep 1 done')
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }


        // 2
        let base64
        let imageData
        const account_id = sessionMetadata.account_id
        const short_id = await generateShortId()
        if (imageUri) {
            // Dimension
            let width
            let height
            try {
                const dimension = await getImageDimension(imageUri)
                width = dimension.width
                height = dimension.height
            } catch (error) {
                setError(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }


            try {
                let file_name = getFileName("profile_photo", short_id)
                base64 = await uploadImage(sessionMetadata.jwtToken, "anyid-eu-west-1", file_name, imageUri, width, height, 'profile_photo')
                await generateAndUploadSearchPhoto(imageUri, short_id, sessionMetadata.jwtToken)

                let height_width_ratio = await getImageDimensionRatio(base64)
                imageData = ImageDataObj(base64, height_width_ratio)

                console.log("Step 2 done")
            } catch (error) {
                setError(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        } else console.log('Step 2 not needed')



        // 3
        let finalGeolocation
        try {
            let addressDescription = getAddressDescription(signUpValues.geolocation)
            const { iso, region, zip, latitude, longitude } = await geocodeAddress(addressDescription)
            const { street, city, country } = signUpValues.geolocation
            finalGeolocation = GeolocationObj(city, country, iso, region, street, zip, latitude, longitude)
            console.log('Step 3 done')
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // 4
        // N.B. : Doesn't include the long image base64.
        let accountMainData = AccountMainDataObj(account_id, short_id,
            signUpValues.account_name.trim(),
            stringInSearchQueryFormat(signUpValues.account_name.toLowerCase().replace(/\s+/g, '')),
            signUpValues.username.toLowerCase().replace(/\s+/g, ''),
            signUpValues.account_type as any,
            false,
            (imageUri ?? "") !== "",
            finalGeolocation,
        )

        try {
            const result = await putItem('accountsMainData', accountMainData, sessionMetadata.jwtToken)
            console.log("Step 4 done")
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // 5
        let profile = ProfileObj(
            account_id,
            [],
            ["map", "menu"],
            0,
            signUpValues.email.replace(/\s+/g, ''),
            [],
            signUpValues.phoneNumber,
            [], 0, 0, 0, null, {}, {}, null)
        try {
            const result = await putItem('profiles', profile, sessionMetadata.jwtToken)
            console.log("Step 5 done")
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // 6 
        try {
            const result = await updatePassword('------', signUpValues.password)
            console.log('Step 6 done')
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // 7 
        try {
            let phoneNumberDescription = getPhoneNumberDescription(signUpValues.phoneNumber)
            const result = await updateUserPoolAttribute('phone_number', phoneNumberDescription)
            console.log('Step 7 done')
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // 8
        try {
            const result = await updateUserPoolAttribute('preferred_username', signUpValues.username)
            console.log('Step 8 done')
        } catch (error) {
            setError(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }



        // adds the base64 + height/width ratio 
        if (imageUri) {
            accountMainData = Object.assign({}, accountMainData)
            accountMainData.image_data = imageData
        }



        // 9
        try {
            await cacheSessionMetadata(accountMainData.username, sessionMetadata)
            console.log("Step 9 done")
        } catch (error) {
            alert(error)
            setIsLoading(false)
            return
        }
        // 9 - 1 : UI
        let userAccountMainDataPayload: updateUiStateValuePayload = { attribute: "userAccountMainData", value: accountMainData }
        dispatch(updateUiStateValue(userAccountMainDataPayload))
        // 9 - 2 : Cache 
        await AsyncStorage.setItem("@user_account_main_data", JSON.stringify(accountMainData))




        // 10
        setIsLoading(false)
        backHandler?.remove()
        dispatch(updateSignUpValue({ key: "password", value: "" }))  // --> Clears the password
        let payload: updateUiStateValuePayload = { attribute: "account_id", value: account_id }
        dispatch(updateUiStateValue(payload))

        // Reset properties 
        dispatch(clearAllSignUpValues())

        // Then opens user's page
        setTimeout(() => {
            dispatch(openProfilePageAfterAccountCreated(accountMainData, profile, navigation) as any)
        }, 500)


        navigation.navigate("Home") // Goes back 


        console.log("Step 10 done")
        //console.log(accountMainData)
        //console.log(profile)



    }


    /**
     * 
     * @returns a unique **short_id**.
    */
    function generateShortId(): Promise<string> {
        return new Promise(async (resolve, reject) => {

            try {
                const new_short_id = generateID(9)
                const shortIdIsAvailable = await checkShortIdAvailability(new_short_id)
                resolve(shortIdIsAvailable ? new_short_id : generateShortId())
            } catch (error) {
                reject(error)
            }

        })
    }






    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }}
                edges={['top', 'right', 'left']}
            >
                <StatusBar
                    barStyle={actionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />



                {/* View  */}
                <View style={[styles.headerContainer, { paddingVertical: 30 }]}>
                    <ChevronLargeSymbol COLORS={COLORS} handleCloseView={() => { }} hide={true} />
                    <TitleAndSubTitle TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} title={localization.photo} description={localization.photo_input_description} />




                    <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Pressable onPress={() => { showActionSheet() }}>
                            <CirclePhoto COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} base64={imageUri ?? ""} widthAndHeight={100} />
                        </Pressable>



                        {(imageUri !== "") &&
                            <Pressable
                                onPress={() => { setImageUri("") }}
                                style={{
                                    position: 'absolute',
                                    backgroundColor: COLORS.whiteToGray2,
                                    borderRadius: 20,
                                    right: 0,
                                    top: 0,
                                    padding: 2.5
                                }}>
                                <AntDesign name="closecircle" size={22} color={'gray'} />
                            </Pressable>
                        }



                    </View>
                </View>





                {(error !== "") &&
                    <RedError TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} error={error} marginTop={20} />
                }




                <ClassicButton
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onPress={() => { createAccount() }}
                    text={localization.done}
                    topMargin={20}
                    horizontalMargin={30}
                    backgroundColor={COLORS.darkBlue}
                    textColor={"white"}
                    isLoading={isLoading}
                />



                <Text
                    style={[
                        TEXT_STYLES.gray13Text, {
                            alignSelf: "center",
                            paddingHorizontal: 30,
                            paddingTop: 20,
                            opacity: isLoading ? 1 : 0,
                            textAlign: "center"
                        }]}>{localization.creating_your_account_can_take_30_seconds}</Text>



            </SafeAreaView>




            {/* Android  */}
            <ActionSheet
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                show={actionSheet}
                setShow={setActionSheet}
                options={actionSheetOptions}
                actionSheetPress={actionSheetPress}
            />





        </SafeAreaProvider>
    )
}



export default ProfilePhotoInput




const styles = StyleSheet.create({
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})