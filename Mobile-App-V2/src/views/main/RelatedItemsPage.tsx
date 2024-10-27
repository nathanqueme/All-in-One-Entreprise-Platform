//
//  RelatedItemsPage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors, { ColorsInterface } from '../../assets/Colors'
import localization from '../../utils/localizations'
import { StatusBar, View, Text, Image, Dimensions, Platform, ActionSheetIOS, LayoutAnimation, useColorScheme, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ClassicHeader } from '../../components/Headers'
import { DailyTimetablesList, getTimetablesTypeDescriptiveText } from '../../components/ui/TimetablesRelated'
import { Page, RelatedItem, TimetablesObj } from '../../Data'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { InfoWithSymbolUI } from '../../components/ui/InfoDisplay'
import { getFileName, openLinkWithInAppWeb } from '../../components/functions'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TranslatableExpandableText } from '../../components/ui/ExpandableText'
import { BottomSheet } from '../../components/BottomSheetRelated'
import { InformationType, SlidingAlertType } from '../../Types'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { actionSheetAnimation, layoutAnimation } from '../../components/animations'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'
import { deleteRelatedItem, updateProfileWithOperation } from '../../aws/dynamodb'
import { deleteContent } from '../../aws/s3'
import { SlidingAlert } from '../../components/SlidingAlert'

// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { appendRelatedItems, getRelatedItems, removeRelatedItem, selectPagesRelatedItems } from '../../state/slices/relatedItemsSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles, updateProfileValueWithOperation, updateProfileValueWithOperationInterface } from '../../state/slices/profilesSlice'
import { ScreenViewTracker } from '../../analytics'
import TextSytlesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'


const SCREEN_WIDTH = Dimensions.get("screen").width



