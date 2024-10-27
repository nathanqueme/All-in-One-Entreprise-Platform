//
//  HomeTab.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/15/22.
//

import React, { useState, useEffect } from 'react'
import CirclePhoto from '../../../../components/ui/CirclePhoto'
import TextSytlesProvider, { TextStylesInterface } from '../../../../components/styles/TextStyles'
import getColors, { ColorsInterface } from '../../../../assets/Colors'
import ButtonForAddingContent from '../../../../components/ui/ButtonForAddingContent'
import CategoryAppearance from '../../../../components/ui/CategoryAppearance'
import localization from '../../../../utils/localizations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StyleSheet, Text, View, Pressable, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native'
import { ChevronSymbol, CertificationBadge } from '../../../../components/Symbols'
import { getDummyPostCategories, getLocalizedTextText, awaitXMilliSeconds, getYearMonthDate, generateID } from '../../../../components/functions'
import { getUserPreferredLocale, getUserSpokenLanguage } from '../../../../assets/LanguagesList'
import { PostCategory, Post, ImageDataObj, Page, AccountMainDataObj, GeolocationObj, PageObj, AccountMainData } from '../../../../Data'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ClassicButton, ProfileButtonsCapsule, ReloadPageButton, SquareProfileButton } from '../../../../components/Buttons'
import { getCategoryTypeDescription, LoadingFailureType, ProfileButtonType, SlidingAlertType } from '../../../../Types'
import { refreshAndUpdateUserJwtToken } from '../../../../aws/cognito'
import { ProfileNotFoundUi } from '../../../../components/ui/ProfileNotFoundUi'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../../../state/slices/uiStatesSlice'
import { selectHistory, saveSeenAccountMainData } from '../../../../state/slices/historySlice'
import { loadProfilePage, updatePageAccountId } from '../../../../state/slices/pagesSlice'
import { selectPagesAccountsMainData } from '../../../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles } from '../../../../state/slices/profilesSlice'
import { selectPagesPostCategories } from '../../../../state/slices/postsSlice'
import { AccountViewObj, selectAnalytics } from '../../../../analytics'
import { PlatformType } from '../../../../analytics/AnalyticsData'



const userLocale = getUserPreferredLocale()
const screenWidth = Dimensions.get("screen").width


