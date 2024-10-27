//
//  PostsPage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, useEffect } from 'react'
import getColors, { ColorsInterface } from './../../assets/Colors'
import TextSytlesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'
import localization from '../../utils/localizations'
import { StatusBar, View, Text, Image, Dimensions, Platform, ActionSheetIOS, FlatList, Animated, ActivityIndicator, Alert, LayoutAnimation, useColorScheme, TouchableHighlight, ScrollView } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { PostsPageHeader } from '../../components/Headers'
import { Post, Geolocation, PostCategoryMetadata, Page, PostCategory } from '../../Data'
import { ActionSheet } from '../../components/ui/ActionSheet'
import { openLinkWithInAppWeb, openAddressInMaps, getAddressDescription, getAppleMapsAddressUrl, getGoogleMapsAddressUrl, copyString, shareAddress, getFileName } from '../../components/functions'
import { WebsiteSymbol, MapPinSymbol, EllipsisSymbol, AnalyticsSymbol } from '../../components/Symbols'
import { TranslatableExpandableText } from '../../components/ui/ExpandableText'
import { getUserPreferredLocale } from './../../assets/LanguagesList'
import { getCategoryTypeDescription } from '../../Types'
import { SlidingAlert } from '../../components/SlidingAlert'
import { ScreenViewTracker } from '../../analytics'
import { actionSheetAnimation, layoutAnimation } from '../../components/animations'
import { deletePost, deletePostCategoryMetadata, updatePostCategoryPostCount, updateProfileWithOperation } from '../../aws/dynamodb'
import { deleteContent } from '../../aws/s3'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { selectPagesPostCategories, loadPosts, removePostCategory, removePost, updateCategoryPostCount, PostCountUpdatePayload, updatePostCategoryMetadataAttribute, UpdatePostCategoryMetadataAttributePayload } from '../../state/slices/postsSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { updateProfileValueWithOperation, updateProfileValueWithOperationInterface } from '../../state/slices/profilesSlice'



const userLocale = getUserPreferredLocale()



/**
 * A view to preview a posts from a category related to the pro account.
 */
