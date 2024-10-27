import React, { useState, useEffect } from 'react'
import CirclePhoto from '../../../components/CirclePhoto'
import TextStyles from '../../../styles/TextStyles'
import Colors from '../../../assets/Colors'
import localization from '../../../utils/localizations'
import { WindowWidth } from '../../../components/WindowWidth'
import { PostCategoryUi } from '../../../components/postsRelated'
import { CertificationBadgeIcon, ChevronRight } from '../../../components/Icons'
import { ProfileButtonsCapsule, SquareProfileButton } from '../../../components/Buttons'
import { AccountMainDataObj, GeolocationObj, ImageDataObj } from '../../../Data'
import { getDummyPostCategories, getFileName, getLocalizedTextText, getProfilePhotoAlt, getSegmentsFromUrl, isMobileHook } from '../../../components/functions'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectPagesAccountsMainData } from '../../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles } from '../../../state/slices/profilesSlice'
import { selectPagesPostCategories } from '../../../state/slices/postsSlice'


const isMobile = isMobileHook()


interface HomeTabInterface {
  isUserAccount: boolean
  pageFailedLoading: boolean
  setPageFailedLoading: (_: boolean) => any
  profileNotFound: boolean
  setProfileNotFound: (_: boolean) => any
  accountMainDataLoaded: boolean
  profileLoaded: boolean
  categoriesLoaded: boolean
}
/**
 * On desktops : Categories + buttons to edit them (if is user account) + Errors messages 
 * On devices : Info about the account (Account main photo + account name + description) + Profile buttons (Map + Menu) + Categories + uttons to edit them (if is user account) + Error messages 
*/
export default function HomeTab({ isUserAccount, pageFailedLoading, setPageFailedLoading, profileNotFound, setProfileNotFound, accountMainDataLoaded, profileLoaded, categoriesLoaded }: HomeTabInterface) {


  // Values 
  const windowWidth = WindowWidth()
  let scalingRatio = windowWidth / 375 /// 375 : iPhone 8 screen width
  /** Dimensions guidelines : 
   * Originally the width and height were of 100 * scalingRatio
   * Dimensions have been scaled down so that it looks more like a 4 * 4 grid rather than a 3 * 3 grid. Especially when there is only 3 posts in a 'PostCategoryUi' so that we can really see that a fourth post is missing as there is a good amount of blank space.
   * N.B. : Like the ProfileButtonsCapsule this is done to avoid looking like a 3 * 3 grid so that the 'ProfilePage' does not looks like other applications.
  */
  let dynamicPostPreviewWidth = 96 * scalingRatio


  // Navigation 
  // Url is like https://www.atsight.ch/george6paris/ ( + about/ or in_the_place/ ) 
  let username = getSegmentsFromUrl(new URL(window.location.href))[0]


  // Global data 
  const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
  const profile = useSelector(selectPagesProfiles).find(e => { return e.page.username === username })?.profile
  const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.username === username })
  //
  //
  const account_main_data = pageAccountMainData?.account_main_data ?? AccountMainDataObj('', '', '', '', '', 'hotel', false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
  const { account_id, account_name, account_type, certified, image_data, geolocation, has_photo, short_id } = account_main_data
  let description = getLocalizedTextText(profile?.description ?? {})
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




  // For loading 
  let dummyPostCategories = getDummyPostCategories()



  return (
    <div>
      {/* Top */}
      {isMobile &&
        <div className='flex flex-col items-center justify-center' style={{ paddingTop: 25 }}>

          {/* Account photo */}
          <button className='ml-8 mr-8' disabled={!isUserAccount} onClick={() => { }}>
            <CirclePhoto
              src={accountMainDataLoaded && has_photo ? `https://www.atsightcdn.com/${getFileName("profile_photo", short_id)}` : ""}
              alt={getProfilePhotoAlt(username)}
              widthAndHeight={scalingRatio * 66} // Keep it small so it does not looks like another app
              displayLetterIfNoPhoto={account_name?.slice(0, 1) ?? ""}
            />
          </button>

          {/* Name + Certification */}
          <div className='flex items-center justify-center' style={{ paddingLeft: 65, paddingRight: 65, paddingTop: 12 }}>
            <p style={Object.assign({}, TextStyles.headline, { color: Colors.black })}>{account_name ?? ""}</p>
            {(certified ?? false) &&
              <div style={{ paddingLeft: 4, paddingRight: 4 }}>
                <CertificationBadgeIcon size='1.2em' />
              </div>
            }
          </div>

          {/* Description */}
          {profileLoaded &&
            <div className='w-full items-center justify-center' style={{ paddingTop: 10, paddingBottom: 10 }}>
              <Link to={`/${username}/about/`} className='flex items-center justify-center active:opacity-70' style={{ paddingLeft: 8, paddingRight: 8 }}>
                <div style={{ opacity: 0 }}>
                  <ChevronRight />
                </div>
                <p className='line-clamp-2' style={Object.assign({}, TextStyles.gray13Text, { paddingLeft: 8, paddingRight: 8 })}>{description !== "" ? description : isUserAccount ? localization.enter_description : localization.see_information}</p>
                <ChevronRight />
              </Link>
            </div>
          }

          {/* 
           Profile buttons 
           N.B.: The 'ProfileButtonsCapsule' is designed to look like a 'BLOCK' rather than seperated single items. This is important as it highly helps to avoid looking like the other main applications with a 3 * 3 grid design.
          */}
          <div className='w-full flex items-center justify-center' style={{ paddingTop: 7, paddingLeft: 20, paddingRight: 20 }}>

            {((isUserAccount && profileLoaded) || (((profile?.buttons ?? []).length > 0) && profileLoaded)) &&
              <ProfileButtonsCapsule
                buttons={profile?.buttons ?? []}
                username={username}
              />
            }

            {(isUserAccount && (profile?.buttons.length ?? 0) > 0) &&
              <SquareProfileButton
                onClick={() => { }}
                loadingAppearance={(!profileLoaded || pageFailedLoading)}
              />
            }

          </div>

        </div>
      }

      {/* Categories */}
      <div style={{ marginTop: 30, marginBottom: 30 }}>
        {
          categoriesLoaded ?
            ((postCategories?.length ?? 0) === 0 ?
              <div style={{ paddingTop: 90, width: "100%" }}>
                <p style={TextStyles.noContentFont}>{localization.nothing_to_display}</p>
              </div>
              :
              postCategories?.map((e) => {
                return (
                  <PostCategoryUi
                    key={e.metadata.category_id}
                    postCategory={e}
                    widthAndHeight={dynamicPostPreviewWidth}
                    isUserAccount={isUserAccount}
                    onAddPostPress={() => {
                      // navigation.navigate('PostEditor', { page: page, category_id: e.metadata.category_id })
                    }}
                    wasCreated={false}
                    username={username}
                    account_name={account_name}
                    short_id={short_id}
                  />
                )
              })

            )
            :

            dummyPostCategories
              .map((postCategory) => {
                return (
                  <PostCategoryUi
                    key={postCategory.metadata.category_id}
                    postCategory={postCategory}
                    widthAndHeight={dynamicPostPreviewWidth}
                    isUserAccount={isUserAccount}
                    onAddPostPress={() => { }}
                    loadingAppearance
                    username={username}
                    account_name={account_id}
                    short_id={short_id}
                  />
                )
              })
        }
      </div>

    </div>
  )
}






