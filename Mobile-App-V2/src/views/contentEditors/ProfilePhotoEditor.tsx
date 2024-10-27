//
//  ProfilePhotoEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from './../../assets/Colors'
import TextStylesProvider from '../../components/styles/TextStyles'
import ImagePicker from 'react-native-image-crop-picker'
import { StatusBar, Image, Platform, ActionSheetIOS, Text, View, Pressable, Dimensions, Animated, Keyboard, LayoutAnimation, Appearance, TouchableOpacity } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { AccountMainData, ImageDataObj, Page } from '../../Data'
import { ProfilePhotoEditorHeader } from '../../components/Headers'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { animateAnimatableValue, awaitXMilliSeconds, getFileName, getImageDimension, getImageDimensionRatio } from '../../components/functions'
import { generateAndUploadSearchPhoto, uploadImage } from '../../aws/s3'
import { updateAccountMainData } from '../../aws/dynamodb'
import { deleteContent } from '../../aws/s3'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'

// Global values 
import { useSelector, useDispatch } from 'react-redux'
import { selectPagesAccountsMainData, updateAccountMainDataValue } from '../../state/slices/accountsMainDataSlice'
import { selectUiStates } from '../../state/slices/uiStatesSlice'
import { actionSheetAnimation } from '../../components/animations'
import localization from '../../utils/localizations'


const widthAndHeight = Dimensions.get('screen').width / 2.6
const screenWidth = Dimensions.get('screen').width