export default function ProfilePage({ navigation, route, pageFailedLoading, setPageFailedLoading, profileNotFound, setprofileNotFound, open_from_qr_code }) {


    // States
    const [listRef, setListRef] = useState(null)
    // Scrolling to edited category 
    const [topHeight, setTopHeight]: [number, any] = useState() // Profile photo + description + profile buttons + related items
    const [heightOfAPostCategory, setHeightOfAPostCategory]: [number, any] = useState()



    // Navigation values 
    let page: Page = route.params.page
    const navigationUsername = route.params.username
    let openFromSettings = route.params?.openFromSettings ?? false
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
    const analytics = useSelector(selectAnalytics)
    const history = useSelector(selectHistory)
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.page_number === page?.page_number ?? '' })


    // Values 
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let scalingRatio = screenWidth / 375 // 375 : iPhone 8 screen width
    // 
    // Account values  
    // N.B. : don't use the username from the accountMainData has the default one has it may not be loaded --> use the one provided by the navigation
    const { account_id, account_name, username, account_type, certified, image_data, geolocation, has_photo } = pageAccountMainData?.account_main_data ?? AccountMainDataObj("", "", "", "", "", "hotel", false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
    let isUserAccount = (account_id === uiStates.account_id && account_id !== "") || overWriteIsUserAccount
    let description = getLocalizedTextText(pageProfile?.profile?.description)
    let hasCategories = ((pagePostCategories?.post_categories.length ?? 0) !== 0)
    let postCategories =
        pagePostCategories?.post_categories.slice()
            /**
             * Sorted by most descending order
             * 
             * N.B.: categories are sorted by descending order because it is easier, faster and cheaper to maintain.
             * Effectively if it was by ascending order each time a category would be created all categories indexes would have to be updated.
             * 
            */
            .sort(function (a, b) {
                if (a.metadata.c_index > b.metadata.c_index) { return -1; }
                if (a.metadata.c_index < b.metadata.c_index) { return 1; }
                return 0;
            })


    // Loading trackers
    let accountMainDataLoaded = typeof pageAccountMainData?.account_main_data === 'object'
    let profileLoaded = (typeof pageProfile?.profile === 'object') ?? false
    let categoriesLoaded = pagePostCategories?.post_categories.every(e => { return typeof e.posts === 'object' }) ?? false


    // For loading 
    let dummyPostCategories = getDummyPostCategories()





    // Token refresh
    useEffect(() => {

        // Will try refreshing user's token so it is already done
        // If it did not worked, it will be refreshed when needed
        if (profileLoaded && isUserAccount) {
            refreshAndUpdateUserJwtToken(username, dispatch)
        }

    }, [profileLoaded])


    // History
    /**
      * Save as a seen account on history 
      * - A - account has no profile photo : updates the information once the accountMainData has been loaded.
      * - B - account has a profile photo : updates the information when the profile photo changes 
      * 
      * - also updates the info when the account name + username are edited
      * 
      * 
    */
    useEffect(() => {

        if (!accountMainDataLoaded || openFromSettings || profileNotFound) return

        // A -
        if (!pageAccountMainData?.account_main_data?.has_photo ?? false) {
            dispatch(saveSeenAccountMainData(pageAccountMainData?.account_main_data, history) as any)
        }
        // B 
        else if ((image_data?.base64 ?? "") !== "") dispatch(saveSeenAccountMainData(pageAccountMainData?.account_main_data, history) as any)


    }, [accountMainDataLoaded, image_data?.base64, account_name, username])


    // User's session 
    /**
     * 
     * - A - Once AccountMainData loaded
     * - B - Once profile photo loaded
     * 
     * Once everything is loaded (A or B), udpates the cache when the AccountMainData is changed. 
     * 
    */
    useEffect(() => {

        if (pageAccountMainData?.account_main_data === undefined || !accountMainDataLoaded || !isUserAccount) return


        if (!pageAccountMainData?.account_main_data?.has_photo ?? false) { // A
            updateAndCacheUserAccountMainData(pageAccountMainData?.account_main_data)
        } else if ((image_data?.base64 ?? "") !== "") { // B
            updateAndCacheUserAccountMainData(pageAccountMainData?.account_main_data)
        }

    }, [pageAccountMainData?.account_main_data])
    async function updateAndCacheUserAccountMainData(accountMainData?: AccountMainData) {

        // 1 - Ui
        let payload: updateUiStateValuePayload = { attribute: "userAccountMainData", value: pageAccountMainData?.account_main_data }
        dispatch(updateUiStateValue(payload))


        // 2 - Cache 
        try {
            await AsyncStorage.setItem("@user_account_main_data", JSON.stringify(accountMainData))
        } catch (error) {
            console.log(error)
        }

    }




    // Loading failure
    useEffect(() => {


        let loadingFailure = uiStates.loadingFailure ?? ""
        if (loadingFailure === "") return
        if (profileLoaded) return // <--- This line may not be needed, as this should not happen


        // Reset 
        let payload: updateUiStateValuePayload = { attribute: 'loadingFailure', value: '' as LoadingFailureType }
        dispatch(updateUiStateValue(payload))


        // Mini alert
        switch (loadingFailure as LoadingFailureType) {
            case "profile_page_loading":
                if (profileNotFound) return
                let payload2: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'no_connection' as SlidingAlertType }
                dispatch(updateUiStateValue(payload2))
                setPageFailedLoading(true)
                break

            case "profile_not_found":
                let payload3: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'profile_not_found' as SlidingAlertType }
                dispatch(updateUiStateValue(payload3))
                setprofileNotFound(true)
                break

        }




    }, [uiStates.loadingFailure])

    // Handles page loaded after failure + loading universal link if any.
    useEffect(() => {
        if (profileLoaded && accountMainDataLoaded) {
            setPageFailedLoading(false)


            // Updates the account_id of the page if was empty 
            if ((page.account_id === "") || (page.short_id === "")) {
                let updatedPage = PageObj(page.page_number, pageProfile.profile.account_id, pageAccountMainData.account_main_data.short_id)
                dispatch(updatePageAccountId({ page: updatedPage }))
                page = updatedPage
            }


        }
    }, [profileLoaded, accountMainDataLoaded])





    // Scroll to edited category (Category editing)
    let editedCategoryId = uiStates.editedCategoryId
    useEffect(() => {


        let editedCategoryIndex = postCategories?.findIndex(e => { return e.metadata.category_id === editedCategoryId })
        if (editedCategoryIndex === -1 || listRef === null) return
        listRef.scrollTo({ x: 0, y: topHeight + heightOfAPostCategory * (editedCategoryIndex), animated: true })


        // Reset
        dispatch(updateUiStateValue({ attribute: 'editedCategoryId', value: "" }))

    }, [editedCategoryId])




    // ANALYTICS 
    useEffect(() => {
        if (!accountMainDataLoaded || isUserAccount || (account_id ?? "") === "") return
        if ((process.env.NODE_ENV !== "production")) return

        let year_month = getYearMonthDate()
        fetch(`https://apis.atsight.ch/analytics/accountsActivity?account_id=${account_id}&year_month=${year_month}&v=1`, { method: "PUT" }).catch(e => { })

        let device_id = analytics.device_id ?? ""
        if (device_id === "") return
        const id = generateID(6)
        const viewing_date = new Date().toISOString()
        const ip = analytics.ip_info?.ip ?? "" // <- will be set by the server if empty
        const country = (analytics.ip_info?.country ?? "").toLowerCase() // 
        const city = (analytics.ip_info?.city ?? "").toLowerCase() // 
        const coordinates = (analytics.ip_info?.loc ?? "").split(",").map(e => { return Number(e) }) // 
        const platform: PlatformType = "app"
        const hl = getUserSpokenLanguage().locale
        const accountView = AccountViewObj(account_id, id, viewing_date, device_id, ip, country, city, coordinates.length > 0 ? [coordinates[1], coordinates[0]] : [], platform, open_from_qr_code, hl)
        fetch(`https://apis.atsight.ch/analytics/accountsViews`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountView) }).catch(e => { })

    }, [accountMainDataLoaded])






    return (
        <ScrollView
            ref={(ref) => { setListRef(ref) }}
            style={{ width: screenWidth }}
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
        >
            <View style={[
                styles.centered, {
                    paddingBottom: insets.bottom + 25
                }]}>



                {/* Header photo (DEPRECATED) */}
                {/*
                    <Pressable
                        disabled={!isUserAccount}
                        onPress={() => {
                            navigation.push('ProfilePhotoEditor', { page: page, isHeaderPhoto: true })
                        }}
                    >
                        <HeaderPhoto
                            base64={headerImageData?.base64 ?? ""}
                            height={screenWidth * 0.27}
                            width={screenWidth}
                            isUserAccount={isUserAccount}
                        />
                    </Pressable>
                */}









                {/* TOP */}
                <View
                    style={[styles.centered, { paddingTop: 25, paddingBottom: 10, width: "100%" }]}
                    onLayout={async (layoutEvent) => {

                        let height = layoutEvent?.nativeEvent?.layout?.height
                        await awaitXMilliSeconds(35) // Avoids disturbing the animation when relatedItems appear
                        if (height !== undefined && topHeight !== height) setTopHeight(height)

                    }}>


                    {/* Profile photo */}
                    <Pressable onPress={async () => {
                        if (!isUserAccount) return
                        navigation.push('ProfilePhotoEditor', { page: pageAccountMainData?.page })
                    }}>
                        <CirclePhoto
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            base64={image_data?.base64 ?? ""}
                            widthAndHeight={
                                scalingRatio * 60 // Keep it small so it does not looks like another app
                            }
                            displayLetterIfNoPhoto={!has_photo ? account_name?.slice(0, 1) ?? "" : undefined}
                        />
                    </Pressable>


                    {/* Name + Certification */}
                    <View style={{ width: '100%', paddingHorizontal: 65, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[TEXT_STYLES.headline, { color: COLORS.black, textAlign: 'center' }]}>{account_name ?? ""}</Text>
                        {(certified ?? false) &&
                            <View style={{ paddingHorizontal: 4 }}>
                                <CertificationBadge COLORS={COLORS} />
                            </View>
                        }
                    </View>


                    {profileLoaded &&
                        <View style={{
                            width: '100%',
                            paddingVertical: 10,
                            justifyContent: "center",
                            alignItems: "center"
                        }}>

                            <TouchableOpacity onPress={() => { navigation.push("AccountInfoTab", { page: pageAccountMainData?.page }) }}>
                                <View style={{
                                    width: screenWidth,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>


                                    {/* Makes the text centered by compensating the rigth chevron. */}
                                    <View style={{ paddingHorizontal: 8, opacity: 0 }}>
                                        <ChevronSymbol />
                                    </View>


                                    <Text
                                        numberOfLines={2}
                                        ellipsizeMode='tail'
                                        style={[TEXT_STYLES.gray13Text, {
                                            flexShrink: 1,
                                            textAlign: "center",
                                        }]}>{description !== "" ? localization.see_information_of_place : isUserAccount ? localization.enter_description : localization.see_information_of_place}
                                    </Text>


                                    <View style={{ paddingHorizontal: 8 }}>
                                        <ChevronSymbol />
                                    </View>


                                </View>
                            </TouchableOpacity>


                            {/* ProfileCounters will be here once there is three and it won't be with the current ui anymore */}


                        </View>
                    }



                    {/* 
                     Profile buttons 
                     N.B.: The 'ProfileButtonsCapsule' is designed to look like a 'BLOCK' rather than seperated single items. This is important as it highly helps to avoid looking like the other main applications with a 3 * 3 grid design.
                    */}
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 7,
                            paddingHorizontal: 20
                        }}
                    >

                        {((isUserAccount && profileLoaded) || (((pageProfile?.profile?.buttons ?? []).length > 0) && profileLoaded)) &&
                            <ProfileButtonsCapsule
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                buttons={pageProfile?.profile.buttons ?? []}
                                onPress={(profile_button_type: ProfileButtonType) => {
                                    switch (profile_button_type) {
                                        case 'map': navigation.push('PdfPage', { page: pageAccountMainData?.page, isMenuViewer: false }); break
                                        case 'menu': navigation.push('PdfPage', { page: pageAccountMainData?.page, isMenuViewer: true }); break
                                        case 'edit': navigation.navigate("ProfileButtonsEditor", { page: pageAccountMainData?.page }); break
                                    }
                                }} />
                        }

                        {(isUserAccount && (pageProfile?.profile.buttons.length ?? 0) > 0) &&
                            <SquareProfileButton
                                COLORS={COLORS}
                                profileButtonType={'edit'}
                                onPress={() => { navigation.navigate("ProfileButtonsEditor", { page: pageAccountMainData?.page }) }}
                                loadingAppearance={(!profileLoaded || pageFailedLoading)}
                            />
                        }


                    </View>
                </View>




                {/* Categories */}
                {categoriesLoaded ?
                    postCategories
                        .map((e) => {
                            return (
                                <PostCategoryUi
                                    key={e.metadata.category_id}
                                    postCategory={e}
                                    scalingRatio={scalingRatio}
                                    isUserAccount={isUserAccount}
                                    // 'See all' or Ellipsis button (Edit button)
                                    onButtonPress={() => {
                                        navigation.navigate('PostsPage', { page: pageAccountMainData?.page, category_id: e.metadata.category_id })
                                    }}
                                    onPostPress={(Post) => {
                                        navigation.navigate('PostsPage', { page: pageAccountMainData?.page, opened_from_post_id: Post.post_id, category_id: e.metadata.category_id })
                                    }}
                                    onAddPostPress={() => {
                                        navigation.navigate('PostEditor', { page: pageAccountMainData?.page, category_id: e.metadata.category_id })
                                    }}
                                    wasCreated={editedCategoryId === e.metadata.category_id}
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                />
                            )
                        })

                    :

                    dummyPostCategories
                        .map((postCategory) => {
                            return (
                                <View
                                    key={postCategory.metadata.category_id}
                                    onLayout={(e) => {
                                        if (heightOfAPostCategory === undefined) setHeightOfAPostCategory(e.nativeEvent.layout.height)
                                    }}>
                                    <PostCategoryUi
                                        key={postCategory.metadata.category_id}
                                        postCategory={postCategory}
                                        scalingRatio={scalingRatio}
                                        isUserAccount={isUserAccount}
                                        onButtonPress={() => { }}
                                        onPostPress={(Post) => { }}
                                        onAddPostPress={() => { }}
                                        loadingAppearance={true}
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                    />
                                </View>
                            )
                        })
                }





                {/* No categories */}
                {(!hasCategories && categoriesLoaded && account_name !== "" && !pageFailedLoading && !profileNotFound) &&
                    (
                        (isUserAccount) ?
                            // Add content 
                            <View style={{ width: "100%", padding: 20 }}>
                                <Text style={[TEXT_STYLES.medium15, { paddingBottom: 4, color: COLORS.black }]}>{localization.getting_started}</Text>
                                <Text style={{ fontSize: 13, color: COLORS.black, marginBottom: 13 }}>{localization.what_to_add_on_categories}</Text>
                                <Text style={[TEXT_STYLES.gray12Text]}>{localization.categories_are_great}</Text>
                            </View>
                            :
                            <Text
                                style={[
                                    TEXT_STYLES.noContentFont, {
                                        textAlign: "center",
                                        paddingHorizontal: 30,
                                        paddingVertical: 80
                                    }]
                                }>{localization.no_categories_to_display}</Text>
                    )
                }



                {/* Add category button + edit categories order button */}
                {(isUserAccount && categoriesLoaded && account_name !== "") &&
                    <View style={{ width: "100%", marginTop: (2 * 13) + 15, marginBottom: 20, display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
                        <Text style={[TEXT_STYLES.gray12Text, { marginHorizontal: 20, flexShrink: 1, marginBottom: 13 }]}>{localization.categories}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "100%" }} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            {/* Before add symbol : <PlusSymbol color={COLORS.darkBlue} /> */}
                            <ClassicButton COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.add_category} smallAppearance onPress={() => { navigation.push('CategoryEditor', { page: pageAccountMainData?.page }) }} backgroundColor={COLORS.softGray}/>
                            <View style={{ width: 16 }} />

                            {/* Before add symbol : <OrderedListSymbol size={20} color={COLORS.darkBlue} /> */}
                            {(pagePostCategories?.post_categories.length ?? 0) >= 2 &&
                                <ClassicButton COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.organize_categories} smallAppearance onPress={() => { navigation.push('PostCategoriesOrderEditor', { page: pageAccountMainData?.page }) }} backgroundColor={COLORS.softGray}/>
                            }
                        </ScrollView>
                    </View>
                }




                {/* Loading failure */}
                {pageFailedLoading && !profileNotFound &&
                    <ReloadPageButton COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} onPress={() => {
                        setPageFailedLoading(false)
                        setTimeout(async () => {
                            dispatch(loadProfilePage(page, navigationUsername, doNotUseUsername, isUserAccount === false) as any)
                        }, 120)
                    }} />
                }
                {profileNotFound &&
                    <ProfileNotFoundUi COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />
                }





            </View>
        </ScrollView>
    )
}








