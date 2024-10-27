import React from 'react'
import '../../styles/MainStyles.css'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import { Link } from 'react-router-dom'
import { getUserPreferredLocale } from '../../assets/LanguagesList'
import { PostCategoryMetadata } from '../../Data'
import { getCategoryTypeDescription } from '../../Types'
import { isMobileHook } from '../functions'
import { ClassicButton } from '../Buttons'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


const userLocale = getUserPreferredLocale()
const isMobile = isMobileHook()



interface PostCategoryMetadataUiInterface {
    postCategoryMetadata: PostCategoryMetadata
    isUserAccount: boolean
}
/**
 * information about a post category. 
 * It's amount of posts, it's title and updated date.
 */
export default function PostCategoryMetadataUi({ postCategoryMetadata, isUserAccount }: PostCategoryMetadataUiInterface) {


    // Values 
    // const username = getSegmentsFromUrl(new URL(window.location.href))[0]
    // const navigate = useNavigate()


    if (isMobile) {
        return (
            <div id="categoryInfoDiv" className='flex justify-start items-start overflow-hidden' style={{ padding: 20, paddingBottom: 35 }}>
                <PostCountIndicator postCategoryMetadata={postCategoryMetadata} />

                {/* Main info + update date + close button */}
                <div className='flex flex-col items-start justify-between' style={{ paddingLeft: 20, height: 90 }}>
                    <p className='text-start text-ellipsis' style={Object.assign({}, TextStyles.bold15, { color: Colors.black, })}>{getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata?.custom_type ?? "")}</p>
                    <p className='text-start' style={Object.assign({}, TextStyles.gray13Text, { marginTop: 4 })}>{localization.actualized + " " + dayjs(postCategoryMetadata.update_date).locale(userLocale).fromNow()}</p>
                </div>

            </div>
        )
    } else {
        return (
            <div id={"categoryInfoDiv"} className='flex flex-col justify-start items-start'>
                <PostCountIndicator postCategoryMetadata={postCategoryMetadata} />

                {/* Main info + update date + close button */}
                <div className='flex flex-col justify-start' style={{ marginTop: 13 }}>
                    <p className='text-start' style={Object.assign({}, TextStyles.bold15, { color: Colors.black, maxWidth: 140 })}>{getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata?.custom_type ?? "")}</p>
                    <p className='text-start' style={Object.assign({}, TextStyles.gray13Text, { marginTop: 4 })}>{localization.actualized + " " + dayjs(postCategoryMetadata.update_date).locale(userLocale).fromNow()}</p>

                    {isUserAccount &&
                        <Link to={`${window.location.pathname}#edit_category/${window.location.search}`} className="flex" style={{ marginTop: 30 }}>
                            <ClassicButton
                                onClick={() => { }}
                                text={localization.edit}
                                backgroundColor={Colors.white}
                                smallAppearance
                                displayABorder
                            />
                        </Link>
                    }

                </div>
            </div>
        )
    }
}



interface PostCountIndicatorInterface {
    postCategoryMetadata: PostCategoryMetadata
}
function PostCountIndicator({ postCategoryMetadata }: PostCountIndicatorInterface) {

    const widthAndHeight = isMobile ? 90 : 140

    return (
        <div className={`flex flex-col justify-center items-center ${isMobile ? "" : "rounded-lg"}`} style={{ width: widthAndHeight, height: widthAndHeight, backgroundColor: Colors.softGray }}>
            <p className='line-clamp-1' style={{ fontSize: 20, fontWeight: '800', color: Colors.black }}>{postCategoryMetadata?.post_count ?? 0}</p>
            <p className='text-center' style={{ fontSize: isMobile ? "1.5vmax" : "1.1vmax", paddingLeft: 15, paddingRight: 15, color: Colors.black }}>{localization.posts}</p>
        </div>
    )
}


