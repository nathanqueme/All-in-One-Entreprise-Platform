//
//  RelatedItemEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from './../../assets/Colors'
import Divider from '../../components/ui/Divider'
import ImagePicker from 'react-native-image-crop-picker'
import LinkEditor from '../../views/contentEditors/LinkEditor'
import TimetablesEditor from './TimetablesEditor'
import localization from '../../utils/localizations'
import MultiLanguageTextEditor from './MultiLanguageTextEditor'
import TextStylesProvider from '../../components/styles/TextStyles'
import { StatusBar, ScrollView, Platform, Keyboard, Animated, Dimensions, LayoutAnimation, useColorScheme, Alert, BackHandler, Text } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { InfoInput, InfoInputButton, LargePhotoAndDescriptionField } from '../../components/ui/ForContentEditors'
import { RelatedItem, Link, LinkObj, Timetables, Page, ImageDataObj, RelatedItemObj, LocalizedText } from '../../Data'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { getCurrentDay, getDailyTimetableDescription, getDayName, getDailyTimetablesOfGivenDay, generateID, getImageDimensionRatio, animateAnimatableValue, awaitXMilliSeconds, getImageDimension, getFileName } from '../../components/functions'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { actionSheetAnimation } from '../../components/animations'
import { uploadImage } from '../../aws/s3'
import { putItem, queryRelatedItemAttributesByItemId, updateProfileWithOperation } from '../../aws/dynamodb'
import { descriptionWasChangedChecker, generateSimplifiedLocalizedText, linkWasChangedChecker, timetablesWereChangedChecker } from '../../components/functions'
import { getLocalizedText, getLocalizedTexts } from './../../assets/LanguagesList'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'


// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectPagesRelatedItems, appendRelatedItems, updateRelatedItem } from '../../state/slices/relatedItemsSlice'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { updateProfileValueWithOperation, updateProfileValueWithOperationInterface } from '../../state/slices/profilesSlice'
import { descriptionLocalizationWasChangedChecker, generateSimplifiedTextLocalization } from '../../components/functions/ForContentEditors'
import { ClassicButton } from '../../components/Buttons'
import { EmojiAlert } from '../../components/ui/AlertUi'
import { LoadingBar } from '../../components/ui/LoadingBar'
import { ScreenViewTracker } from '../../analytics'


const WINDOW_HEIGHT = Dimensions.get("window").height
const WINDOW_WIDTH = Dimensions.get('window').width