interface PostCategoryUiInterface {
    postCategory: PostCategory
    onButtonPress: any
    onPostPress: any
    scalingRatio: number
    isUserAccount: boolean
    onAddPostPress: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    loadingAppearance?: boolean
    wasCreated?: boolean
}
/**
 *  A block that corresponds to a category with its name, type and first 8 posts. 
*/
function PostCategoryUi({ postCategory, onButtonPress, onPostPress, scalingRatio, isUserAccount, onAddPostPress, loadingAppearance, wasCreated = false, COLORS, TEXT_STYLES }: PostCategoryUiInterface) {


    let posts = postCategory?.posts?.slice()
        // Sorted by most recently created (ASCENDING order)
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        })
        // Only 8 firsts
        .slice(0, isUserAccount ? 7 : 8)


    return (
        <CategoryAppearance
            COLORS={COLORS}
            TEXT_STYLES={TEXT_STYLES}
            title={`${getCategoryTypeDescription(postCategory.metadata.type, postCategory.metadata?.custom_type)}`}
            subtitle={`${localization.actualized} ${dayjs(postCategory.metadata.update_date).locale(userLocale).fromNow()}`}
            itemsCount={postCategory.metadata.post_count}
            paddingTop={15}
            paddingBottom={0}
            onPress={onButtonPress}
            loadingAppearance={loadingAppearance}
            wasCreated={wasCreated}
            children={

                <ScrollView
                    horizontal
                    nestedScrollEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 13, paddingBottom: 10, flexDirection: "row" }}
                >
                    <View style={{ flexDirection: "row" }}>
                        {posts.map(e => {
                            return (
                                <PostPreviewUI
                                    key={e.post_id}
                                    post={e}
                                    scalingRatio={scalingRatio}
                                    loadingAppearance={loadingAppearance}
                                    onPostPress={onPostPress}
                                    COLORS={COLORS}
                                />
                            )
                        }
                        )}


                        {(isUserAccount && !loadingAppearance) &&
                            <Pressable onPress={() => { onAddPostPress() }} >
                                <ButtonForAddingContent COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} widthAndHeight={96 * scalingRatio} />
                                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: 12, paddingTop: 4, width: 96 * scalingRatio, color: COLORS.black }}
                                >{localization.add}</Text>
                            </Pressable>
                        }
                    </View>
                </ScrollView>
            } />
    )
}







