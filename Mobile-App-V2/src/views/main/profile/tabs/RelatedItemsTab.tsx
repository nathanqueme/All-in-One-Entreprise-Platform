//
//  RelatedItemsTab.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/15/22.
//

import React, { useEffect, useState, useRef } from 'react'
import TextSytlesProvider, { TextStylesInterface } from '../../../../components/styles/TextStyles'
import getColors, { ColorsInterface } from '../../../../assets/Colors'
import ButtonForAddingContent from '../../../../components/ui/ButtonForAddingContent'
import localization from '../../../../utils/localizations'
import { Text, View, Pressable, ScrollView, FlatList, Dimensions, Image, TouchableHighlight } from 'react-native'
import { RelatedItem, ImageDataObj, Page, AccountMainDataObj, GeolocationObj, PageObj } from '../../../../Data'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { capitalize, getDummyRelatedItems } from '../../../../components/functions'
import { TabType } from '../../../../components/ui/TabsRelated'
import { SlidingAlertType } from '../../../../Types'
import { ReloadPageButton, SimpleCenteredButton } from '../../../../components/Buttons'
import { ProfileNotFoundUi } from '../../../../components/ui/ProfileNotFoundUi'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


// Global data´
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../../../state/slices/uiStatesSlice'
import { appendRelatedItems, getRelatedItems, selectPagesRelatedItems } from '../../../../state/slices/relatedItemsSlice'
import { selectPagesAccountsMainData } from '../../../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles } from '../../../../state/slices/profilesSlice'
import { loadProfilePage } from '../../../../state/slices/pagesSlice'





const screenWidth = Dimensions.get("screen").width
const scalingRatio = screenWidth / 375






