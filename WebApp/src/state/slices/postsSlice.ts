//
//  postsSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import { Page, PagePostCategories, PagePostCategoriesObj, PostCategory, PostCategoryObj, Post, PostCategoryMetadata, ImageDataObj, PostCategoryMetadataObj } from '../../Data'
import { createSlice } from '@reduxjs/toolkit'
import { MathematicalOperation } from '../../Types'

import { queryAllPostCategories, queryPostsByMostRecents } from '../../aws/dynamodb'
import { getUserSpokenLanguage } from '../../assets/LanguagesList'




const initialState: PagePostCategories[] = []


// Interfaces 
export interface PostCountUpdatePayload {
    page: Page
    category_id: string
    operation: MathematicalOperation
    value: number
}
export interface UpdatePostCategoryMetadataAttributePayload {
    page: Page
    category_id: string
    attribute: keyof PostCategoryMetadata
    value: any
}


/* Structure : Pages > PostCategories > Posts
*/
export const postsSlice = createSlice({
    name: 'posts',
    initialState: initialState,
    reducers: {
        appendPosts: (state, action) => {

            // Values
            const { page, category_id, posts }: { page: Page, category_id: string, posts: Post[] } = action.payload


            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) { return }
            let categoryIndex = state[pageIndex]?.post_categories.findIndex(e => { return e.metadata.category_id === category_id }) ?? -1
            if (categoryIndex === -1) { return }


            // Updates
            let categoryHasNoPosts = (state[pageIndex].post_categories[categoryIndex].posts?.length ?? 0) === 0
            switch (categoryHasNoPosts) {
                case true:
                    // console.log('1')
                    state[pageIndex].post_categories[categoryIndex].posts = posts
                    break
                case false:
                    // console.log('2')

                    // Adds the new posts 
                    let newPosts = [] as Post[]
                    posts.map(post => {
                        let postIndex = state[pageIndex].post_categories[categoryIndex].posts?.findIndex(e => { return e.post_id === post.post_id }) ?? -1

                        // Avoids all duplicates
                        if (postIndex !== -1) {
                            state[pageIndex].post_categories[categoryIndex].posts![postIndex] = post
                            console.log(`Avoided duplicate of post : ${post.post_id} on UI`)
                        } else {
                            newPosts.push(post)
                        }

                    })

                    state[pageIndex].post_categories[categoryIndex].posts = state[pageIndex].post_categories[categoryIndex].posts?.concat(newPosts)
                    break
            }

        },
        updatePost: (state, action) => {

            // Values
            const { page, category_id, post }: { page: Page, category_id: string, post: Post } = action.payload


            // Indexes 
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) { return }
            let categoryIndex = state[pageIndex]?.post_categories.findIndex(e => { return e.metadata.category_id === category_id }) ?? -1
            if (categoryIndex === -1) { return }
            let postIndex = state[pageIndex].post_categories[categoryIndex].posts?.findIndex(e => { return e.post_id === post.post_id }) ?? -1
            if (postIndex === -1) { return }


            // Updates 
            if ((state[pageIndex].post_categories[categoryIndex].posts) === undefined) { return }
            else {
                state[pageIndex].post_categories[categoryIndex].posts![postIndex] = post
            }

        },
        removePost: (state, action) => {

            // Values
            const { page, category_id, post_id, animated }: { page: Page, category_id: string, post_id: string, animated: boolean } = action.payload

            // Indexes 
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) { return }
            let categoryIndex = state[pageIndex]?.post_categories.findIndex(e => { return e.metadata.category_id === category_id }) ?? -1
            if (categoryIndex === -1) { return }
            let postIndex = state[pageIndex].post_categories[categoryIndex].posts?.findIndex(e => { return e.post_id === post_id }) ?? -1
            if (postIndex === -1) { return }

            // Updates 
            if ((state[pageIndex].post_categories[categoryIndex].posts) === undefined) { return }
            else {
                state[pageIndex].post_categories[categoryIndex].posts!.splice(postIndex, 1)
            }

        },
        appendPostCategories: (state, action) => {

            // Values 
            const { page, postCategories }: { page: Page, postCategories: PostCategory[] } = action.payload


            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })


            // Updates
            if (pageIndex === -1) {  // Creates a new group for the new page
                let newPagePostCategories = PagePostCategoriesObj(page, postCategories)
                state.push(newPagePostCategories)
            }
            else {  // Adds the new categories 
                state[pageIndex].post_categories = state[pageIndex].post_categories.concat(postCategories)
            }


        },
        updatePostCategory: (state, action) => {

            // Values
            const { page, postCategoryMetadata }: { page: Page, postCategoryMetadata: PostCategoryMetadata } = action.payload


            // Indexes 
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) return
            let postCategoryIndex = state[pageIndex].post_categories.findIndex(e => { return e.metadata.category_id === postCategoryMetadata.category_id })
            if (postCategoryIndex === -1) return

            // Updates
            state[pageIndex].post_categories[postCategoryIndex].metadata = postCategoryMetadata

        },
        updatePostCategoryMetadataAttribute: (state, action) => {

            // Values 
            const { page, category_id, attribute, value }: UpdatePostCategoryMetadataAttributePayload = action.payload


            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) return
            let postCategoryIndex = state[pageIndex].post_categories.findIndex(e => { return e.metadata.category_id === category_id })


            // Updates 
            let post_category_metadata = state[pageIndex].post_categories[postCategoryIndex].metadata as Record<keyof PostCategoryMetadata, any>
            post_category_metadata[attribute] = value


        },
        removePostCategory: (state, action) => {

            // Values
            const { page, category_id }: { page: Page, category_id: string } = action.payload


            // Indexes 
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) return
            let postCategoryIndex = state[pageIndex].post_categories.findIndex(e => { return e.metadata.category_id === category_id })


            // Updates
            state[pageIndex].post_categories.splice(postCategoryIndex, 1)

        },
        updateCategoryPostCount: (state, action) => {

            // Values 
            const { page, category_id, operation, value }: PostCountUpdatePayload = action.payload


            // Indexes
            let pageIndex = state.findIndex(e => { return e.page.username === page.username })
            if (pageIndex === -1) return
            let postCategoryIndex = state[pageIndex].post_categories.findIndex(e => { return e.metadata.category_id === category_id })


            // Updates
            if (operation === '+') {
                state[pageIndex].post_categories[postCategoryIndex].metadata.post_count += value
            } else {
                state[pageIndex].post_categories[postCategoryIndex].metadata.post_count -= value
            }

        },
        clearAccountPostCategories: (state, action) => {

        },
        clearAllPostCategories: state => {
            state = initialState
        },
    }
})