/* A view to edit an item related to the account. (It's name, description, type, simple location, link and timetables)
*/
export default function RelatedItemEditor({ navigation, route }) {

    // States 
    const progress = useRef(new Animated.Value(-WINDOW_WIDTH)).current
    // 
    const [originalRelatedItem, setOriginalRelatedItem]: [RelatedItem | undefined, any] = useState(undefined)
    const [originalDescription, setOriginalDescription] = useState<LocalizedText | undefined>()
    const [originalDescriptionLocalization, setOriginalDescriptionLocalization] = useState<LocalizedText[]>([])
    //
    const [name, setName]: [string, any] = useState('')
    const [imageUri, setImageUri] = useState('')
    const [simpleLocation, setSimpleLocation]: [string, any] = useState('')
    const [link, setLink]: [Link, any] = useState(LinkObj('', ''))
    const [timetables, setTimetables]: [Timetables, any] = useState()
    const [description, setDescription]: [LocalizedText, any] = useState()
    const [descriptionLocalization, setDescriptionLocalization] = useState<LocalizedText[]>([])

    //
    //
    const [imageWasChanged, setImageWasChanged] = useState(false)
    const [editedInfoType, setEditedInfoType]: [InformationType, any] = useState(null)
    const [missingMetadata, setMissingMetadata] = useState<(InformationType | "image")[]>([])
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)
    //
    //
    const [linkEditor, setLinkEditor] = useState(false)
    const [timetablesEditor, setTimetablesEditor] = useState(false)
    const [multiLanguageTexEditor, setMultiLanguageTexEditor] = useState(false)


    // Navigation values
    const { page, item_id } = route.params
    const { page_number, account_id, short_id } = page as Page


    // Global values
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.page_number === page_number })
    const dispatch = useDispatch()


    // Values 
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let hasTimetables = (timetables?.daily_timetables ?? []).length > 0
    // Timetables selection field Ui
    let currentDay = getCurrentDay()
    let currentDayDailyTimetables = hasTimetables ? getDailyTimetablesOfGivenDay(currentDay, timetables.daily_timetables) : undefined
    let isNewRelatedItem = (originalRelatedItem?.item_id ?? '') === ''
    let metadataFilled =
        (name ?? "").replace(/\s+/g, "") !== ""
    let descriptionWasChanged = descriptionWasChangedChecker(description, originalDescription)
    let descriptionLocalizationWasChanged = descriptionLocalizationWasChangedChecker(descriptionLocalization, originalDescriptionLocalization)
    let linkWasChanged = linkWasChangedChecker(link, originalRelatedItem?.link)
    let timetablesWereChanged = timetablesWereChangedChecker(timetables, originalRelatedItem?.timetables)
    let metadataWasChanged =
        name !== (originalRelatedItem?.name ?? "") ||
        descriptionWasChanged ||
        descriptionLocalizationWasChanged ||
        simpleLocation !== (originalRelatedItem?.simple_location ?? '') ||
        linkWasChanged ||
        timetablesWereChanged





    // Action sheet
    const actionSheetOptions = [localization.choose_library_photo, localization.take_photo, localization.cancel]
    const [actionSheet, setActionSheet] = useState(false)
    function openActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setActionSheet(true)

    }
    // Android and iOS
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

        let item = pageRelatedItems?.related_items.find(e => { return e.item_id === item_id })
        let oDescription = getLocalizedText(item?.description ?? {})
        let oDescriptionLocalization = getLocalizedTexts(item?.description_localization ?? {})


        // Shallow copies see (1) in the "PostEditor" for explanations
        setOriginalRelatedItem(Object.assign({}, item))
        setOriginalDescription(Object.assign({}, oDescription))
        setOriginalDescriptionLocalization([...oDescriptionLocalization])

        setImageUri(item?.image_data.base64 ?? '')
        setName(item?.name ?? '')
        setSimpleLocation(item?.simple_location ?? '')
        setLink(item?.link ?? LinkObj('', ''))
        setTimetables(item?.timetables)
        setIsLoading(false)
        setDescription(oDescription)
        setDescriptionLocalization(oDescriptionLocalization)

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










    /** Related item editing process
 
     - 1 - Generate a unique item_id                  (if needed : relatedItem is new)
     - 2 - Upload the photo                           (if needed : photo has been changed)
     - 3 - Save relatedItem metadata                  (if needed : relatedItem is new or its metadata has been changed)
     - 4 - Raise up global related items count        (if needed : relatedItem is new )
     - 5 - Update UI   

     N.B. : Checking if updates are needed avoids updating data unnecessarily which frees some bandwidth on the servers and makes the platform's operation cost lower. That could be even more improved by only updating the updated attributes rather than over writting the entire item. 
 
     */
    async function publishRelatedItem() {


        // Check 
        let metadataToFill: (InformationType | "image")[] = []
        if (!metadataFilled) metadataToFill.push("name")
        if (isNewRelatedItem && !imageWasChanged) metadataToFill.push("image")
        setMissingMetadata(metadataToFill)
        if (metadataToFill.length > 0) return


        // Preparation
        setIsLoading(true)
        animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
        animateAnimatableValue(progress, -WINDOW_WIDTH * 0.4, 2000)
        let item_id = originalRelatedItem?.item_id ?? ''
        let created_date = originalRelatedItem?.created_date ?? new Date().toISOString()
        let imageData = originalRelatedItem?.image_data ?? undefined
        //
        let hasADescription = (description?.text ?? "") !== ""
        let simplifiedDescrtiption = {}
        let simplifiedDescriptionLocalization = {}
        if (hasADescription) {
            try {
                simplifiedDescrtiption = await generateSimplifiedLocalizedText(false, description) // false as the locale has already been determined
            } catch (error) {
                animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                alert(localization.no_internet_connection)
                setIsLoading(false)
                return
            }
            if (descriptionLocalization.length > 0) simplifiedDescriptionLocalization = await generateSimplifiedTextLocalization(descriptionLocalization)
        }
        console.log("\n\n--> Related item editing")






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





        // Step 1 : item_id
        /**    */
        switch (isNewRelatedItem) {
            case true:
                try {
                    item_id = await generateUniqueItemId()
                    console.log('Step 1 done')
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }
                break
            case false: console.log('Step 1 not needed'); break
        }



        // Step 2 : photo upload
        /**    */
        let base64
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
                    let file_name = getFileName("related_item", short_id, item_id)
                    base64 = await uploadImage(jwtToken, "anyid-eu-west-1", file_name, imageUri, width, height, 'related_item_photo')
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }

                let height_width_ratio = await getImageDimensionRatio(base64)
                imageData = ImageDataObj(base64, height_width_ratio)

                console.log('Step 2 done')
                break

            case false: console.log('Step 2 not needed'); break
        }




        // Step 3 : Save metadata 
        // N.B. : don't include the base64 in the 'ImageDataObj'
        let relatedItem = RelatedItemObj(account_id, item_id, name.trim(), undefined, created_date, timetables, simplifiedDescrtiption, simplifiedDescriptionLocalization, simpleLocation, link)
        /**    */
        switch (metadataWasChanged || isNewRelatedItem) {
            case true:
                try {
                    await putItem('relatedItems', relatedItem, jwtToken)
                    console.log('Step 3 done')
                } catch (error) {
                    animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }
                break

            case false: console.log('Step 3 not needed'); break
        }



        // Step 4 : related_items_count
        if (isNewRelatedItem) {
            await updateProfileWithOperation(account_id, "related_items_count", "+", 1, jwtToken)
            console.log("Step 4 done (global rela count increased)")
        } else {
            console.log("Step 4 not needed (global post count increased)")
        }




        // Step 5 : UI
        animateAnimatableValue(progress, 0, 180)
        const _ = await awaitXMilliSeconds(180)
        animateAnimatableValue(progress, -WINDOW_WIDTH, 0)
        setIsLoading(false)
        relatedItem.image_data = imageData // adds the base64 + height/wifth ratio 
        switch (isNewRelatedItem) {
            case true:
                dispatch(appendRelatedItems({ page: page, relatedItems: [relatedItem] }))

                // "ProfilePage"
                let payload: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "related_items_count", operation: "+", ofValue: 1 }
                dispatch(updateProfileValueWithOperation(payload))

                console.log('Step 5.A done (append to UI)')
                break
            case false: dispatch(updateRelatedItem({ page: page, relatedItem: relatedItem })); console.log('Step 5.B done (update UI)'); break
        }
        dispatch(updateUiStateValue({ attribute: 'editedRelatedItemId', value: relatedItem.item_id }))



        console.log('\n-------RelatedItem succesfully published-------')
        backHandler?.remove()
        navigation.goBack()


    }



    function generateUniqueItemId(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const item_id = generateID(9)

            try {
                const relatedItemAttributes = await queryRelatedItemAttributesByItemId(account_id, item_id, "item_id")
                resolve(relatedItemAttributes === undefined ? item_id : generateUniqueItemId())
            } catch (error) {
                reject(error)
            }

        })
    }



    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"related_items_editor"} />
            <SafeAreaView style={{ flex: 1, minHeight: WINDOW_HEIGHT, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={actionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />



                <ClassicHeader
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onClose={() => { showCloseAndLoseModificationsAlert() }}
                    closeButtonType={'cancelText'}
                    headerText={localization.new_item}
                    editedInfoType={editedInfoType}
                    setEditedInfoType={setEditedInfoType}
                    displayOkButtonWhenInfoEdited={true}
                />


                <ScrollView
                    keyboardDismissMode={"interactive"}
                    keyboardShouldPersistTaps={"handled"}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        marginBottom: insets.bottom + 40,
                        paddingBottom: editedInfoType ? WINDOW_HEIGHT * 0.25 : 0 // paddingBottom: (editedInfoType ? WINDOW_HEIGHT / 3.3 : 0)
                    }}
                >


                    <LargePhotoAndDescriptionField
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        photo_uri={imageUri}
                        onPress={() => { openActionSheet() }}
                        placeholder={localization.describe_this_related_item}
                        description={description}
                        languages={[description?.language_metadata?.name ?? ""].concat(descriptionLocalization?.flatMap(e => { return e.language_metadata.name }))}
                        onPressWriteInOtherLanguage={() => { setMultiLanguageTexEditor(true) }}
                        displayPhotoInputInRed={missingMetadata.includes("image")}
                    />



                    <InfoInput
                        text={name}
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
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

                    <Text style={[TEXT_STYLES.gray12Text, { marginTop: 8, marginHorizontal: 20 }]}>{localization.providing_location}</Text>

                    <InfoInput
                        text={simpleLocation}
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        setText={(text) => {
                            setSimpleLocation(text)
                        }}
                        style={'with_symbol'}
                        autoCapitalize={'sentences'}
                        infoType={'location_in_place'}
                        editedInfoType={editedInfoType}
                        setEditedInfoType={setEditedInfoType}
                        doneReturnKey
                        onSubmitEditing={() => { }}
                    />

                    <Divider COLORS={COLORS} />



                    <InfoInputButton
                        infoType={'link'}
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        infoValue={link?.name ?? ''}
                        onPress={() => { setLinkEditor(true) }}
                    />

                    <InfoInputButton
                        infoType={'timetables'}
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        infoValue={hasTimetables ? `${getDayName(currentDay)} (${currentDayDailyTimetables.map(e => { return getDailyTimetableDescription(e, timetables.type) }).join(", ")})` : ''}
                        onPress={() => { setTimetablesEditor(true) }}
                    />




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
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    isLoading={isLoading}
                    onPress={() => {
                        Keyboard.dismiss()
                        publishRelatedItem()
                    }}
                    horizontalMargin={20}
                    bottomMargin={20 + insets.bottom}
                    topMargin={20}
                    textColor={"white"}
                    backgroundColor={COLORS.darkBlue}
                />


            </SafeAreaView>




            {/* Modals  */}
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
                originalLink={link}
                setLink={(link) => {
                    setLink(link)
                }}
            />
            <TimetablesEditor
                show={timetablesEditor}
                setShow={(timetables) => {
                    setTimetablesEditor(timetables)
                }}
                originalTimetables={timetables}
                setTimetables={setTimetables}
            />
            <ActionSheet
                show={actionSheet}
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                setShow={setActionSheet}
                options={actionSheetOptions}
                actionSheetPress={actionSheetPress}
            />
            <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />



        </SafeAreaProvider>
    )
}