interface RelatedItemsTabInterface {
    navigation
    route
    currentTab: TabType
    profileNotFound: boolean
}
export default function RelatedItemsTab({ navigation, route, currentTab, profileNotFound }: RelatedItemsTabInterface) {

    // States
    const [triedLoadingRelatedItems, setTriedLoadingRelatedItems] = useState(false)
    const [isLoadingRelatedItems, setIsLoadingRelatedItems] = useState(false)
    const [failedLoading, setFailedLoading] = useState(false)



    // Navigation values 
    let page: Page = route.params.page
    const navigationUsername = route.params.username
    let doNotUseUsername = route.params?.doNotUseUsername ?? false
    /**
     * This is for that the page looks like user's account even if it has not been loaded yet.
     * This is particularly usefull when the profile page can not be opened
     * To see this : --> Open the app sign in to a dummy place then close the app --> remove your internet connecion and open it back --> the application will try to load your "ProfilePage" and will have the proper isUserAccount === true appearance.
    */
    const overWriteIsUserAccount = route.params.overWriteIsUserAccount ?? false



    // Global data
    // const globalValues = useSelector(state => state)
    const dispatch = useDispatch()
    const uiStates = useSelector(selectUiStates)
    const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.page_number === page?.page_number ?? "" })
    const accountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? "" })?.account_main_data
    const profile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page?.page_number ?? "" })?.profile



    // Values 
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const insets = useSafeAreaInsets()
    const listRef = useRef(null)
    const dummyRelatedItems = getDummyRelatedItems()
    // 
    // Account values  
    // N.B. : don't use the username from the accountMainData has the default one has it may not be loaded --> use the one provided by the navigation
    let { account_id, short_id, account_name, username, account_type, certified, image_data, geolocation } = accountMainData ?? AccountMainDataObj("", "", "", "", "", "hotel", false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
    let isUserAccount = (account_id === uiStates.account_id && account_id !== "") || overWriteIsUserAccount
    let relatedItems = pageRelatedItems?.related_items?.slice()
        // Sorted by most recently created
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        })
    let hasRelatedItems = ((relatedItems?.length ?? 0) !== 0)
    let related_items_count = profile?.related_items_count
    let pageWithAccountId = PageObj(page.page_number, account_id, short_id)


    // Loading trackers
    let relatedItemsLoaded = typeof relatedItems === 'object'




    // Initialization (load)
    useEffect(() => {
        if (triedLoadingRelatedItems) return
        if (currentTab !== "home") loadingFirstRelatedItems() // <-- More joyfull to have it already loaded when the user scrolls all to the right and then to that tab. (Home -> About -> In the place)
    }, [currentTab])





    // - 1 - if the profile + accountMainData has not been loaded yet load it then step 2 if success
    // - 2 - Load RelatedItems 
    const [loadFirstRelatedItemsOnceProfileLoaded, setLoadFirstRelatedItemsOnceProfileLoaded] = useState(false)
    async function loadingFirstRelatedItems() {

        if (profileNotFound) return
        setTriedLoadingRelatedItems(true)



        // 1 (Profile + AccountMainData could not be loaded)
        if ((username ?? "") === "") {
            setTimeout(async () => {
                dispatch(loadProfilePage(page, navigationUsername, doNotUseUsername, isUserAccount === false) as any)
                setLoadFirstRelatedItemsOnceProfileLoaded(true)
            }, 120)

            return
        }



        // 2 
        let rItems: RelatedItem[] = []
        try {
            rItems = await getRelatedItems(pageWithAccountId, 12, undefined, isUserAccount === false)
        } catch (error) {
            setFailedLoading(true)
            return
        }
        dispatch(appendRelatedItems({ page: pageWithAccountId, relatedItems: rItems }))
        setLoadFirstRelatedItemsOnceProfileLoaded(false)



    }
    useEffect(() => {

        if ((related_items_count !== undefined) && (loadFirstRelatedItemsOnceProfileLoaded)) {
            loadingFirstRelatedItems()
        }

    }, [related_items_count])







    // Loading failure
    useEffect(() => {

        if (!failedLoading || currentTab !== "related_items") return
        if (relatedItemsLoaded) return // <--- This line may not be needed, as this should not happen

        // Mini alert
        let payload2: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'no_connection' as SlidingAlertType }
        dispatch(updateUiStateValue(payload2))

    }, [failedLoading])
    useEffect(() => {

        if (uiStates.loadingFailure) {
            setFailedLoading(true)
        }

    }, [uiStates.loadingFailure])
    // Handles page loaded after failure
    useEffect(() => {
        if (relatedItemsLoaded) setFailedLoading(false)
    }, [relatedItemsLoaded])







    // Scroll to edited category (Category editing)
    let editedRelatedItemId = uiStates.editedRelatedItemId
    useEffect(() => {

        let editedCategoryIndex = relatedItems?.findIndex(e => { return e.item_id === editedRelatedItemId })
        if (editedCategoryIndex === -1 || listRef === null) return
        listRef?.current?.scrollToOffset({ offset: 0 })


        // Reset
        setTimeout(() => {
            dispatch(updateUiStateValue({ attribute: 'editedRelatedItemId', value: "" }))
        }, 600)


    }, [editedRelatedItemId])







    return (
        <View
            style={[
                {
                    alignItems: "center",
                    height: "100%",
                    width: screenWidth
                }]}>




            {/* Related Items */}
            {relatedItemsLoaded &&
                (
                    hasRelatedItems || (!hasRelatedItems && isUserAccount) ?
                        <FlatList
                            ref={listRef}
                            data={relatedItemsLoaded ? relatedItems : dummyRelatedItems}
                            nestedScrollEnabled
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: insets.bottom, paddingVertical: 10 }}
                            keyExtractor={RelatedItem => { return RelatedItem.item_id }}
                            renderItem={({ item, index }) => (
                                <RelatedItemPreviewUi
                                    relatedItem={item}
                                    scalingRatio={scalingRatio}
                                    loadingAppearance={!relatedItemsLoaded}
                                    onPress={() => {
                                        navigation.navigate('RelatedItemsPage', { page: page, opened_from_item_id: item.item_id, })
                                    }}
                                    wasCreated={editedRelatedItemId === item.item_id}
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                />
                            )}
                            ListFooterComponent={
                                <View>
                                    {(isUserAccount && relatedItemsLoaded) &&
                                        <Pressable
                                            onPress={() => {
                                                navigation.push('RelatedItemEditor', { page: page })
                                            }}
                                        >
                                            <View
                                                style={{
                                                    justifyContent: "flex-start",
                                                    alignItems: "center",
                                                    flexDirection: "row",
                                                    marginVertical: 10,
                                                    marginBottom: 10,
                                                    marginHorizontal: 20,
                                                    width: screenWidth - 40,
                                                }}>



                                                <ButtonForAddingContent TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} widthAndHeight={78 * scalingRatio} />




                                                <Text
                                                    numberOfLines={1}
                                                    ellipsizeMode='tail'
                                                    style={[TEXT_STYLES.medium15, {
                                                        marginLeft: 20,
                                                        marginTop: 4,
                                                        color: COLORS.black,
                                                    }]}>{localization.add}</Text>
                                            </View>
                                        </Pressable>
                                    }


                                    {(relatedItems.length < related_items_count) &&
                                        <View style={{ marginVertical: 10 }}>
                                            <SimpleCenteredButton
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                text={capitalize(localization.see_more)}
                                                onPress={async () => {

                                                    let oldestCreatedDate = relatedItems[relatedItems.length - 1].created_date // (Related item at the all bottom)
                                                    setIsLoadingRelatedItems(true)

                                                    try {
                                                        let rItems = await getRelatedItems(pageWithAccountId, 12, oldestCreatedDate, isUserAccount === false)
                                                        dispatch(appendRelatedItems({ page: pageWithAccountId, relatedItems: rItems }))
                                                        setIsLoadingRelatedItems(false)
                                                    } catch (error) {
                                                        setIsLoadingRelatedItems(false)
                                                        let payload: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'no_connection' as SlidingAlertType }
                                                        dispatch(updateUiStateValue(payload))
                                                    }

                                                }}
                                                isLoading={isLoadingRelatedItems}
                                            />
                                        </View>
                                    }
                                </View>
                            }
                        />
                        :
                        /* No related items */
                        (!isUserAccount && account_name !== "" && !failedLoading) &&
                        <ScrollView contentContainerStyle={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                            <Text
                                style={[
                                    TEXT_STYLES.noContentFont, {
                                        textAlign: "center",
                                        paddingHorizontal: 30,
                                    }]
                                }>{localization.nothing_to_display}</Text>
                        </ScrollView>
                )
            }








            {/* Loading failure */}
            {(failedLoading && !relatedItemsLoaded && !profileNotFound) &&
                <ScrollView contentContainerStyle={{ alignItems: "center", flex: 1 }}>
                    <ReloadPageButton
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        onPress={() => {
                            setFailedLoading(false)
                            setTimeout(async () => {
                                loadingFirstRelatedItems()
                            }, 620)
                        }} />
                </ScrollView>
            }
            {
                profileNotFound &&
                <ScrollView contentContainerStyle={{ alignItems: "center", flex: 1 }}>
                    <ProfileNotFoundUi COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />
                </ScrollView>
            }








        </View >
    )
}