export default function PostsPage({ navigation, route }) {

    // States 
    const [isLoadingPosts, setIsLoadingPosts] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    //
    const [postCategoryCopy, setPostCategoryCopy] = useState(undefined)
    // Header
    const percentageOfCategoryMainInfoHidden = useRef(new Animated.Value(0)).current
    const [categoryMainInfoHeight, setcategoryMainInfoHeight] = useState(0)


    // Navigation values 
    const { page, opened_from_post_id, category_id } = route.params
    const { page_number, account_id, short_id } = page as Page


    // Global data
    const uiStates = useSelector(selectUiStates)
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.page_number === page_number })
    const dispatch = useDispatch()


    // Values
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const insets = useSafeAreaInsets()
    const listRef = useRef(null)
    let isUserAccount = account_id === uiStates.account_id && account_id !== ""
    let screenWidth = Dimensions.get('screen').width
    // 
    let postCategory: PostCategory = pagePostCategories?.post_categories.find(e => { return e.metadata.category_id === category_id }) ?? (postCategoryCopy ?? [])
    // Sorted by most recently created
    let posts = postCategory?.posts.slice()
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        }) ?? []









    // Action sheet
    const postCategoryActionSheetOptions = [localization.delete_category, localization.edit_category, localization.cancel]
    const addressActionSheetOptions = [localization.open_in_maps, localization.copy, localization.share, localization.cancel]
    const postActionSheetOptions = [localization.delete, localization.edit, localization.cancel]
    const [postCategoryActionSheet, setPostCategoryActionSheet] = useState(false) // Android
    const [addressActionSheet, setAddressActionSheet] = useState(false) // Android
    const [postActionSheet, setPostActionSheet] = useState(false) // Android
    const [selectedPost, setSelectedPost]: [Post, any] = useState()
    const [selectedGeolocation, setSelectedGeolocation]: [Geolocation, any] = useState()
    function openPostCategoryActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setPostCategoryActionSheet(true)

    }
    function openAddressActionSheet(geolocation: Geolocation) {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setAddressActionSheet(true)

    }
    useEffect(() => {
        if ((selectedGeolocation?.country ?? "") !== "") openAddressActionSheet(selectedGeolocation)
    }, [selectedGeolocation])
    function openPostActionSheet() {

        LayoutAnimation.configureNext(actionSheetAnimation)
        setPostActionSheet(true)

    }
    useEffect(() => {
        if ((selectedPost?.account_id ?? "") !== "") openPostActionSheet()
    }, [selectedPost])




    // Android and iOS
    function postCategoryActionSheetPress(index) {
        switch (index) {
            case 0: deletePostCategory(); break
            case 1: navigation.push('CategoryEditor', { page: page, category_id: category_id }); break
            default: console.log("Out of range")
        }
    }
    function addressActionSheetPress(index) {
        switch (index) {
            case 0: openAddressInMaps(selectedGeolocation); break
            case 1:
                // Values 
                let addressUrl = Platform.OS === "ios" ? getAppleMapsAddressUrl(selectedGeolocation) : getGoogleMapsAddressUrl(selectedGeolocation)
                copyString(addressUrl, dispatch)
                break
            case 2: shareAddress(selectedGeolocation); break
            default: console.log("Out of range")
        }

        setSelectedGeolocation(undefined)

    }
    function postActionSheetPress(index: number) {
        switch (index) {
            case 0:
                let file_name = getFileName("post", short_id, selectedPost.post_id)
                deletePostMetadataAndImage(selectedPost.post_id, file_name)
                break
            case 1: navigation.push('PostEditor', { page: page, category_id: category_id, post_id: selectedPost.post_id }); break
            default: console.log("Out of range")
        }

        setSelectedPost(undefined)

    }
    // Reset for Android
    useEffect(() => {
        if (!addressActionSheet) setSelectedGeolocation(undefined)
        if (!postActionSheet) setSelectedPost(undefined)
    }, [addressActionSheet, postActionSheet])





    // Scroll to post (Page opened)
    let openedFromPostAtIndex = posts.findIndex(e => { return e.post_id === opened_from_post_id }) ?? -1
    useEffect(() => {

        if (openedFromPostAtIndex !== -1) {
            listRef.current?.scrollToIndex({ index: openedFromPostAtIndex, animated: false, viewPosition: 0 })
        }

    }, [])



    // Scroll to edited post (Post editing)
    let editedPostId = uiStates.editedPostId
    useEffect(() => {

        let editedPostIndex = posts.findIndex(e => { return e.post_id === editedPostId })
        if (editedPostIndex === -1) return
        listRef.current?.scrollToIndex({ index: editedPostIndex, animated: false, viewPosition: 0 })

        // Reset
        dispatch(updateUiStateValue({ attribute: 'editedPostId', value: "" }))

    }, [editedPostId])



    // Loading of additional posts
    useEffect(() => {
        setIsLoadingPosts(false)
    }, [posts.length])


    /**
      * - 1 - Delete the postCategory metadata
      * - 2 - Update "category_count"
      * - 3 - Update UI 
    */
    async function deletePostCategory() {

        // Preparation

        // Security (in the future will let the user delete a category even if it is filled but will still notify the user with somethong like 'Are you sure you want to delete this category. or Warning', 'Deleting this category will permanently delete the 184 posts it contains.')
        // + the deletion will not be immediate so the user will be able to recover its deleted category during 31 days.
        if (posts.length > 0) {
            Alert.alert(localization.category_filled, localization.category_filled_error_message)
            return
        }
        setIsDeleting(true)
        setPostCategoryCopy(postCategory)




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
            await deletePostCategoryMetadata(account_id, category_id, jwtToken)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }



        // Step 2 : category_count
        await updateProfileWithOperation(account_id, "category_count", "-", 1, jwtToken)



        // Step 3 : UI 
        dispatch(removePostCategory({ page: page, category_id: category_id }))

        let payload: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "category_count", operation: "-", ofValue: 1 }
        dispatch(updateProfileValueWithOperation(payload))

        setTimeout(() => {
            navigation.goBack()
            setIsDeleting(false)
        }, 100) // A minimum of 100 millisecond of latency is needed after the UI is updated so the image does not has a glitch.


    }


    /**
     * - 1 - Delete the relatedItem metadata.
     * - 2 - Delete its image.
     * - 3 - Decrease the categorie's "post_count".
     * - 4 - Update profile's "post_count"
     * - 5 - Update UI 
    */
    async function deletePostMetadataAndImage(post_id: string, file_name: string) {


        // Preparation
        setIsDeleting(true)
        let current_date = new Date().toISOString()




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
        console.log("Token refreshed")





        // Step 1 : Metadata
        try {
            await deletePost(account_id, post_id, jwtToken)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }
        console.log("Step 1 done")




        // Step 2 : Image 
        try {
            await deleteContent(jwtToken, 'anyid-eu-west-1', file_name)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }
        console.log("Step 2 done")



        // Step 3 : Post count (Category)
        try {
            await updatePostCategoryPostCount(account_id, category_id, '-', 1, current_date, jwtToken)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsDeleting(false)
            return
        }
        console.log("Step 3 done")


        // Step 4 : Post count (Profile)
        await updateProfileWithOperation(account_id, "post_count", "-", 1, jwtToken)
        console.log("Step 4 done")



        // Step 5 : UI 
        // A (post)
        dispatch(removePost({ page: page, category_id: category_id, post_id: post_id, animated: true }))
        LayoutAnimation.configureNext(layoutAnimation) // Animates the deletion of the post
        // B (post count in category)
        let payload: PostCountUpdatePayload = { page: page, category_id: category_id, operation: '-', value: 1 }
        dispatch(updateCategoryPostCount(payload))
        // C (update date)
        let payload2: UpdatePostCategoryMetadataAttributePayload = { page: page, category_id: category_id, attribute: "update_date", value: current_date }
        dispatch(updatePostCategoryMetadataAttribute(payload2))

        let payload3: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "post_count", operation: "-", ofValue: 1 }
        dispatch(updateProfileValueWithOperation(payload3))


        setIsDeleting(false)


    }



    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"posts"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={postActionSheet || postCategoryActionSheet || addressActionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <PostsPageHeader
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onClose={() => { navigation.goBack() }}
                    headertext={getCategoryTypeDescription(postCategory.metadata.type, postCategory.metadata.custom_type)}
                    percentageOfCategoryMainInfoHidden={percentageOfCategoryMainInfoHidden}
                    isUserAccount={isUserAccount}
                    isDeleting={isDeleting}
                    onAddPostPress={() => {
                        navigation.push('PostEditor', { page: page, category_id: category_id })
                    }}
                    onPress={() => {
                        openPostCategoryActionSheet()
                        // navigation.push('PostEditor', { page: page, category_id: category_id })
                    }}
                />




                <FlatList
                    ref={listRef}
                    data={posts}
                    keyExtractor={Post => { return Post.post_id }}
                    // Scrolls to index
                    onScrollToIndexFailed={info => {
                        // Scrolls to the post when the page appears as it does not works the first time.
                        const wait = new Promise(resolve => setTimeout(resolve, 1))
                        wait.then(() => {
                            listRef.current?.scrollToIndex({ index: openedFromPostAtIndex, animated: false })
                        })
                    }}
                    // Header animation
                    onScroll={(e) => {

                        let offsetValue = e.nativeEvent.contentOffset.y
                        let percentage = offsetValue / (20 + categoryMainInfoHeight) * 100


                        /** 
                         * The category main info (#) is considered as hidden when the category type (##) is under the header.
                         * (#) : black and gray at the left of the post count that indicates the name and type of the category.
                         * (##) : gray text at the left of the post count.
                        */
                        percentageOfCategoryMainInfoHidden.setValue(percentage / 100)


                    }}
                    // Loads more posts if any 
                    onEndReachedThreshold={0.5} // the smaller it is the more the user has to scroll at the bottom
                    onEndReached={() => {
                        // alert((posts.length+' '+postCategory.metadata.post_count+ ' '+ (posts.length < postCategory.metadata.post_count))
                        if ((!isLoadingPosts) && (posts.length < postCategory.metadata.post_count)) {

                            let oldestCreatedDate = posts[posts.length - 1].created_date // (Post at the all bottom)
                            setIsLoadingPosts(true)
                            dispatch(loadPosts(page, category_id, 8, oldestCreatedDate, isUserAccount === false) as any)

                        }
                    }}
                    ListHeaderComponent={
                        <PostCategoryMetadataUi
                            postCategoryMetadata={postCategory.metadata}
                            setcategoryMainInfoHeight={(height) => { setcategoryMainInfoHeight(height) }}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />
                    }
                    renderItem={({ item, index }) => (
                        <PostUi
                            post={item}
                            screenWidth={screenWidth}
                            isUserAccount={isUserAccount}
                            onPressEdit={(post: Post) => {
                                setSelectedPost(post)
                            }}
                            onPressAddress={(geolocation: Geolocation) => {
                                setSelectedGeolocation(geolocation)
                            }}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />
                    )}
                    ListFooterComponent={
                        <View style={{ marginBottom: insets.bottom }}>
                            {isLoadingPosts &&
                                <View style={{ paddingVertical: 40 }}>
                                    <ActivityIndicator />
                                </View>
                            }
                        </View>
                    }
                />





            </SafeAreaView>




            {/* Android */}
            {/* PostCategory */}
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                show={postCategoryActionSheet}
                setShow={setPostCategoryActionSheet}
                options={postCategoryActionSheetOptions}
                actionSheetPress={postCategoryActionSheetPress}
            />
            {/* Address */}
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                show={addressActionSheet}
                setShow={setAddressActionSheet}
                options={addressActionSheetOptions}
                description={getAddressDescription(selectedGeolocation)}
                actionSheetPress={addressActionSheetPress}
            />
            {/* Post */}
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                show={postActionSheet}
                setShow={setPostActionSheet}
                options={postActionSheetOptions}
                actionSheetPress={postActionSheetPress}
            />




            <SlidingAlert
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                topInset={insets.top}
                bottomInset={insets.bottom}
                slidingAlertType={uiStates.slidingAlertType}
                resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                slideFromBottom={true}
            />



        </SafeAreaProvider>
    )
}




