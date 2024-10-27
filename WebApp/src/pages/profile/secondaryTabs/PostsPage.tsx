import React, { useEffect, useState } from "react"
import Colors from "../../../assets/Colors"
import NoConnectionUi from '../../../components/ui/NoConnectionUi'
import localization from "../../../utils/localizations"
import SlidingAlert from "../../../components/SlidingAlert"
import { copyString, getAddressDescription, getAppleMapsAddressUrl, getGoogleMapsAddressUrl, getMainDivMinHeight, getParamsFromUrl, getSegmentsFromUrl, openAddressInMaps, isMobileHook } from "../../../components/functions"
import { Geolocation, PageObj, Post } from "../../../Data"
import { WindowWidth } from "../../../components/WindowWidth"
import { getCategoryTypeDescription, ParentDivId } from "../../../Types"
import { PostCategoryMetadataUi, PostUi } from "../../../components/postsRelated"
import { PostsPageHeader } from "../../../components/headersComponents"
import { isIOS, isMacOs } from "react-device-detect"
import { useLocation, useNavigate } from "react-router-dom"
import { BottomSheet } from "../../../components/sheets"
import { Error404Ui } from "../../../components/ui"
import { getAccountMainData, getPostAttributesByPostId, getPostCategoryMetadataAttributesByCategoryId } from "../../../aws/dynamodb"
import { Error404Screen, NoConnectionScreen, LoadingScreen } from "../../../components/screens"


// Global data 
import { useDispatch, useSelector } from "react-redux"
import { appendAccountMainData, selectPagesAccountsMainData } from "../../../state/slices/accountsMainDataSlice"
import { loadPostCategories, loadPosts, selectPagesPostCategories } from "../../../state/slices/postsSlice"
import { selectUiStates, updateUiStateValue } from "../../../state/slices/uiStatesSlice"


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import ActivityIndicator from "../../../components/ActivityIndicator"
import { Helmet } from "react-helmet"
import { ScreenViewTracker } from "../../../analytics"
import PostEditorSheet  from "../../../components/editingSheetRelated.tsx/PostEditorSheet"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


const isMobile = isMobileHook()


interface PostsPageInterface {

}
/**
 * Displays all the posts of a post category. (Used on thin devices)
*/

