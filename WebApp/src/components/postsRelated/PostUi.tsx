import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import TextStyles from '../../styles/TextStyles'
import Colors from '../../assets/Colors'
import ActionButton from './ActionButton'
import { getUserPreferredLocale } from '../../assets/LanguagesList'
import { Geolocation, Post } from '../../Data'
import { getFileName, getPostPhotoAlt, isMobileHook } from '../functions'
import { TranslatableExpandableText } from '../ExpandableText'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()



const isMobile = isMobileHook()
const userLocale = getUserPreferredLocale()




interface PostUiInterface {
    post: Post
    short_id: string
    account_name: string
    isUserAccount: boolean
    onClickEdit: (post: Post) => any
    onClickAddress: (address: Geolocation) => any
}
/**
 * Displays the photo and the information of a post.
*/
export default function PostUi({ post, short_id, account_name, isUserAccount, onClickEdit, onClickAddress }: PostUiInterface) {


    // States 
    const [showAlt, setShowAlt] = useState(false)


    // Values 
    const width = isMobile ? window.screen.width : 472
    //
    let displayLinkButton = (post?.link_url ?? '') !== ''
    let displayAddressButton = (post.geolocation?.country ?? '') !== '' && (post.geolocation?.auto_generated ?? false) === false


    return (
        <li id={`${post.post_id}_div`} className={`flex flex-col justify-start items-start overflow-hidden bg-white ${!isMobile ? "gapBetweenPosts" : ""} ${isMobile ? "" : "border-2 rounded-lg"}`} style={{ width: width }}>
            <div className='unselectable' unselectable={"on"} style={{ width: width }}>
                <img src={`https://www.atsightcdn.com/${getFileName("post", short_id, post.post_id)}`} alt={getPostPhotoAlt(post.created_date, post.name, account_name)} className={`align-middle object-cover`} width={width} style={{ pointerEvents: "none", color: showAlt ? Colors.smallGrayText : "transparent" }} loading="lazy" onLoad={() => { setShowAlt(true) }} onError={() => { setShowAlt(true) }} />
            </div>

            <div className='flex flex-col justify-start items-start' style={{ paddingTop: 20, paddingBottom: 20 }}>
                {/* Name */}
                <p style={Object.assign({}, TextStyles.bold15, { paddingLeft: 20, paddingRight: 20 })}>{post.name}<span style={Object.assign({}, TextStyles.gray13Text, { fontWeight: '400' })}>{" • " + dayjs(post.created_date).locale(userLocale).fromNow()}</span></p>

                {/* Description + Translate button */}
                <TranslatableExpandableText
                    description={post?.description ?? {}}
                    description_localization={post?.description_localization}
                    textType={'post_description'}
                    uniqueId={post.post_id}
                    marginTop={11}
                    marginHorizontal={20}
                />

                {/* Action buttons */}
                <div className='flex items-center justify-start overflow-x-scroll scrollbar-hide' style={{ width: width, marginTop: (displayLinkButton || displayAddressButton || isUserAccount) || isMobile ? 18 : 0, paddingLeft: 18, paddingRight: 18 }}>

                    {displayLinkButton &&
                        <ActionButton type={"link"} marginRight onClick={() => { }} link={post.link_url}/>
                    }

                    {displayAddressButton &&
                        <ActionButton type={"address"} marginRight onClick={() => { onClickAddress(post.geolocation) }} />
                    }

                    {isUserAccount &&
                        <ActionButton type={"options"} marginRight onClick={() => { onClickEdit(post) }} />
                    }

                </div>
            </div>
        </li>
    )
}