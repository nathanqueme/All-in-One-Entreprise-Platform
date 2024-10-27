import React, { useState, useEffect } from 'react'
import Colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import ButtonForAddingContent from '../Buttons'
import CategoryAppearance from '../CategoryAppearance'
import { PostCategory } from '../../Data'
import { PostUiPreview } from './index'
import { getCategoryTypeDescription } from '../../Types'
import { GoLeftOrRightButton } from '../Buttons'
import { getUserPreferredLocale } from '../../assets/LanguagesList'
import { isMobileHook } from '../functions'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


const isMobile = isMobileHook()
const userLocale = getUserPreferredLocale()




interface PostCategoryUiInterface {
    postCategory: PostCategory
    widthAndHeight: number
    isUserAccount: boolean
    onAddPostPress: any
    loadingAppearance?: boolean
    wasCreated?: boolean
    username: string
    account_name: string
    short_id: string
}
/** 
 * A block that corresponds to a category with its name, type and first 8 posts. 
*/
export default function PostCategoryUi({ postCategory, widthAndHeight, isUserAccount, onAddPostPress, loadingAppearance = false, wasCreated = false, username, account_name, short_id }: PostCategoryUiInterface) {


    // States 
    const [showLeftChevron, setShowLeftChevron] = useState(false)
    const [showRightChevron, setShowRightChevron] = useState(false)


    // Values
    let categoryContainerId = `${postCategory.metadata.category_id}_category_container`
    let scrollTrackerId = `${postCategory.metadata.category_id}_scroll_Tracker`
    let posts = postCategory.posts?.slice()
        // Sorted by most recently created (ASCENDING order)
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        })
        // Only 8 firsts
        .slice(0, isUserAccount && !loadingAppearance ? 7 : 8) ?? []
    const paddingOnDevices = isMobile ? 20 : 0





    /**
     * Scrolls with an animation to show the next 4 posts
     */
    function show4PreviousOrNextPosts(previousPosts: boolean) {
        let categoryContainer = document.getElementById(categoryContainerId)
        const offset = (widthAndHeight + 7) * 3
        categoryContainer!.scrollLeft = categoryContainer!.scrollLeft + (previousPosts ? -offset : + offset)
    }


    // Initialization (+ update)
    useEffect(() => {
        window.addEventListener("resize", hideOrShowChevronsIfNeeded)
    }, [])
    useEffect(() => {
        hideOrShowChevronsIfNeeded()
    }, [posts.length])



    /**
     * Has the user scrolls or clicks buttons hides or shows chevrons.
     * (Only for desktops)
     */
    function hideOrShowChevronsIfNeeded() {
        if (isMobile) return
        let categoryContainer = document.getElementById(categoryContainerId)


        // Chevron left 
        const hasBeenScrolled = (categoryContainer?.scrollLeft ?? 0) > 0
        setShowLeftChevron(hasBeenScrolled) // has more than 4 - 5 items 

        // Chevron right
        setShowRightChevron(checkIfOneMoreItemCanBeSeen())

    }


    /**
     * Indicates if the user can scroll to look at at least one more item (post or add content button).
    */
    function checkIfOneMoreItemCanBeSeen() {
        let categoryContainer = document.getElementById(categoryContainerId)
        let scrollTracker = document.getElementById(scrollTrackerId)

        if ((!categoryContainer) || (!scrollTracker)) return true

        let categoryContainerRect = categoryContainer.getBoundingClientRect()


        // x of the end of the container once 100% scrolled.
        let containerEnd = categoryContainerRect.x + categoryContainerRect.width

        let someContentIsHidden = (scrollTracker.getBoundingClientRect().x - containerEnd) > 0

        return someContentIsHidden
    }




    return (
        <CategoryAppearance
            title={`${getCategoryTypeDescription(postCategory.metadata.type, postCategory.metadata?.custom_type ?? "")}`}
            subtitle={`${localization.actualized} ${dayjs(postCategory.metadata.update_date).locale(userLocale).fromNow()}`}
            itemsCount={postCategory.metadata.post_count}
            categoryId={postCategory.metadata.category_id}
            loadingAppearance={loadingAppearance}
            wasCreated={wasCreated}
            username={username}
            children={
                <div className='flex justify-start items-center w-full relative'>
                    {/* Show 4 less */}
                    {(showLeftChevron && !loadingAppearance) &&
                        <div className='absolute left-0 moveOfHalfOfMinusItsWidth'
                            style={{
                                marginTop: - 18 - 4 // Height of the small text at the bottom of the post (18px) + spacing between the post and the text (4px)
                            }}>
                            <GoLeftOrRightButton onClick={() => { show4PreviousOrNextPosts(true) }} leftDirection />
                        </div>
                    }

                    {/* Category container */}
                    <div id={categoryContainerId} className='flex justify-start items-center overflow-x-scroll scrollbar-hide scroll-smooth' onScroll={() => { hideOrShowChevronsIfNeeded() }}>
                        <div
                            className='flex justify-start items-center'
                            style={{ paddingLeft: paddingOnDevices, paddingRight: paddingOnDevices }}
                        >
                            {posts.map(e => {
                                return (
                                    <PostUiPreview
                                        key={e.post_id}
                                        post={e}
                                        widthAndHeight={widthAndHeight}
                                        loadingAppearance={loadingAppearance}
                                        username={username}
                                        account_name={account_name}
                                        short_id={short_id}
                                    />
                                )
                            }
                            )}

                            {(isUserAccount && !loadingAppearance) &&
                                <button onClick={() => { onAddPostPress() }} >

                                    <ButtonForAddingContent
                                        widthAndHeight={widthAndHeight >= 215 ? 215 : widthAndHeight}
                                        iconSize={isMobile ? 2.3 : 3.6}
                                    />

                                    <p className='line-clamp-1 text-start' style={{
                                        fontSize: 12,
                                        marginTop: 4,
                                        color: Colors.black,
                                        opacity: loadingAppearance ? 0 : 1
                                    }}>{localization.add}</p>

                                </button>
                            }

                            <div id={scrollTrackerId} style={{ width: 0, height: 0 }}></div>
                        </div>
                    </div>

                    {/* Show 4 more */}
                    {(showRightChevron && !loadingAppearance) &&
                        <div className='absolute right-0 moveOfHalfOfItsWidth'
                            style={{
                                marginTop: - 18 - 4 // Height of the small text at the bottom of the post (18px) + spacing between the post and the text (4px)
                            }}>
                            <GoLeftOrRightButton onClick={() => { show4PreviousOrNextPosts(false) }} />
                        </div>
                    }
                </div>
            } />
    )
}



