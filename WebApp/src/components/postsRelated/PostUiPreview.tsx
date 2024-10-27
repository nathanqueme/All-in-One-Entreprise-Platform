import React from 'react'
import '../../styles/MainStyles.css'
import Colors from '../../assets/Colors'
import { Link } from 'react-router-dom'
import { Post } from '../../Data'
import { getFileName, getPostPhotoAlt } from '../functions'
import { useEffect } from 'react'
import { useState } from 'react'






interface PostUiPreviewInterface {
    post: Post
    widthAndHeight: number
    loadingAppearance: boolean
    username: string
    account_name: string
    short_id: string
}
/**
 * The post's image and it's name in small (voluntarily).
*/
export default function PostUiPreview({ post, widthAndHeight, loadingAppearance = false, username, account_name, short_id }: PostUiPreviewInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values 
    let imgDivStyling = {
        width: widthAndHeight,
        height: widthAndHeight,
        maxWidth: 215, // 290 makes about 3 posts visible but 215 4-5 posts
        maxHeight: 215,
        backgroundColor: Colors.softGray,
    }



    // Ui
    let ui =
        <>
            <div unselectable='on' className='unselectable' style={imgDivStyling} >
                {(!loadingAppearance) &&
                    <img
                        src={`https://www.atsightcdn.com/${getFileName("post", short_id, post.post_id)}`}
                        alt={getPostPhotoAlt(post.created_date, post.name, account_name)}
                        className={`align-middle object-cover`}
                        style={{
                            width: widthAndHeight,
                            height: widthAndHeight,
                            maxWidth: 215, // 290 makes about 3 posts visible but 215 4-5 posts
                            maxHeight: 215,
                            backgroundColor: Colors.softGray,
                            pointerEvents: "none",
                            color: false ? Colors.smallGrayText : "transparent"
                        }}
                        onLoad={() => { setShowAlt(true) }}
                        onError={() => { setShowAlt(true) }}
                        loading="lazy"
                    />
                }
            </div>

            <p className='line-clamp-1 text-start' style={{
                fontSize: 13,
                marginTop: 4,
                color: Colors.black,
                opacity: loadingAppearance ? 0 : 1
            }}>{post.name}</p>
        </>


    if (loadingAppearance) {
        return (
            <div className='flex flex-col justify-start items-start' style={{ marginRight: 7 }}>
                {ui}
            </div>
        )
    } else {
        return (
            <Link to={`/p/${post.post_id}/`} className='flex flex-col justify-start items-start' style={{ marginRight: 7 }}>
                {ui}
            </Link>
        )
    }
}