/**
 * Displays all the posts of a post category. (Used on large devices)
 * Displays a list of posts on the left, the information about the category at the top right and has a light gray background.
*/
export default function PostsPage({ }: PostsPageInterface) {


    // States 
    const [percentageOfCategoryMainInfoHidden, setPercentageOfCategoryMainInfoHidden] = useState(0)
    const [hideCategoryInfo, setHideCategoryInfo] = useState(false) // Wide devices only 
    const [isDeleting, setIsDeleting] = useState(false)


    // Values 
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const windowWidth = WindowWidth()
    const urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    const openFromCategoryId = (getParamsFromUrl(new URL(window.location.href)) as any)["c"] ?? ""
    const openFromPostId = urlSegments[1] ?? ""


    // Global data
    const uiStates = useSelector(selectUiStates)
    const pagePostCategories = useSelector(selectPagesPostCategories).find(pagePostCategory => {

        let containsOpenCategory = pagePostCategory.post_categories.some(postCategory => { return postCategory.metadata.category_id === openFromCategoryId })
        let containsOpenPost = pagePostCategory.post_categories.some(postCategory => {
            let posts_id = postCategory.posts?.flatMap(e => { return e.post_id })
            return posts_id?.includes(openFromPostId)
        })

        return containsOpenCategory || containsOpenPost
    })
    const postCategory = pagePostCategories?.post_categories.find(e => {

        let isOpenCategory = e.metadata.category_id === openFromCategoryId
        let isCategoryWithPost = e.posts?.some(e => { return e.post_id === openFromPostId })

        return isOpenCategory || isCategoryWithPost
    })
    let postOpenFrom = postCategory?.posts?.find(e => { return e.post_id === openFromPostId })
    let otherPosts = (postCategory?.posts?.filter(e => { return e.post_id !== openFromPostId }) ?? []).slice()
        // Sorted by most recently created
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        }) ?? []
    const { short_id } = pagePostCategories?.page ?? PageObj("", "", "")

    const postsInProperOrder = postOpenFrom ? [postOpenFrom].concat(otherPosts) : otherPosts
    const postCategoryIsLoaded = (postCategory?.posts !== undefined) && (postCategory?.metadata !== undefined)
    const account_main_data = useSelector(selectPagesAccountsMainData).find(e => { return e.page.short_id === short_id })?.account_main_data
    const categoryTypeDescription = getCategoryTypeDescription(postCategory?.metadata.type ?? "" as any, postCategory?.metadata?.custom_type ?? "")
    const dummyIsUserAccount = false




    // Initialization (UI SCROLL TOP)__________________
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0 }) // , behavior: "smooth" 
    }, [])
    //_________________________________________________






    // HIDE/SHOW CATEGORY METADATA_____________________
    // Wide devices
    useEffect(() => {

        if (!isMobile) {
            let maxWidth = window.screen.width
            let ratio = windowWidth / maxWidth * 100
            setHideCategoryInfo(ratio <= 65)
        }

    }, [windowWidth])

    // Mobile
    document.onscroll = displayTitleOnMobileIfNeeded // use document.onscroll as window.onscroll is already used for detecting the scrollEndReached()
    useEffect(() => {
        displayTitleOnMobileIfNeeded()
    }, [])
    /**
     * Displays the title when needed.
    */
    function displayTitleOnMobileIfNeeded() {

        if (!isMobile) return

        let categoryMainInfoDiv = document.getElementById("categoryInfoDiv")
        if (categoryMainInfoDiv === null) return

        let measures = categoryMainInfoDiv.getBoundingClientRect()

        const categoryMainInfoHeight = measures.height
        let percentage = Math.abs(measures.y - 44.5) / categoryMainInfoHeight


        //  44.5 145


        /** 
         * The category main info (#) is considered as hidden when the category type (##) is under the header.
         * (#) : black and gray at the left of the post count that indicates the name and type of the category.
         * (##) : gray text at the left of the post count.
        */
        if (percentageOfCategoryMainInfoHidden >= 1 && percentage >= 1) return
        if (percentageOfCategoryMainInfoHidden >= 0 && percentage < 0) return
        setPercentageOfCategoryMainInfoHidden(percentage)

    }
    //__________________________________________________








    // LOADING IF NEEDED________________________________
    /** The page was open from scratch.
     * 
     * Process : 
     * - 1 : get the "account_id" (A), "short_id" (B) and "username" (C).
     * - 2 : load all post categories.
     * 
     * N.B.: loading all the categories is the proper way to do it for the following reason :
     * -> If the user navigates to https://www.atsight.ch/george6paris (all categories are loaded) 
     * -> then to one of it's post categories e.g. https://www.atsight.ch/p?c=fwcSmeWtC/ 
     * -> then refresh the page (only the visible category gets loaded)
     * -> then comes back to https://www.atsight.ch/george6paris (only one category is loaded) 
     * 
     * Errors : 
     * - 1 : no result is found for the query. 
     * - 2 : there is no connection.
    */
    const [noConnection, setNoConnection] = useState(false)
    const [noResultFound, setNoResultFound] = useState(false)
    async function loadPostCategory() {


        // 1.A
        let account_id
        try {
            if (openFromCategoryId === "") {
                let post = await getPostAttributesByPostId(openFromPostId, "account_id")
                account_id = post?.account_id ?? ""
            } else {
                let postCategoryMetadata = await getPostCategoryMetadataAttributesByCategoryId(openFromCategoryId, "all")
                account_id = postCategoryMetadata?.account_id ?? ""
            }

            if (account_id === "") {
                setNoResultFound(true)
                return
            }

        } catch (error: any) {
            setNoConnection(true)
            return
        }

        // 1.A & 1.B
        let accountMainData = await getAccountMainData(account_id)

        // 2
        let page = PageObj(accountMainData?.username ?? "", account_id, accountMainData?.short_id ?? "")
        dispatch(appendAccountMainData({ page: page, accountMainData: accountMainData }))
        dispatch(loadPostCategories(page, dummyIsUserAccount === false) as any)



    }
    useEffect(() => {

        if (!postCategoryIsLoaded) {
            loadPostCategory()
        }

    }, [location])
    //__________________________________________________







    // LOADING EXTRA POSTS______________________________
    // Issue : sometimes can trigger 2 loads at once --> loads items one more time 
    const [isLoadingPosts, setIsLoadingPosts] = useState(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)

    let morePostsCanBeLoaded = (postCategory?.posts?.length ?? 0) < (postCategory?.metadata.post_count ?? 0)

    function handleReachedEnd() {
        if (morePostsCanBeLoaded && !showLoadingIndicator) setShowLoadingIndicator(true)
    }

    useEffect(() => {
        setTimeout(() => {
            if (showLoadingIndicator) loadExtraPosts()
        }, 100)
    }, [showLoadingIndicator])

    async function loadExtraPosts() {

        if (!morePostsCanBeLoaded || isLoadingPosts) {
            console.log("Avoided unwanted loading")
            return
        } else {
            console.log("LOAD")
            if ((postCategory?.posts === undefined)) return
            let oldestCreatedDate = postCategory.posts[postCategory.posts.length - 1].created_date // (Post at the all bottom)
            setIsLoadingPosts(true)
            dispatch(loadPosts(pagePostCategories?.page ?? {} as any, postCategory?.metadata.category_id ?? "", 8, oldestCreatedDate, setIsLoadingPosts, setShowLoadingIndicator, dummyIsUserAccount === false) as any)
        }

    }
    //__________________________________________________






    // BOTTOM SHEETS_____________________________________
    const postCategorySheetOptions = [localization.delete_category, localization.edit_category, localization.cancel]
    const addressSheetOptions = [localization.open_in_maps, localization.copy, localization.cancel]
    const postSheetOptions = [localization.delete, localization.edit, localization.cancel]
    // 
    const [selectedPost, setSelectedPost]: [Post | undefined, any] = useState()
    const [selectedGeolocation, setSelectedGeolocation]: [Geolocation | undefined, any] = useState()
    // 
    let showAddressSheet = window.location.href.includes("#address")
    let showPostSheet = window.location.href.includes("#edit") && !window.location.href.includes("#edit_category")
    let showPostCategorySheet = window.location.href.includes("#edit_category")

    function handlePostCategorySheet(buttonIndex: number) {

        navigate(-1)

        if (selectedGeolocation === undefined) return
        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: console.log("delete"); break
                case 1: console.log("edit"); break
                default: break
            }
        }, 320)

    }
    function handleAddressSheet(buttonIndex: number) {

        navigate(-1)

        if (selectedGeolocation === undefined) return
        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: openAddressInMaps(selectedGeolocation); break
                case 1:
                    let addressUrl = isIOS || isMacOs ? getAppleMapsAddressUrl(selectedGeolocation) : getGoogleMapsAddressUrl(selectedGeolocation)
                    copyString(addressUrl, dispatch)
                    break
                default: break
            }
        }, 320)

    }
    function handlePostSheet(buttonIndex: number) {

        navigate(-1)

        if (selectedGeolocation === undefined) return
        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: console.log("delete"); break
                case 1: console.log("edit"); break
                default: break
            }
        }, 320)

    }
    //___________________________________________________




    if (isMobile) {
        return (
            <div className='flex flex-col'>

                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{categoryTypeDescription !== "" ? `${categoryTypeDescription} - AtSight` : "AtSight"}</title>
                </Helmet>

                <ScreenViewTracker screen_name={"posts"} />

                {(noConnection || noResultFound) ?
                    (noConnection ?
                        <NoConnectionScreen onClick={() => {

                            setNoConnection(false)
                            setTimeout(() => {
                                loadPostCategory()
                            }, 550)

                        }} />
                        :
                        <Error404Screen />
                    )
                    :
                    (postCategoryIsLoaded ?
                        <>
                            <PostsPageHeader
                                onClose={() => {
                                    if (location.key === "default") {
                                        navigate("/")
                                    } else {
                                        navigate(-1)
                                    }
                                }}
                                headertext={getCategoryTypeDescription(postCategory.metadata.type, postCategory.metadata?.custom_type ?? "")}
                                percentageOfCategoryMainInfoHidden={percentageOfCategoryMainInfoHidden}
                                isUserAccount={dummyIsUserAccount}
                                isDeleting={isDeleting}
                                onAddPostPress={() => {

                                }}
                                onClick={() => {
                                    navigate(`${window.location.pathname}#edit_category/${window.location.search}`)
                                }}
                            />
                            <PostCategoryMetadataUi postCategoryMetadata={postCategory.metadata} isUserAccount={false} />
                            <PostsList
                                posts={postsInProperOrder}
                                short_id={short_id}
                                account_name={account_main_data?.account_name ?? ""}
                                isUserAccount={dummyIsUserAccount}
                                showLoadingIndicator={showLoadingIndicator}
                                onClickEdit={(post) => { setSelectedPost(post); navigate(`${window.location.pathname}#edit/${window.location.search}`) }}
                                onClickAddress={(geolocation) => { setSelectedGeolocation(geolocation); navigate(`${window.location.pathname}#address/${window.location.search}`) }}
                                onEndReached={() => {
                                    handleReachedEnd()
                                }}
                            />
                        </>
                        :
                        <LoadingScreen />
                    )}



                {/* Sheets */}
                <BottomSheet
                    show={showPostCategorySheet}
                    options={postCategorySheetOptions}
                    handleClick={handlePostCategorySheet}
                />
                <BottomSheet
                    show={showAddressSheet}
                    options={addressSheetOptions}
                    description={selectedGeolocation !== undefined ? getAddressDescription(selectedGeolocation) : ""}
                    handleClick={handleAddressSheet}
                />
                <BottomSheet
                    show={showPostSheet}
                    options={postSheetOptions}
                    handleClick={handlePostSheet}
                />


                <SlidingAlert
                    slidingAlertType={uiStates.slidingAlertType}
                    resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                />


            </div>
        )
    } else {
        return (
            <div
                id={"PostViewerDiv" as ParentDivId}
                className='flex items-start justify-center text-center'
                style={{
                    minHeight: getMainDivMinHeight(),
                    backgroundColor: Colors.superWhitegray
                }}>


                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{categoryTypeDescription !== "" ? `${categoryTypeDescription} - AtSight` : "AtSight"}</title>
                </Helmet>


                <ScreenViewTracker screen_name={"posts"} />


                {(noConnection || noResultFound) ?
                    (noConnection ?
                        <NoConnectionUi
                            paddingTop={90}
                            onClick={() => {
                                setNoConnection(false)
                                setTimeout(() => {
                                    loadPostCategory()
                                }, 550)
                            }} />
                        :
                        <Error404Ui />
                    )
                    :
                    (postCategoryIsLoaded ?
                        <>
                            {/* Posts */}
                            <div className='flex flex-col' style={{ marginTop: 30, marginBottom: 30 }}>
                                
                                <PostsList
                                    posts={postsInProperOrder}
                                    short_id={short_id}
                                    account_name={account_main_data?.account_name ?? ""}
                                    isUserAccount={dummyIsUserAccount}
                                    showLoadingIndicator={showLoadingIndicator}
                                    onClickEdit={(post) => { setSelectedPost(post); navigate(`${window.location.pathname}#edit/${window.location.search}`) }}
                                    onClickAddress={(geolocation) => { setSelectedGeolocation(geolocation); navigate(`${window.location.pathname}#address/${window.location.search}`) }}
                                    onEndReached={() => {
                                        handleReachedEnd()
                                    }}
                                />
                            </div>

                            {/* Post category info */}
                            {!hideCategoryInfo &&
                                <div
                                    className=""
                                    style={{
                                        marginTop: 30,
                                        marginLeft: 30,
                                        marginRight: 30,
                                        marginBottom: 30,
                                        // top: headerHeight - 140
                                    }}>
                                    <PostCategoryMetadataUi postCategoryMetadata={postCategory.metadata} isUserAccount={dummyIsUserAccount} />
                                </div>
                            }
                        </>
                        :
                        <LoadingScreen />
                    )
                }


                {/* Sheets */}
                <BottomSheet
                    show={showPostCategorySheet}
                    options={postCategorySheetOptions}
                    handleClick={handlePostCategorySheet}
                />
                <BottomSheet
                    show={showAddressSheet}
                    options={addressSheetOptions}
                    description={selectedGeolocation !== undefined ? getAddressDescription(selectedGeolocation) : ""}
                    handleClick={handleAddressSheet}
                />
                <BottomSheet
                    show={showPostSheet}
                    options={postSheetOptions}
                    handleClick={handlePostSheet}
                />

               
                <PostEditorSheet username={account_main_data?.username ?? ""}/>


                <SlidingAlert
                    slidingAlertType={uiStates.slidingAlertType}
                    resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                />

            </div>
        )
    }


}