interface PostCategoryMetadataUiInterface {
    postCategoryMetadata: PostCategoryMetadata
    setcategoryMainInfoHeight: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * information about a post category. 
 * It's amount of posts, it's title and updated date.
 */
function PostCategoryMetadataUi({ postCategoryMetadata, setcategoryMainInfoHeight, COLORS, TEXT_STYLES }: PostCategoryMetadataUiInterface) {
    return (
        <View
            style={{
                padding: 20,
                paddingBottom: 35
            }}
            onLayout={(event) => {
                let height = event.nativeEvent.layout.height
                setcategoryMainInfoHeight(height)
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    width: '100%',
                }}>



                {/* Post count */}
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 90,
                        height: 90,
                        backgroundColor: COLORS.softGray
                    }}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={{
                            fontSize: 20,
                            fontWeight: '800',
                            color: COLORS.black
                        }}>{postCategoryMetadata?.post_count ?? 0}</Text>
                    <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={{
                            fontSize: 15,
                            color: COLORS.black,
                            paddingHorizontal: 15
                        }}>{localization.posts}</Text>
                </View>



                {/* Main info + update date */}
                <View
                    style={{
                        alignItems: 'flex-start',
                        paddingLeft: 20,
                        flex: 1,
                    }}>
                    <View
                        style={{
                            flex: 1,
                            paddingBottom: 20, // keeps a minimum between the 'CategoryMainInfo' and update date text
                        }}>
                        {/* CategoryMainInfo */}
                        <View>
                            <Text style={[TEXT_STYLES.bold15, { color: COLORS.black }]}>{getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata.custom_type)}</Text>
                            {/*
                            <Text
                                style={[
                                    TEXT_STYLES.gray13Text,
                                    { marginTop: 7, color: COLORS.black }
                                ]}
                            >{getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata.custom_type)}</Text>
                            */}
                        </View>
                    </View>


                    <Text style={[TEXT_STYLES.gray13Text, {}]} >{localization.actualized + " " + dayjs(postCategoryMetadata.update_date).locale(userLocale).fromNow()}</Text>

                </View>


            </View >



            {/* Description + Translate button */}



        </View>
    )
}