// A view to choose a category type and define its custom name.
export default function PhotoEditor({ navigation, route }) {

    // State
    const progress = useRef(new Animated.Value(-screenWidth)).current
    //
    const [initialized, setInitialized] = useState(false)
    const [imageUri, setImageUri] = useState('')
    const [originalImageUri, setOriginalImageUri] = useState('')
    //
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)


    // Navigation values
    const { page, post_id, category_id } = route.params
    const { page_number, account_id, short_id } = page as Page
    // const isHeaderPhoto = route?.params?.isHeaderPhoto ?? false // DEPRECATED


    // Global data 
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page_number })
    const dispatch = useDispatch()


    // Values 
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let imageModified =
        imageUri != originalImageUri &&
        imageUri !== '' &&
        typeof imageUri === "string"



    // Initialization
    useEffect(() => {
        if (initialized) return // Avoids re-initializing state when value is edited

        let base64 = pageAccountMainData?.account_main_data?.image_data?.base64 ?? ""

        setOriginalImageUri(base64.slice()) // Shallow copy see (1) in the "PostEditor" for explanations

        setImageUri(base64)
        setInitialized(true)

    }, [pageAccountMainData?.account_main_data?.image_data?.base64 ?? ""])









    // Action sheet
    const photoActionSheetOptions = [localization.choose_library_photo, localization.take_photo, localization.cancel]
    const deletePhotoActionSheetOptions = [localization.delete, localization.cancel]
    const [photoActionSheet, setPhotoActionSheet] = useState(false) // Android 
    const [deleteActionSheet, setDeleteActionSheet] = useState(false) // Android 
    // Android and iOS
    function showPhotoActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setPhotoActionSheet(true)

    }

    function showDeletePhotoActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setDeleteActionSheet(true)

    }






    function photoActionSheetPress(index) {
        switch (index) {
            case 0: pickImage(); break
            case 1: openCamera(); break
            default: console.log("Out of range")
        }
    }

    async function deletePhotoActionSheetPress(index) {
        switch (index) {
            case 0: await deletePhoto(); break
            default: console.log("Out of range")
        }
    }









    // Option 1
    function pickImage() {
        ImagePicker.openPicker({
            width: 320,
            height: 320,
            cropping: true,
            mediaType: 'photo',
            loadingLabelText: localization.loading,
            cropperCircleOverlay: true,
        }).then(image => {
            setImageUri(image.path)
        })
    }



    // Option 2 
    function openCamera() {
        ImagePicker.openCamera({
            path: 'any-id_profile_photo.jpg',
            width: 320,
            height: 320,
            cropping: true,
            mediaType: 'photo',
            loadingLabelText: localization.loading,
            cropperCircleOverlay: true
        }).then(image => {
            setImageUri(image.path)
        })
    }






    /** 
      * - 1 - Upload photo
      * - 2 - Upload and generate the search photo
      * - 3 - Save value on server if not already saved 
      * - 4 - Update UI
    */
    async function uploadProfilePhotoAndSearchPhoto() {


        // Preparation
        let base64
        let imageData
        setError('')
        Keyboard.dismiss()
        setIsLoading(true)
        animateAnimatableValue(progress, -screenWidth * 0.4, 2000)
        console.log("\n\n--> Profile photo upload")




        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                setIsLoading(false)
                alert(getErrorDescription(error).message)
                animateAnimatableValue(progress, -screenWidth, 0)
                return
            }
        }
        console.log("jwtToken retrieved")




        // Dimension
        let width
        let height
        try {
            const dimension = await getImageDimension(imageUri)
            width = dimension.width
            height = dimension.height
        } catch (error) {
            setIsLoading(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }




        // 1
        try {
            let file_name = getFileName("profile_photo", short_id)
            base64 = await uploadImage(jwtToken, "anyid-eu-west-1", file_name, imageUri, width, height, 'profile_photo')
            let height_width_ratio = await getImageDimensionRatio(base64)
            imageData = ImageDataObj(base64, height_width_ratio)
        } catch (error) {
            setIsLoading(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }
        console.log("Step 1 done")




        // 2 
        try {
            const base64 = await generateAndUploadSearchPhoto(imageUri, short_id, jwtToken)
        } catch (error) {
            setIsLoading(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }
        console.log("Step 2 done")





        // 3 
        try {
            const result = await updateAccountMainData(account_id, 'has_photo', true, jwtToken)
        } catch (error) {
            setIsLoading(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }
        console.log("Step 3 done")



        // 4
        const __ = await awaitXMilliSeconds(1000)
        animateAnimatableValue(progress, 0, 180)
        const _ = await awaitXMilliSeconds(180)
        // Updates the values so the user can reupload a photo again.
        setOriginalImageUri(base64)
        setImageUri(base64)
        dispatch(updateAccountMainDataValue({ page_number: page_number, attribute: 'has_photo', newValue: true }))
        dispatch(updateAccountMainDataValue({ page_number: page_number, attribute: 'image_data' as keyof AccountMainData, newValue: imageData }))
        //
        animateAnimatableValue(progress, -screenWidth, 0)
        setIsLoading(false)
        console.log("Step 4 done")



    }


    /**
      * - 1 - Delete the image 
      * - 2 - Save values on server 
      * - 3 - Update UI
     */
    async function deletePhoto() {

        if (imageUri === '') { return }
        setIsDeleting(true)




        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                setIsDeleting(false)
                alert(getErrorDescription(error).message)
                animateAnimatableValue(progress, -screenWidth, 0)
                return
            }
        }




        // 1
        try {
            let file_name = getFileName('profile_photo', short_id)
            const deletionResult = await deleteContent(jwtToken, 'anyid-eu-west-1', file_name)
        } catch (error) {
            setIsDeleting(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }



        // 2
        try {
            const result = await updateAccountMainData(account_id, 'has_photo', false, jwtToken)
        } catch (error) {
            setIsDeleting(false)
            alert(getErrorDescription(error).message)
            animateAnimatableValue(progress, -screenWidth, 0)
            return
        }



        // 3 
        let imageData = ImageDataObj("", 1)
        dispatch(updateAccountMainDataValue({ page_number: page_number, attribute: 'has_photo', newValue: false }))
        dispatch(updateAccountMainDataValue({ page_number: page_number, attribute: 'image_data' as keyof AccountMainData, newValue: imageData }))
        // 
        setTimeout(() => {
            setIsDeleting(false)
            setOriginalImageUri("")
            setImageUri("")
        }, 280)



    }





    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, backgroundColor: COLORS.bgDarkGray }} // black color of whiteToGray2
                edges={['top', 'right', 'left']}
            >


                <StatusBar
                    barStyle={"light-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <ProfilePhotoEditorHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    onCancelImageChange={() => { setImageUri(originalImageUri) }}
                    onPressEdit={() => { showDeletePhotoActionSheet() }}
                    onPress={uploadProfilePhotoAndSearchPhoto}
                    isLoading={isLoading}
                    isDeleting={isDeleting}
                    imageModified={imageModified}
                    progress={progress}
                    anImageIsSelected={imageUri !== ""}
                />




                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: insets.bottom }}>
                    {/* blank or selected */}
                    {(imageUri !== '') ?
                        <Pressable onPress={() => { showPhotoActionSheet() }} >
                            <Image
                                style={{
                                    resizeMode: 'cover',
                                    width: widthAndHeight,
                                    height: widthAndHeight,
                                    borderRadius: widthAndHeight,
                                }}
                                source={{ uri: imageUri }}
                            />
                        </Pressable>

                        :

                        <Pressable onPress={async () => { showPhotoActionSheet() }} >
                            <View style={{
                                alignItems: 'center',
                                justifyContent: "center",
                                width: widthAndHeight,
                                height: widthAndHeight,
                                backgroundColor: COLORS.bgGray,
                                borderRadius: widthAndHeight,
                            }}>
                                <Text style={[TEXT_STYLES.noContentFont, { padding: 15, textAlign: 'center' }]}
                                >{localization.no_photo}</Text>
                            </View>
                        </Pressable>

                    }

                    <Text style={[
                        TEXT_STYLES.gray13Text, {
                            paddingHorizontal: 90,
                            paddingVertical: 30,
                            textAlign: 'center'
                        }]}>{localization.press_to_edit_photo}</Text>

                </View>
            </SafeAreaView>






            {/* Android  */}
            <ActionSheet
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                show={photoActionSheet}
                setShow={setPhotoActionSheet}
                options={photoActionSheetOptions}
                actionSheetPress={photoActionSheetPress}
            />

            <ActionSheet
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                show={deleteActionSheet}
                setShow={setDeleteActionSheet}
                options={deletePhotoActionSheetOptions}
                actionSheetPress={deletePhotoActionSheetPress}
            />





        </SafeAreaProvider>
    )
}