interface PostsListInterface {
    posts: Post[]
    short_id: string
    account_name: string
    isUserAccount: boolean
    showLoadingIndicator: boolean
    onClickEdit: (post: Post) => any
    onClickAddress: (address: Geolocation) => any
    onEndReached: () => any
}
function PostsList({ posts, short_id, account_name, isUserAccount, showLoadingIndicator, onClickEdit, onClickAddress, onEndReached }: PostsListInterface) {


    // States
    const [alreadyReachedDiv, setAlreadyReachedDiv] = useState([] as string[])


    // Values
    let lastPostId = posts[posts.length - 1]?.post_id ?? ""


    /**
     * Will triggers onEndReached() on each scroll, once it has detected that the last post is starting to be visible.
    */
    function handleEndReached() {


        let listDiv = document.getElementById("postsContainer")
        if (listDiv === null) return

        let listDivMeasures = listDiv.getBoundingClientRect()

        let lastPostDivName = lastPostId + "_div"
        let lastPostDiv = document.getElementById(lastPostDivName)
        if (lastPostDiv === null) return
        let lastPostDivMeasures = lastPostDiv.getBoundingClientRect()
        let lastPostStartsToBeVisible = (listDivMeasures.bottom - window.innerHeight) - lastPostDivMeasures.height <= 0


        // The value of listDivMeasures.bottom gets close to window.innerHeight while scrolling down.
        // Once the end has been reached it remembers of it.
        if (lastPostStartsToBeVisible) {

            if (alreadyReachedDiv.includes(lastPostDivName)) return // Avoids re trigerring hundreds of times once triggered once.
            setAlreadyReachedDiv(prevV => {
                return [...prevV, lastPostDivName] // Remembers of it
            })
            onEndReached()

        } else {

            let index = alreadyReachedDiv.findIndex(e => { return e === lastPostDivName })
            if (index === -1) return
            // Remove the remembering
            setAlreadyReachedDiv(prevV => {
                prevV.splice(index, 1)
                return [...prevV]
            })

        }

    }

    window.onscroll = handleEndReached
    window.onresize = handleEndReached



    return (
        <ul id="postsContainer">
            {posts.map((post: Post) => {
                return (
                    <PostUi
                        key={post.post_id}
                        post={post}
                        short_id={short_id}
                        account_name={account_name}
                        isUserAccount={isUserAccount}
                        onClickEdit={onClickEdit}
                        onClickAddress={onClickAddress}
                    />
                )
            })}

            {showLoadingIndicator &&
                <div className='flex items-center justify-center w-full' style={{ height: 90 }}>
                    <ActivityIndicator color={Colors.smallGrayText} widthAndHeight={isMobile ? 26 : 35} />
                </div>
            }
        </ul>
    )
}