interface PostUiInterface {
    post: Post
    screenWidth: number
    isUserAccount: boolean
    onPressEdit: any
    onPressAddress: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * Displays the photo and the information of a post.
 */
function PostUi({ post, screenWidth, isUserAccount, onPressEdit, onPressAddress, COLORS, TEXT_STYLES }: PostUiInterface) {
    return (
        <View key={post.post_id}>
            <Image
                style={{
                    resizeMode: 'cover',
                    width: '100%',
                    height: screenWidth * post.image_data.height_width_ratio ?? 1, // Height based on the screen's width
                    backgroundColor: COLORS.softGray,
                }}
                source={{ uri: post.image_data?.base64 ?? '' }}
            />


            <View style={{ paddingVertical: 20, alignItems: 'flex-start' }}>
                {/* Name */}
                <Text
                    style={[
                        TEXT_STYLES.bold15, {
                            flex: 1,
                            paddingHorizontal: 20,
                            color: COLORS.black
                        }
                    ]} >{post.name}{<Text style={[TEXT_STYLES.gray13Text, { fontWeight: '400' }]}>{" • " + dayjs(post.created_date).locale(userLocale).fromNow()}</Text>}</Text>


                {/* Description + Translate button */}
                <TranslatableExpandableText
                    COLORS={COLORS}
                    description={post?.description}
                    description_localization={post?.description_localization}
                    textType={'post_description'}
                    uniqueId={post.post_id}
                    marginTop={11}
                    marginHorizontal={20}
                />





                {/* Actions buttons  
                    Design comment : 
                     - An "Icon only" design looks great but may feel like an other app too much
                     - An "Action Button / Icon mix" design looks interesting (One styled "ActiveButton" (gray background, text, and it's icon, rounded border) at the left followed by "simple icons" (just an icon) at the right)
                     - Only "Action buttons"  is the current style for the moment
                */}
                <ScrollView horizontal style={{
                    width: "100%", marginTop: 18 // 14 before
                }} contentContainerStyle={{
                    paddingHorizontal: 18 // 8 before
                }}>
                    {(post?.link_url ?? '') !== '' &&
                        <ActionButton type={"link"} marginRight onPress={() => { openLinkWithInAppWeb(post.link_url) }} COLORS={COLORS} />
                    }
                    {(((post.geolocation?.country ?? '') !== '') && ((post.geolocation?.auto_generated ?? false) === false)) &&
                        <ActionButton type={"address"} marginRight onPress={() => { onPressAddress(post.geolocation) }} COLORS={COLORS} />
                    }
                    {isUserAccount &&
                        <ActionButton type={"options"} marginRight onPress={() => { onPressEdit(post) }} COLORS={COLORS} />
                    }
                </ScrollView>
            </View>
        </View >
    )
}


type ActionButtonType = 'link' | 'share' | 'address' | 'options' | 'analytics'
interface ActionButtonInterface {
    type: ActionButtonType
    onPress: () => any
    COLORS: ColorsInterface
    pressable?: boolean
    placeholder?: string
    marginRight?: boolean
}
/** Enables users to interact with the content they are seeing. For instance by looking at the linked website, address or sharing the content. */
export function ActionButton({ type, onPress, pressable = true, placeholder, marginRight = false, COLORS }: ActionButtonInterface) {

    const border_radius = 80
    const padding = 10.5
    const margin_right = marginRight ? 14 : 0

    function getIcon() {
        switch (type) {
            case 'address': return <MapPinSymbol COLORS={COLORS} size={20} />
            case 'analytics': return <AnalyticsSymbol COLORS={COLORS} size={20} />
            case 'link': return <WebsiteSymbol COLORS={COLORS} size={20} />
            case 'options': return <EllipsisSymbol COLORS={COLORS} size={19} />
            case 'share': return null
        }
    }
    function getPlaceholder() {
        if ((placeholder ?? "").replace(/\s+/g, '') !== "") return placeholder
        switch (type) {
            case 'address': return localization.address
            // case 'analytics': return localization.analytics
            case 'link': return localization.link
            // case 'options': return localization.options
            case 'share': return localization.share
        }
    }

    function UI(marginRight = 0) {
        return ((type === "options") || (type === "analytics")) ?
            <View style={{ height: 36, width: 36, padding: padding, backgroundColor: COLORS.softGray, borderRadius: border_radius, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <View style={{ position: "absolute" }}>{getIcon()}</View>
            </View>
            :
            <View style={{ height: 36, marginRight: marginRight, paddingLeft: padding, backgroundColor: COLORS.softGray, borderRadius: border_radius, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                {getIcon()}
                <Text style={{ paddingLeft: 6, paddingRight: padding, paddingVertical: padding, fontSize: 13, fontWeight: "500", color: COLORS.black }}>{getPlaceholder()}</Text>
            </View>
    }

    if (pressable) {
        return (
            <TouchableHighlight activeOpacity={0.9} onPress={() => { onPress() }} style={{ borderRadius: border_radius, marginRight: margin_right }}>
                {UI()}
            </TouchableHighlight>
        )
    } else {
        return UI(margin_right)
    }
}