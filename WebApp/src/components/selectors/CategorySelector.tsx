//
//  CategorySelection.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 11/19/22.
//

import React from 'react'
import localization from '../../utils/localizations'
import SelectedCircle from '../SelectedCircle'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import { PostCategoryMetadata } from '../../Data'
import { getCategoryTypeDescription } from '../../Types'


interface SelectableCategoryInfoUiInterface {
    postCategoryMetadata: PostCategoryMetadata
    isSelected: boolean
    onClick: () => any
}
/**
 * A selectable category with its name, post count and selectedCircle.
 * 
 * Could have categorie's view count later on & if hidden by user.
 */
export function SelectableCategoryInfoUi({ postCategoryMetadata, isSelected, onClick }: SelectableCategoryInfoUiInterface) {

    let name = getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata.custom_type)
    let description = `${postCategoryMetadata.post_count} ${localization.posts}`

    return (
        <button
            className='hover:brightness-95 flex items-center justify-between w-full overflow-hidden'
            style={{ backgroundColor: Colors.white }}
            onClick={() => { onClick() }}
        >

            <div className='flex flex-col items-start justify-center' style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}>
                <p style={Object.assign({}, TextStyles.medium15, { color: Colors.black })}>{name}</p>
                <p style={Object.assign({}, TextStyles.gray13Text, { marginTop: 2 })} className='text-start'>{description}</p>
            </div>


            <div style={{ paddingRight: 20 }}>
                <SelectedCircle isSelected={isSelected} />
            </div>

        </button>
    )
}




interface SelectablePostCategoryListInterface {
    postCategoriesMetadata: PostCategoryMetadata[]
    setPostCategoryMetadata: (_: PostCategoryMetadata) => any
    selectedPostCategoryMetadata?: PostCategoryMetadata
}
/**
 * (WIDE DEVICES ONLY)
 * 
 * A list of categories that we can select.
 */
export function SelectablePostCategoryList({ postCategoriesMetadata, setPostCategoryMetadata, selectedPostCategoryMetadata }: SelectablePostCategoryListInterface) {
    return (
        <div className='overflow-y-scroll' style={{ height: 320 }}>
            <ul className='flex flex-col items-start justify-start w-full'>
                <div style={{ height: 10 }} /> {/* Makes equally spaced + avoids to apply rounded border to button */}
                {postCategoriesMetadata
                    /**
                      * Sorted by most descending order
                      * See on "ProfilePage" for explanations
                    */
                    .sort(function (a, b) {
                        if (a.c_index > b.c_index) { return -1; }
                        if (a.c_index < b.c_index) { return 1; }
                        return 0;
                    }).map(e => {
                        return (
                            <SelectableCategoryInfoUi
                                postCategoryMetadata={e}
                                isSelected={(selectedPostCategoryMetadata?.category_id ?? '') === e.category_id}
                                onClick={() => { setPostCategoryMetadata(e) }}
                            />)
                    })}
                <div style={{ height: 10 }} /> {/* Makes equally spaced + avoids to apply rounded border to button */}
            </ul>
        </div>
    )
}