interface RelatedItemPreviewUiInterface {
    relatedItem: RelatedItem
    scalingRatio: number
    loadingAppearance: boolean
    onPress: any
    wasCreated: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
function RelatedItemPreviewUi({ relatedItem, scalingRatio, loadingAppearance = false, onPress, wasCreated, COLORS, TEXT_STYLES }: RelatedItemPreviewUiInterface) {

    /** Dimensions guidelines : 
     * The width and height are of 78 * scalingRatio 
     * -> So it looks smaller than a PostPreviewUi with dimensions of 96 * scalingRatio.
    */
    let width = 78 * scalingRatio
    let height = 78 * scalingRatio
    let base64 = relatedItem?.image_data?.base64 ?? ""

    return (
        <TouchableHighlight
            onPress={() => { onPress(relatedItem) }}
            activeOpacity={1}
        >
            <View style={{
                justifyContent: "flex-start",
                alignItems: "center",
                flexDirection: "row",
                paddingVertical: 10,
                paddingHorizontal: 20,
                width: screenWidth,
                backgroundColor: wasCreated ? COLORS.newItemBlue : COLORS.whiteToGray2
            }}>
                {base64 !== "" ?
                    <Image
                        key={relatedItem.item_id}
                        style={{
                            width: width,
                            height: height,
                            backgroundColor: COLORS.softGray,
                            marginRight: 20
                        }}
                        source={{ uri: base64 }}
                    />
                    :
                    <View style={{
                        width: width,
                        height: height,
                        backgroundColor: COLORS.softGray,
                        marginRight: 20
                    }} />
                }



                {/* Text */}
                {loadingAppearance ?
                    <View style={{
                        width: 40,
                        height: 14,
                        marginTop: 4,
                        backgroundColor: loadingAppearance ? COLORS.softGray : COLORS.clear
                    }} />

                    :

                    <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={[TEXT_STYLES.medium15, {
                            marginTop: 4,
                            width: width,
                            color: COLORS.black,
                        }]}>{relatedItem.name}</Text>
                }
            </View>
        </TouchableHighlight>
    )
}