interface PostPreviewUIInterface {
    post: Post
    scalingRatio: number
    loadingAppearance: boolean
    onPostPress: any
    COLORS: ColorsInterface
}
function PostPreviewUI({ post, scalingRatio, loadingAppearance = false, onPostPress, COLORS }: PostPreviewUIInterface) {
    /** Dimensions guidelines : 
     * Originally the width and height were of 100 * scalingRatio
     * Dimensions have been scaled down so that it looks more like a 4 * 4 grid rather than a 3 * 3 grid. Especially when there is only 3 posts in a 'PostCategoryUi' so that we can really see that a fourth post is missing as there is a good amount of blank space.
     * N.B. : Like the ProfileButtonsCapsule this is done to avoid looking like a 3 * 3 grid so that the 'ProfilePage' does not looks like other applications.
    */
    let width = 96 * scalingRatio
    let height = 96 * scalingRatio
    let base64 = post?.image_data?.base64 ?? ""

    return (
        <Pressable onPress={() => { onPostPress(post) }} style={{ marginRight: 7 }}>
            {base64 !== "" ?
                <Image
                    key={post.post_id}
                    style={{
                        width: width,
                        height: height,
                        backgroundColor: COLORS.softGray,
                    }}
                    source={{ uri: base64 }}
                />
                :
                <View style={{
                    width: width,
                    height: height,
                    backgroundColor: COLORS.softGray,
                }} />
            }



            {/* Text
       */}
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
                    style={{
                        fontSize: 12,
                        marginTop: 4,
                        width: width,
                        color: COLORS.black,
                    }}>{post.name}</Text>
            }





        </Pressable>
    )
}













const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    centered: {
        justifyContent: 'center',
        alignItems: 'center'
    },



})