export const { appendPosts, removePost, updatePost,
    appendPostCategories, updatePostCategoryMetadataAttribute, removePostCategory, updatePostCategory,
    updateCategoryPostCount, clearAccountPostCategories, clearAllPostCategories } = postsSlice.actions


export default postsSlice.reducer


// Selector 
export const selectPagesPostCategories = (state: any) => state.pagesPostCategories as PagePostCategories[]
















/** 
  - 1 - Loads values 
  - 2 - Save values for UI 
  - 3 - Launches loading the 8 first posts
*/
export function loadPostCategories(page: Page, onlyLoadLocalizationInUserLanguage = false) {
    return async (dispatch: any, getState: any) => {
        let postCategories: PostCategory[] = []


        // 1
        try {
            const postCategoriesMetada = await queryAllPostCategories(page.account_id)
            postCategoriesMetada.forEach(PostCategoryMetada => {
                let postCategory = PostCategoryObj(PostCategoryMetada, false) // Important to not mention the posts as '[]' but as 'undefined'.
                postCategories.push(postCategory)
            })

        } catch (error) {
            console.error(error)
        }



        // 2 
        dispatch(appendPostCategories({ page: page, postCategories: postCategories }))



        // 3
        postCategories.forEach(e => {
            dispatch(loadPosts(page, e.metadata.category_id, undefined, undefined, undefined, undefined, onlyLoadLocalizationInUserLanguage))
        })


    }
}


 


/**  
  - 1 - Load posts values  
      - A - First 8 most recents
      - B - Next 8 most recent (before the oldest loaded created_date)
  - 2 - Add post to UI (Batch action -> Better performance)
 */
export function loadPosts(page: Page, category_id: string, limit = 8, loadBeforeCreatedDate?: string, setIsLoadingPosts?: (_: boolean) => any, showLoadingIndicator?: (_: boolean) => any, onlyLoadLocalizationInUserLanguage = false) {
    return async (dispatch: any, getState: any) => {


        // console.log('loadBeforeCreatedDate : ' + loadBeforeCreatedDate)
        let posts: Post[] = []
        const hasCreatedDateParameter = loadBeforeCreatedDate !== undefined && loadBeforeCreatedDate !== ''
        const d_l_l = getUserSpokenLanguage().locale


        // 1
        /* Queries the most recent posts of that 'category_id' from that account since 'category_ids' are unique
        */
        switch (hasCreatedDateParameter) {
            // A
            case false:
                // console.log('A')
                posts = await queryPostsByMostRecents(category_id, limit, undefined, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
                break
            // B
            case true:
                // console.log('B')
                posts = await queryPostsByMostRecents(category_id, limit, loadBeforeCreatedDate, undefined, onlyLoadLocalizationInUserLanguage ? d_l_l : undefined)
                break
        }


        // 2 
        dispatch(appendPosts({ page: page, category_id: category_id, posts: posts }))

        if (setIsLoadingPosts !== undefined) {
            setIsLoadingPosts(false)
        }
        if (showLoadingIndicator !== undefined) {
            showLoadingIndicator(false)
        }

    }
}



