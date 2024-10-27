//
//  PostEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from './../../assets/Colors'
import LinkEditor from './LinkEditor'
import AddressEditor from './AddressEditor'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import ImagePicker from 'react-native-image-crop-picker'
import PostCategorySelector from '../selectors/PostCategorySelector'
import MultiLanguageTextEditor from './MultiLanguageTextEditor'
import { StatusBar, StyleSheet, View, ScrollView, Keyboard, Platform, Animated, Dimensions, LayoutAnimation, useColorScheme, BackHandler, Alert } from 'react-native'
import { InfoInput, InfoInputButton, LargePhotoAndDescriptionField } from '../../components/ui/ForContentEditors'
import { Post, Geolocation, PostObj, PostCategoryMetadata, Page, LinkObj, ImageDataObj, GeolocationObj, LocalizedText } from '../../Data'
import { animateAnimatableValue, awaitXMilliSeconds, generateID, getAddressDescription, getFileName, getGeohash, getImageDimension, getImageDimensionRatio, descriptionLocalizationWasChangedChecker, generateSimplifiedTextLocalization  } from '../../components/functions'
import { descriptionWasChangedChecker, generateSimplifiedLocalizedText, geolocationWasChangedChecker } from '../../components/functions'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { getCategoryTypeDescription, InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { getLocalizedText, getLocalizedTexts } from './../../assets/LanguagesList'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { actionSheetAnimation } from '../../components/animations'
import { ClassicButton } from '../../components/Buttons'
import { uploadImage } from '../../aws/s3'
import { geocodeAddress } from '../../aws/location'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'
import { putItem, getPostAttributesByPostId, updatePostCategoryPostCount, updatePostCategoryUpdatedDate, updateProfileWithOperation } from '../../aws/dynamodb'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { appendPosts, PostCountUpdatePayload, removePost, selectPagesPostCategories, updatePost, updateCategoryPostCount, UpdatePostCategoryMetadataAttributePayload, updatePostCategoryMetadataAttribute } from '../../state/slices/postsSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { updateProfileValueWithOperation, updateProfileValueWithOperationInterface } from '../../state/slices/profilesSlice'
import { EmojiAlert } from '../../components/ui/AlertUi'
import { LoadingBar } from '../../components/ui/LoadingBar'
import { ScreenViewTracker } from '../../analytics'
import TextSytlesProvider from '../../components/styles/TextStyles'



const WINDOW_HEIGHT = Dimensions.get("window").height
const WINDOW_WIDTH = Dimensions.get('window').width



/* A view to edit an item related to the account. (It's name, description, type, geolocation, link and timetables)
*/
export default function PostEditor({ navigation, route }) {


    // States 
    const progress = useRef(new Animated.Value(-WINDOW_WIDTH)).current
    // 
    const [originalPost, setOriginalPost] = useState<Post | undefined>(undefined)
    const [originalDescription, setOriginalDescription] = useState<LocalizedText | undefined>()
    const [originalDescriptionLocalization, setOriginalDescriptionLocalization] = useState<LocalizedText[]>([])

    //
    const [name, setName] = useState<string>("")
    const [imageUri, setImageUri] = useState<string>('')
    const [description, setDescription] = useState<LocalizedText | undefined>()
    const [descriptionLocalization, setDescriptionLocalization] = useState<LocalizedText[] | undefined>([])
    const [linkUrl, setLinkUrl] = useState<string>('')
    const [geolocationAsAddress, setGeolocationAsAddress] = useState<Geolocation | undefined>(undefined)
    const [postCategoryMetadata, setPostCategoryMetadata] = useState<PostCategoryMetadata | undefined>(undefined)
    //
    //
    const [imageWasChanged, setImageWasChanged] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)
    const [editedInfoType, setEditedInfoType]: [InformationType, any] = useState(null)
    const [missingMetadata, setMissingMetadata] = useState<(InformationType | "image")[]>([])
    // 
    //
    const [linkEditor, setLinkEditor] = useState<boolean>(false)
    const [addressEditor, setAddressEditor] = useState<boolean>(false)
    const [postCategorySelector, setPostCategorySelector] = useState<boolean>(false)
    const [multiLanguageTexEditor, setMultiLanguageTexEditor] = useState<boolean>(false)




    // Navigation values
    const { page, post_id, category_id } = route.params
    const { page_number, account_id, short_id } = page as Page


    // Global data
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.page_number === page_number })
    const dispatch = useDispatch()


    // Values 
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let isNewPost = (originalPost?.post_id ?? '') === ''
    let metadataFilled =
        (name ?? "").replace(/\s+/g, '') !== ""
    // && (postCategoryMetadata?.category_id ?? '') !== ''
    // 
    let descriptionWasChanged = descriptionWasChangedChecker(description, originalDescription)
    let descriptionLocalizationWasChanged = descriptionLocalizationWasChangedChecker(descriptionLocalization, originalDescriptionLocalization)
    let addressWasChanged = geolocationWasChangedChecker(geolocationAsAddress, originalPost?.geolocation)
    let categoryWasChanged = (postCategoryMetadata?.category_id ?? '') !== (originalPost?.category_id ?? '') && !isNewPost // to avoid it to be true when post is new, important for the publishPost() function so it properly does each steps if needed.
    let metadataWasChanged =
        name !== (originalPost?.name ?? '') ||
        descriptionWasChanged ||
        descriptionLocalizationWasChanged ||
        addressWasChanged ||
        linkUrl !== (originalPost?.link_url ?? '') ||
        categoryWasChanged






    // Action sheet
    const actionSheetOptions = [localization.choose_library_photo, localization.take_photo, localization.cancel]
    const [actionSheet, setActionSheet] = useState(false)
    function openActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setActionSheet(true)

    }
    function actionSheetPress(index) {
        switch (index) {
            case 0: pickImage(); break
            case 1: openCamera(); break
            default: console.log("Out of range")
        }
    }



    // Option 1
    function pickImage() {
        ImagePicker.openPicker({
            cropping: true,
            width: Platform.OS === "ios" ? 1400 : undefined,
            height: Platform.OS === "ios" ? 1400 : undefined,
            freeStyleCropEnabled: true,
            mediaType: 'photo',
            loadingLabelText: localization.loading,
        }).then(image => {
            setImageUri(image.path)
            setImageWasChanged(true)
        })
    }



    // Option 2 
    function openCamera() {
        ImagePicker.openCamera({
            cropping: true,
            width: Platform.OS === "ios" ? 1400 : undefined,
            height: Platform.OS === "ios" ? 1400 : undefined,
            freeStyleCropEnabled: true,
            path: 'any-id_post_photo.jpg',
            mediaType: 'photo',
            loadingLabelText: localization.loading,
        }).then(image => {
            setImageUri(image.path)
            setImageWasChanged(true)
        })
    }





    // Initialization
    useEffect(() => {

        let oPostCM = pagePostCategories.post_categories.find(e => { return e.metadata.category_id === category_id }).metadata
        let oPost = pagePostCategories.post_categories.find(e => { return e.metadata.category_id === category_id }).posts.find(e => { return e.post_id === post_id })
        let oDescription = getLocalizedText(oPost?.description ?? {})
        let oDescriptionLocalization = getLocalizedTexts(oPost?.description_localization ?? {})



        // Shallow copies are needed see explanations at --> (1)
        setOriginalPost(Object.assign({}, oPost))
        setOriginalDescription(Object.assign({}, oDescription))
        setOriginalDescriptionLocalization([...oDescriptionLocalization])


        setName(oPost?.name ?? '')
        setImageUri(oPost?.image_data.base64 ?? '')
        setLinkUrl(oPost?.link_url ?? '')
        if (!(oPost?.geolocation.auto_generated ?? false)) {
            setGeolocationAsAddress(oPost?.geolocation)
        }
        setPostCategoryMetadata(oPostCM)
        setDescription(oDescription)
        setDescriptionLocalization(oDescriptionLocalization)

        /** (1) :  Original values needs a shallow copy to be and so to stay different than the current value. 
          Otherwise for instance when the "descriptionLocalization" is updated, it also updates the "oDescriptionLocalization" 
          if the two variables had the same value --> actually the two variables end up beeing the same, 
          they are just a different reference of the same variable. And doing a shallow copy avoids that.


          To replicate the issue remove the shallow copy logic and edit a post with a description localization. 
          -> When you open the "PostEditor" the "descriptionLocalization" is equal to the "oDescriptionLocalization", for instance both values are equal to: [ { languageMetadata: { language: "en", name: "English" }, text: "In pursuit of the dream." } ]
          --> Now if you edit the "descriptionLocalization" for instance by adding a "s" to the text : [ { languageMetadata: { language: "en", name: "English" }, text: "In pursuit of the dreams." } ]
          ---> the "oDescriptionLocalization" will also have been changed.
        */

    }, [])





    // Disable go back support for Android
    const [backHandler, setBackHandler]: [any, any] = useState() // used to stop disabling the back button
    useEffect(() => {


        // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
        const handler = BackHandler.addEventListener("hardwareBackPress", () => {
            // ... (Do nothing)
            showCloseAndLoseModificationsAlert()
            handler.remove()
            return true // Indicates that has overwritten the back action 
        })
        setBackHandler(handler)


    }, [])
    function showCloseAndLoseModificationsAlert() {
        Alert.alert(localization.delete_modifications, localization.modifications_wont_be_saved,
            [
                { text: localization.cancel, onPress: () => { } },
                {
                    text: localization.delete, style: 'destructive', onPress: async () => {
                        backHandler?.remove()
                        navigation.goBack()
                    }
                },
            ]
        )
    }



    /*
    // NEW POST CATEGORY_____________________________________________________
    const postCategoriesCount = pagePostCategories?.post_categories.length ?? 0
    const [originalPostCategoriesCount, setOriginalPostCategoriesCount] = useState(postCategoriesCount)
    useEffect(() => {

        if (originalPostCategoriesCount !== postCategoriesCount) {

            setOriginalPostCategoriesCount(postCategoriesCount)

            // Select the new category that has just been created
            let postCategory = pagePostCategories?.post_categories.slice().sort(function (a, b) {
                if (a.metadata.created_date > b.metadata.created_date) { return -1 }
                if (a.metadata.created_date < b.metadata.created_date) { return 1 }
                return 0
            })[0] 
            setPostCategoryMetadata(postCategory.metadata)

        }

    }, [postCategoriesCount])
    //_______________________________________________________________________
    */






    /** Post editing process
 
      - 1 - Generate a unique post_id               (if needed : post is new)
      - 2 - Geolocalize the address                 (if needed : post has an address and post is new or address was changed)
      - 3 - Upload the photo                        (if needed : photo has been changed)
      - 4 - Save post metadata                      (if needed : post is new or its metadata has been changed)
      - 5 - Update original category post count     (if needed : the post had a category and it has been changed)
      - 6 - Update the new category post count      (if any : new post or post who's original category has been changed)
      - 7 - Update post_count                       (if needed : new post)
      - 8 - Update UI   

      N.B. : Checking if updates are needed avoids updating data unnecessarily which frees some bandwidth on the servers and makes the platform's operation cost lower. That could be even more improved by only updating the updated attributes rather than over writting the entire item. 
 
     */
    async function publishPost() {


        // Check 
        let metadataToFill: (InformationType | "image")[] = []
        if (!metadataFilled) metadataToFill.push("name")
        if (isNewPost && !imageWasChanged) metadataToFill.push("image")
        setMissingMetadata(metadataToFill)
        if (metadataToFill.length > 0) return


        // Preparation
        setIsLoading(true)
        animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
        animateAnimatableValue(progress, -WINDOW_WIDTH * 0.85, 300)
        let post_id = originalPost?.post_id ?? ""
        let created_date = originalPost?.created_date ?? new Date().toISOString()
        let current_date = new Date().toISOString()
        // 
        let imageData = originalPost?.image_data ?? undefined
        // Todo : handle theses values in the next versions
        let saved_count = 0      // (temporary)
        let comment_count = 0    // (temporary)
        let comments_disabled = originalPost?.comments_disabled ?? false
        let tagged = originalPost?.tagged ?? []
        let link_url = linkUrl !== "" ? linkUrl : undefined
        // 
        let hasADescription = (description?.text ?? "") !== ""
        let simplifiedDescrtiption = {}
        let simplifiedDescriptionLocalization = {}
        if (hasADescription) {
            try {
                simplifiedDescrtiption = await generateSimplifiedLocalizedText(descriptionWasChanged, description)
            } catch (error) {
                alert(localization.no_connection_message)
                setIsLoading(false)
                return
            }
            if (descriptionLocalization.length > 0) simplifiedDescriptionLocalization = await generateSimplifiedTextLocalization(descriptionLocalization)
        }
        console.log("\n\n--> Post editing")




        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }
        console.log("Token is fresh")






        // Step 1 : post_id
        switch (isNewPost) {
            case true:
                try {
                    post_id = await generateUniquePostId()
                    console.log('Step 1 done             (post_id generated)')
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }
                break

            case false:
                console.log('Step 1 not needed       (post_id already generated)')
                break
        }




        // Step 2 : address geolocalization
        /**
          - A : an address was provided 
            - A : geolocalize it, if not already
            - B : it has already being geolocalized
        
          - B : no address was provided 
             - A : auto_generate a geolocation and geohash by using the one used for the acount, if not already or if needed
             - B : it has already being auto_generated
             
         */
        let geolocation
        let geohash
        // Step 2.A
        if ((geolocationAsAddress?.country ?? '') !== '') {

            // Step 2.A.A
            if (addressWasChanged || isNewPost) { // <-- Checks if already geolocalized

                let addressDescription = getAddressDescription(geolocationAsAddress)
                try {
                    const { iso, region, zip, latitude, longitude } = await geocodeAddress(addressDescription)
                    geolocation = GeolocationObj(geolocationAsAddress.city, geolocationAsAddress.country, iso, region, geolocationAsAddress?.street ?? '', zip, latitude, longitude)
                    geohash = getGeohash(latitude, longitude, 4)
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }

                console.log('Step 2.A.A done             (address geolocolized)')
            }
            // Step 2.A.B
            else {
                console.log('Step 2.A.B not needed       (address provided but already geolocalized)')
                geolocation = originalPost.geolocation
                geohash = originalPost.geohash
            }

        }
        // Step 2.B
        else {

            // Step 2.B.A
            /* 
               - Case 1 : the default geolocation was not already auto_generated 
               - Case 2 : the default geolocation was already auto_generated but needs to be updates as the account's geolocation does not match any more.
            */
            let aGeolocation = pageAccountMainData.account_main_data.geolocation
            let oGeolocation = originalPost?.geolocation
            let defaultGeolocationDoesNotMatchesWithAccountGeolocationAnyMore =
                ((aGeolocation?.street ?? "") !== (oGeolocation?.street ?? "")) ||
                ((aGeolocation?.city ?? "") !== (oGeolocation?.city ?? "")) ||
                ((aGeolocation?.country ?? "") !== (oGeolocation?.country ?? ""))
            // 
            if ((oGeolocation?.auto_generated ?? false) === false || defaultGeolocationDoesNotMatchesWithAccountGeolocationAnyMore) {

                const { city, country, iso, region, street, zip, latitude, longitude } = aGeolocation
                let auto_generated_geolocation = GeolocationObj(city, country, iso, region, street, zip, latitude, longitude, true) // <-- adds the auto_generated property
                geolocation = auto_generated_geolocation
                geohash = getGeohash(auto_generated_geolocation.latitude, auto_generated_geolocation.longitude, 4)

                console.log("Step 2.B.A done           (default geolocalization generated or updated)")

            }
            // Step 2.B.B
            else {
                console.log("Step 2.B.B not needed     (default geolocalization already generated)")
                geolocation = originalPost.geolocation
                geohash = originalPost.geohash
            }

        }





        // Step 3 : photo upload
        let base64
        animateAnimatableValue(progress, -WINDOW_WIDTH * 0.15, 2500)
        switch (imageWasChanged) {
            case true:
                // Dimension
                let width
                let height
                try {
                    const dimension = await getImageDimension(imageUri)
                    width = dimension.width
                    height = dimension.height
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }


                try {
                    let file_name = getFileName("post", short_id, post_id)
                    base64 = await uploadImage(jwtToken, "anyid-eu-west-1", file_name, imageUri, width, height, 'post_photo')
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }

                let height_width_ratio = await getImageDimensionRatio(base64)
                imageData = ImageDataObj(base64, height_width_ratio)

                console.log('Step 3 done             (image uploaded)')
                break

            case false: console.log('Step 3 not needed       (no image to upload)'); break
        }





        // Step 4 : Save metadata 
        //    Step 4.A : deleting the old metadata is required before saving the new one (as the category_id was changed and it is part of the primary key)
        //    Step 4.B : saving the new metadata does not requires deleting the old one
        // N.B. : don't include the base64 in the 'ImageDataObj'
        // Warning : The current process overwrites the 'saved_count' and 'comment_count'. 
        let post = PostObj(post_id, postCategoryMetadata.category_id, account_id, created_date, undefined, name.trim(), saved_count, comment_count, comments_disabled, geolocation, geohash, simplifiedDescrtiption, simplifiedDescriptionLocalization, tagged, link_url) // Never keeps the description's localization if there is no more description
        if (metadataWasChanged || isNewPost) {

            try {
                await putItem('posts', post, jwtToken)
                console.log('Step 4.A done')
            } catch (error) {
                animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }

        } else {
            console.log('Step 4 not needed       (no metadata to update)')
        }




        // Step 5 : original category update 
        let decreasePostCountOfCategoryId
        switch (categoryWasChanged) {
            case true:
                await updatePostCategoryPostCount(account_id, originalPost.category_id, '-', 1, current_date, jwtToken)
                decreasePostCountOfCategoryId = originalPost.category_id
                console.log("Step 5 done            (original category's post count decreased)")
                break

            case false: console.log('Step 5 not needed      (no original post count to update)'); break
        }




        // Step 6 : new category update
        let increasePostCount = false
        switch (isNewPost || categoryWasChanged) {
            case true:
                await updatePostCategoryPostCount(account_id, post.category_id, '+', 1, current_date, jwtToken)
                increasePostCount = true
                console.log("Step 6 done            (new category's post count increased)")
                break

            case false:
                await updatePostCategoryUpdatedDate(account_id, post.category_id, current_date, jwtToken)
                console.log('Step 6 not needed      (no new category to update --> update "update_date" only)')
                break
        }



        // Step 7 : post_count
        if (isNewPost) {
            await updateProfileWithOperation(account_id, "post_count", "+", 1, jwtToken)
            console.log("Step 7 done (global post count increased)")
        } else {
            console.log("Step 7 not needed (global post count increased)")
        }





        // Step 8 : UI
        // A (post)
        animateAnimatableValue(progress, 0, 100)
        const _ = await awaitXMilliSeconds(100)
        animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
        setIsLoading(false)

        post.image_data = imageData // adds the base64 + height/width ratio 
        if (isNewPost) {
            // "PostsPage"
            dispatch(appendPosts({ page: page, category_id: post.category_id, posts: [post] }))

            // "ProfilePage"
            let payload: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "post_count", operation: "+", ofValue: 1 }
            dispatch(updateProfileValueWithOperation(payload))

            console.log('Step 8.A done          (append to UI)')
        } else {

            if (categoryWasChanged) {
                dispatch(removePost({ page: page, category_id: originalPost.category_id, post_id: post_id, animated: false }))
                dispatch(appendPosts({ page: page, category_id: post.category_id, posts: [post] }))
                console.log('Step 7.B done          (update UI with changed category)')

            } else {
                dispatch(updatePost({ page: page, category_id: post.category_id, post: post }))
                console.log('Step 7.B done          (update UI with conserved category)')

            }


        }
        // B (post count)
        if (decreasePostCountOfCategoryId !== undefined) {
            let payload: PostCountUpdatePayload = { page: page, category_id: decreasePostCountOfCategoryId, operation: '-', value: 1 }
            dispatch(updateCategoryPostCount(payload))
        }
        if (increasePostCount) {
            let payload: PostCountUpdatePayload = { page: page, category_id: post.category_id, operation: '+', value: 1 }
            dispatch(updateCategoryPostCount(payload))
        }
        // C (update date)
        if (decreasePostCountOfCategoryId !== undefined) {
            let payload: UpdatePostCategoryMetadataAttributePayload = { page: page, category_id: decreasePostCountOfCategoryId, attribute: "update_date", value: current_date }
            dispatch(updatePostCategoryMetadataAttribute(payload))
        }
        let payload: UpdatePostCategoryMetadataAttributePayload = { page: page, category_id: post.category_id, attribute: "update_date", value: current_date }
        dispatch(updatePostCategoryMetadataAttribute(payload))
        // D
        // Scroll to post
        dispatch(updateUiStateValue({ attribute: 'editedPostId', value: post.post_id }))






        setTimeout(() => {
            backHandler?.remove()
            navigation.goBack()
        }, 100)
        console.log('\n-------Post succesfully published-------')
        let postCopyForDebugging = post
        postCopyForDebugging.image_data.base64 = "_"




    }


    function generateUniquePostId(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const post_id = generateID(9)

            try {
                const postAttributes = await getPostAttributesByPostId(post_id, "post_id")
                resolve(postAttributes === undefined ? post_id : generateUniquePostId())
            } catch (error) {
                reject(error)
            }

        })
    }







    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"post_editor"} />
            <SafeAreaView style={{ flex: 1, minHeight: WINDOW_HEIGHT, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={actionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />

                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { showCloseAndLoseModificationsAlert() }}
                    closeButtonType={'cancelText'}
                    headerText={localization.post}
                    editedInfoType={editedInfoType}
                    setEditedInfoType={setEditedInfoType}
                    displayOkButtonWhenInfoEdited
                />

                <ScrollView
                    keyboardDismissMode={"interactive"}
                    keyboardShouldPersistTaps={"handled"}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        marginBottom: insets.bottom + 40,
                        paddingBottom: editedInfoType ?? "" ? WINDOW_HEIGHT * 0.25 : 0
                    }}

                >
                    <View
                        pointerEvents={isLoading ? 'none' : 'auto'} // Disables touches events when is loading 
                        style={{
                            marginTop: -StyleSheet.hairlineWidth,
                            marginBottom: insets.bottom + 40
                        }}>


                        <LargePhotoAndDescriptionField
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            photo_uri={imageUri}
                            onPress={() => { openActionSheet() }}
                            placeholder={localization.describe_your_post}
                            description={description}
                            languages={[description?.language_metadata?.name ?? ""].concat(descriptionLocalization?.flatMap(e => { return e.language_metadata.name }))}
                            onPressWriteInOtherLanguage={() => { setMultiLanguageTexEditor(true) }}
                            displayPhotoInputInRed={missingMetadata.includes("image")}
                        />


                        <InfoInput
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            text={name}
                            setText={(text) => {
                                setName(text)
                            }}
                            style={'with_symbol'}
                            autoCapitalize={'sentences'}
                            infoType={'name'}
                            editedInfoType={editedInfoType}
                            setEditedInfoType={setEditedInfoType}
                            doneReturnKey
                            onSubmitEditing={() => { }}
                            displayInRed={missingMetadata.includes("name") && name === ""}
                        />

                        <Divider COLORS={COLORS} />


                        <InfoInputButton
                            infoType={'link'}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            infoValue={linkUrl}
                            onPress={() => { setLinkEditor(true) }}
                        />
                        <InfoInputButton
                            infoType={'geolocation'}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            infoValue={getAddressDescription(geolocationAsAddress)}
                            onPress={() => { setAddressEditor(true) }}
                        />

                        {/* Mike symbol + "Add an audio file" (great for museums) */}

                        {/* Percent with a minus symbol + "Reduction details" (amount, code, explanation how to get it, link to get it) */}

                        {/* Tag places */}

                        {/* 
                         <Text style={[TextStyle.gray12Text, { marginTop: 8, marginBottom: 6, marginHorizontal: 20 }]}>{localization.select_category_or}<Text onPress={() => { navigation.push('CategoryEditor', { page: page }) }} style={{ color: COLORS.darkBlue, fontWeight: "400" }}>{localization.create_a_new_one}</Text></Text>
                        */}

                        <InfoInputButton
                            infoType={'category'}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            description={localization.category}
                            infoValue={`${getCategoryTypeDescription(postCategoryMetadata?.type, postCategoryMetadata?.custom_type)}`}
                            onPress={() => { setPostCategorySelector(true) }}
                        />



                    </View>
                </ScrollView>


                {(progress !== undefined) &&
                    <LoadingBar
                        COLORS={COLORS}
                        isLoading={isLoading}
                        progress={progress}
                    />
                }
                <ClassicButton
                    text={localization.save}
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    isLoading={isLoading}
                    onPress={() => {
                        setError('')
                        Keyboard.dismiss()
                        publishPost()
                    }}
                    horizontalMargin={20}
                    bottomMargin={20 + insets.bottom}
                    topMargin={20}
                    textColor={"white"}
                    backgroundColor={COLORS.darkBlue}
                />

            </SafeAreaView>




            {/* Modals */}
            <MultiLanguageTextEditor
                show={multiLanguageTexEditor}
                setShow={setMultiLanguageTexEditor}
                originalLocalizedText={description}
                originalTextLocalization={descriptionLocalization}
                setLocalizedText={(e: LocalizedText) => {
                    setDescription(e)
                }}
                setTextLocalization={(e: LocalizedText[]) => {
                    setDescriptionLocalization(e)
                }}
            />
            <LinkEditor
                show={linkEditor}
                setShow={setLinkEditor}
                originalLink={LinkObj('', linkUrl)}
                setLink={(link) => { setLinkUrl(link?.url ?? '') }}
                justUrlInput={true}
            />
            <AddressEditor
                show={addressEditor}
                setShow={setAddressEditor}
                originalGeolocation={geolocationAsAddress}
                setGeolocation={(geolocation) => {
                    setGeolocationAsAddress(geolocation)
                }}
                page={page}
            />
            <PostCategorySelector
                show={postCategorySelector}
                setShow={setPostCategorySelector}
                setSelectedPostCategory={(e) => {
                    setPostCategoryMetadata(e)
                }}
                originalSelection={postCategoryMetadata}
                postCategoriesMetadata={pagePostCategories.post_categories?.flatMap(e => { return e.metadata }) ?? []}
            />
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                show={actionSheet}
                setShow={setActionSheet}
                options={actionSheetOptions}
                actionSheetPress={actionSheetPress}
            />

            <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />



        </SafeAreaProvider>
    )
}