/**
 * A view to preview an item related to the pro account.
*/
export default function RelatedItemsPage({ navigation, route }) {

    // States 
    const [bottomSheet, setBottomSheet] = useState(false)
    const [isLoadingRelatedItems, setIsLoadingRelatedItems] = useState(false)
    const [isDeleting, setIsDeleting]: [boolean, any] = useState(false)
    const [selectedRelatedItem, setSelectedRelatedItem]: [RelatedItem, any] = useState()


    // Navigation values 
    const { page, opened_from_item_id } = route.params
    const { page_number, account_id, short_id } = page as Page


    // Global data
    const uiStates = useSelector(selectUiStates)
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    let pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.page_number === page_number })
    let pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page?.page_number ?? "" })
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const listRef = useRef(null)
    const insets = useSafeAreaInsets()
    let isUserAccount = account_id === uiStates.account_id && account_id !== ""
    let timetables = selectedRelatedItem?.timetables
    let hasTimetables = (timetables?.daily_timetables?.length ?? 0) > 0
    // Sorted by most recently created
    let relatedItems = pageRelatedItems?.related_items?.slice()
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        }) ?? []




    // Action sheet
    const actionSheetOptions = [localization.delete, localization.edit, localization.cancel]
    const [actionSheet, setActionSheet] = useState(false) // Android
    function openActionSheet() {
        LayoutAnimation.configureNext(actionSheetAnimation)
        setActionSheet(true)
    }
    // Android and iOS
    function actionSheetPress(index) {
        switch (index) {
            case 0:
                deleteRelatedItemMetadataAndImage(selectedRelatedItem.created_date, selectedRelatedItem.item_id)
                break
            case 1:
                navigation.push('RelatedItemEditor', { page: page, item_id: selectedRelatedItem.item_id })
                break
            default: console.log("Out of range")
        }

        setSelectedRelatedItem(undefined)

    }
    useEffect(() => {
        if (!bottomSheet && (selectedRelatedItem?.account_id ?? "") !== "") openActionSheet()
    }, [selectedRelatedItem])
    // Reset for Android
    useEffect(() => {
        if (!actionSheet) setSelectedRelatedItem(undefined)
    }, [actionSheet])
    useEffect(() => {
        if (!bottomSheet) setSelectedRelatedItem(undefined)
    }, [bottomSheet])









    /**
     * - 1 - Delete the relatedItem metadata
     * - 2 - Delete its image
     * - 3 - Decrease the global relatedItems count
     * - 4 - Update UI 
    */
    async function deleteRelatedItemMetadataAndImage(created_date: string, item_id: string) {

        // Preparation
        setIsDeleting(true)



        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (uiStates.jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsDeleting(false)
                return
            }
        }



        // Step 1 : Metadata
        try {
            await deleteRelatedItem(account_id, created_date, jwtToken)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }
        console.log("Step 1 done")




        // Step 2 : Image 
        try {
            let file_name = getFileName("related_item", short_id, item_id)
            await deleteContent(jwtToken, 'anyid-eu-west-1', file_name)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }
        console.log("Step 2 done")




        // Step 3 : Related item count (Profile)
        await updateProfileWithOperation(account_id, "related_items_count", "-", 1, jwtToken)
        console.log("Step 3 done")




        // Step 4 : UI 
        // "ProfilePage"
        // "ProfilePage"
        setIsDeleting(false)
        let payload: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "related_items_count", operation: "-", ofValue: 1 }
        dispatch(updateProfileValueWithOperation(payload))
        LayoutAnimation.configureNext(layoutAnimation) // Animates the deletion of the post
        dispatch(removeRelatedItem({ page: page, item_id: item_id }))


        console.log("Step 4 done")


    }









    // Scroll to post (Page opened)
    let openedFromPostAtIndex = relatedItems.findIndex(e => { return e.item_id === opened_from_item_id }) ?? -1
    useEffect(() => {

        if (openedFromPostAtIndex !== -1) {
            listRef.current?.scrollToIndex({ index: openedFromPostAtIndex, animated: false, viewPosition: 0 })
        }

    }, [])







    // Scroll to edited relatedItem (Related item editing)
    let editedRelatedItemId = uiStates.editedRelatedItemId
    useEffect(() => {

        let editedRelatedItemIndex = relatedItems?.findIndex(e => { return e.item_id === editedRelatedItemId })
        if (editedRelatedItemIndex === -1) return
        listRef.current?.scrollToIndex({ index: editedRelatedItemIndex, animated: false, viewPosition: 0 })

        // Reset
        dispatch(updateUiStateValue({ attribute: 'editedRelatedItemId', value: "" }))

    }, [editedRelatedItemId])








    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"related_items"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={actionSheet || bottomSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />




                {/* TODO: Let people save related items (Save symbol displayed at the left of the ellipsis symbol)*/}
                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'chevronLeft'}
                    headerText={localization.in_the_place}
                    isLoading={isDeleting}
                    buttonType={isUserAccount ? "addSymbol" : undefined}
                    onPress={() => {
                        navigation.push('RelatedItemEditor', { page: page })
                    }}
                />



                <FlatList
                    ref={listRef}
                    data={relatedItems}
                    keyExtractor={relatedItem => { return relatedItem.item_id }}
                    // Scrolls to index
                    onScrollToIndexFailed={info => {
                        // Scrolls to the post when the page appears as it does not works the first time.
                        const wait = new Promise(resolve => setTimeout(resolve, 1));
                        wait.then(() => {
                            listRef.current?.scrollToIndex({ index: openedFromPostAtIndex, animated: false });
                        });
                    }}
                    // Loads more posts if any 
                    onEndReachedThreshold={0.5} // the smaller it is the more the user has to scroll at the bottom
                    onEndReached={async () => {
                        // alert((posts.length+' '+postCategory.metadata.post_count+ ' '+ (posts.length < postCategory.metadata.post_count))
                        if ((!isLoadingRelatedItems) && (relatedItems.length < (pageProfile?.profile?.related_items_count ?? 0))) {

                            setIsLoadingRelatedItems(true)
                            let oldestCreatedDate = relatedItems[relatedItems.length - 1].created_date // (Related item at the all bottom)
                            setIsLoadingRelatedItems(true)

                            try {
                                let rItems = await getRelatedItems(page, 12, oldestCreatedDate, isUserAccount === false)
                                dispatch(appendRelatedItems({ page: page, relatedItems: rItems }))
                                setIsLoadingRelatedItems(false)
                            } catch (error) {
                                let payload: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'no_connection' as SlidingAlertType }
                                dispatch(updateUiStateValue(payload))
                            }


                        }
                    }}
                    renderItem={({ item, index }) => (
                        <RelatedItemUi
                            key={item.item_id}
                            relatedItem={item}
                            account_id={account_id}
                            isUserAccount={isUserAccount}
                            setBottomSheet={() => {
                                setBottomSheet(true)
                                setSelectedRelatedItem(item)
                            }}
                            onPressEdit={(relatedItem: RelatedItem) => {
                                setSelectedRelatedItem(item)
                            }}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />
                    )}
                    ListFooterComponent={
                        <View style={{ marginBottom: insets.bottom }}>
                            {isLoadingRelatedItems &&
                                <View style={{ paddingVertical: 40 }}>
                                    <ActivityIndicator />
                                </View>
                            }
                        </View>
                    }
                />
            </SafeAreaView>








            {/* Modals */}
            <BottomSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                headerText={getTimetablesTypeDescriptiveText(timetables?.type ?? 'opening_hours')}
                show={bottomSheet}
                setShow={setBottomSheet}
                bottom_inset={insets.bottom}
                content_height={60 * 7 + ((timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                content={
                    hasTimetables ?
                        <DailyTimetablesList
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            timetables={timetables}
                            editable={false}
                            setDailyTimetablesOfThatDay={() => { }}
                            backgroundColor={COLORS.whiteToGray}
                        />
                        :
                        <View style={{ height: 60 * 7 }} />
                } />
            <SlidingAlert
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                topInset={insets.top}
                bottomInset={insets.bottom}
                slidingAlertType={uiStates.slidingAlertType === "no_connection" ? uiStates.slidingAlertType : "" as any}
                resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                slideFromBottom={true}
            />


            {/* Android */}
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                show={actionSheet}
                setShow={setActionSheet}
                options={actionSheetOptions}
                actionSheetPress={actionSheetPress}
            />




        </SafeAreaProvider>
    )
}




interface RelatedItemUiInterface {
    relatedItem: RelatedItem,
    account_id: string,
    isUserAccount: boolean,
    setBottomSheet: any
    onPressEdit: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * Displays the image and the information of a related items. (Something in the place)
 */
export function RelatedItemUi({ relatedItem, account_id, isUserAccount, setBottomSheet, onPressEdit, COLORS, TEXT_STYLES }: RelatedItemUiInterface) {

    let hasALink = typeof (relatedItem?.link ?? 'undefined') === 'object' && (relatedItem?.link.url ?? '') !== ''
    let timetables = relatedItem?.timetables ?? TimetablesObj('opening_hours', [], '')

    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const ACTION_BUTTON_UI_BG_COLOR = is_in_dark_color_scheme ? COLORS.softGray : COLORS.whiteGray

    return (
        <View key={relatedItem.item_id} style={{ marginBottom: 10 }}>
            {/* Images */}
            <Image
                style={{
                    resizeMode: 'cover',
                    width: '100%',
                    height: SCREEN_WIDTH * relatedItem.image_data.height_width_ratio ?? 1, // Height based on the screen's width
                    backgroundColor: COLORS.softGray,
                }}
                source={{ uri: relatedItem?.image_data.base64 ?? '' }}
            />



            {/* Name + description + translate button */}
            <View style={{ margin: 20, alignItems: 'flex-start' }}>
                <Text
                    style={[
                        TEXT_STYLES.headline,
                        { color: COLORS.black }
                    ]} >{relatedItem?.name ?? ""}
                </Text>

                <TranslatableExpandableText
                    COLORS={COLORS}
                    description={relatedItem?.description}
                    description_localization={relatedItem?.description_localization}
                    textType={"related_item_description"}
                    uniqueId={account_id + relatedItem.item_id}
                    marginTop={11}
                />
            </View>



            {/* Location at the account's establishment + Link + Timetables data */}
            <View style={{ marginHorizontal: 20, marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
                {(relatedItem?.simple_location ?? "") !== "" &&
                    <InfoWithSymbolUI
                        infoType={'location_in_place' as InformationType}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        infoValue={relatedItem?.simple_location ?? ''}
                        displayInBlue={false}
                        displayChevron={false}
                        pressable={false}
                        setSelectedInfoValue={() => { }}
                        setSelectedInfoType={() => { }}
                        backgroundColor={ACTION_BUTTON_UI_BG_COLOR}
                        displayInfoTypeName
                    />
                }


                {hasALink &&
                    <InfoWithSymbolUI
                        infoType={'website_link'}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        infoValue={relatedItem?.link.url ?? ''}
                        displayInBlue={true}
                        pressable={true}
                        customDisplayName={relatedItem?.link.name ?? ''}
                        displayNameInstead={true}
                        setSelectedInfoValue={(url) => { openLinkWithInAppWeb(url) }}
                        setSelectedInfoType={() => { }}
                        backgroundColor={ACTION_BUTTON_UI_BG_COLOR}
                    />
                }


                {timetables.daily_timetables.length > 0 &&
                    <InfoWithSymbolUI
                        infoType={'timetables' as InformationType}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        infoValue={timetables}
                        displayInBlue={false}
                        displayChevron={true}
                        pressable={true}
                        setSelectedInfoValue={() => { setBottomSheet(true) }}
                        setSelectedInfoType={() => { }}
                        backgroundColor={ACTION_BUTTON_UI_BG_COLOR}
                    />
                }


                {isUserAccount &&
                    <InfoWithSymbolUI
                        infoType={'options' as InformationType}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        infoValue={localization.options}
                        displayInBlue={false}
                        displayChevron={false}
                        pressable={true}
                        setSelectedInfoValue={() => { }}
                        setSelectedInfoType={() => { onPressEdit(relatedItem) }}
                        backgroundColor={ACTION_BUTTON_UI_BG_COLOR}
                    />
                }

            </View>

        </View>
    )
}
