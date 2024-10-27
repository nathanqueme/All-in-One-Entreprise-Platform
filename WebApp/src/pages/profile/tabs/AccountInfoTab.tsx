import React from 'react'
import localization from '../../../utils/localizations'
import SectionAppearance from '../../../components/SectionAppearance'
import { InformationType } from '../../../Types'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from '../../../components/Icons'
import { EmptyInfoUi, InfoWithSymbolUI } from '../../../components/InfoDisplay'
import { TranslatableExpandableText } from '../../../components/ExpandableText'
import { AccountMainDataObj, GeolocationObj, ImageDataObj, LinkObj, PhoneNumber } from '../../../Data'
import { getAddressDescription, getLocalizedTextText, getPhoneNumberDescription, getSegmentsFromUrl, isMobileHook } from '../../../components/functions'


// Global data
import Colors from '../../../assets/Colors'
import { useSelector } from 'react-redux'
import { selectPagesProfiles } from '../../../state/slices/profilesSlice'
import { selectPagesAccountsMainData } from '../../../state/slices/accountsMainDataSlice'
import { ScreenViewTracker } from '../../../analytics'



const isMobile = isMobileHook()



interface AccountInfoTabInterface {
  accountMainDataLoaded: boolean
  profileLoaded: boolean
}
/**
 * 
*/
export default function AccountInfoTab({ accountMainDataLoaded, profileLoaded }: AccountInfoTabInterface) {


  // States 



  // Navigation 
  // Url is like https://www.atsight.ch/george6paris/ ( + about/ or in_the_place/ ) 
  const navigate = useNavigate()
  let urlSegments = getSegmentsFromUrl(new URL(window.location.href))
  let username = urlSegments[0]
  //
  let isTab = false
  let editingMode = false
  let isUserAccount = false


  // Global data 
  const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
  const profile = useSelector(selectPagesProfiles).find(e => { return e.page.username === username })?.profile
  const account_main_data = pageAccountMainData?.account_main_data ?? AccountMainDataObj('', '', '', '', '', 'hotel', false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))

  // 
  let websiteLink = profile?.links?.find((link) => { return link.name === "Website" }) ?? LinkObj('', '')
  let description = getLocalizedTextText(profile?.description ?? {})
  let addressDescription = getAddressDescription(account_main_data.geolocation)

  // 
  let hasDescription = description !== ""
  let hasAWebsite = (websiteLink?.url ?? "") !== ""
  let hasTimetables = (profile?.timetables?.daily_timetables?.length ?? 0) > 0
  let hasAnAddress = addressDescription !== ""
  let hasAnEmail = (profile?.email ?? "") !== ""
  let hasAPhoneNumber = (profile?.phone_number?.number ?? "") !== ""




  // UI
  const INFO_UI_BG_COLOR = isMobile ? Colors.white : Colors.whiteGray
  const INFO_UI_PADDING = isMobile ? 20 : 12
  const DESCRIPTION_SECTION_UI =
    <SectionAppearance
      text={"Description"}
      width={"100%"}
      marginTop={10}
      marginBottom={30}
      loadingAppearance={!(accountMainDataLoaded && profileLoaded)}
      loadingUiHeight={120}
      backgroundColor={INFO_UI_BG_COLOR}
      border={false}
      children={
        <div
          className='flex flex-row justify-between items-start '
          style={{
            paddingLeft: INFO_UI_PADDING,
            paddingRight: INFO_UI_PADDING,
            paddingBottom: 12,
            paddingTop: 12,
          }}
        >

          {hasDescription ?
            <TranslatableExpandableText
              description={profile?.description ?? {}}
              description_localization={profile?.description_localization}
              textType={'profile_description'}
              uniqueId={account_main_data.account_id}
              maximumLines={isMobile ? 6 : 6}
              fontSize={16}
              fontWeight={"500"}
            />
            :
            <EmptyInfoUi placeholder={localization.description}
            />
          }

          {editingMode &&
            <ChevronRight />
          }

        </div>
      } />





  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`} style={isMobile ? { paddingTop: 20, minHeight: "calc(100vh - 44.5px - 60px)" } : { marginTop: 30, marginBottom: 30 }}>

      <ScreenViewTracker screen_name={"account_info"} />

      {/* 
        - On thin devices (all info)
        - On wide devices (all info except the description)
       */}
      <div className='flex-col items-start justify-start' style={isMobile ? {} : { width: "60%", paddingRight: 80 }}>

        {isMobile &&
          DESCRIPTION_SECTION_UI
        }


        {/* Website + Opening hours + Address */}
        <SectionAppearance
          text={localization.essential_info}
          width={"100%"}
          marginTop={10}
          marginBottom={30}
          loadingAppearance={!(accountMainDataLoaded && profileLoaded)}
          border={false}
          children={
            <div className='flex flex-col items-start justify-start w-full'>

              {((isUserAccount && !isTab) || (hasAWebsite)) &&
                <InfoWithSymbolUI
                  infoType={'website_link'}
                  paddingLeft={INFO_UI_PADDING}
                  infoValue={websiteLink.url}
                  displayInBlue={true}
                  displayNameInstead={true}
                  pressable={editingMode || (hasAWebsite)}
                  setSelectedInfoType={(infoType: any) => {

                  }}
                  setSelectedInfoValue={(infoValue: any) => {

                  }}
                  backgroundColor={INFO_UI_BG_COLOR}
                />
              }


              {((isUserAccount && !isTab) || (hasTimetables)) &&
                <InfoWithSymbolUI
                  infoType={'timetables' as InformationType}
                  paddingLeft={INFO_UI_PADDING}
                  infoValue={profile?.timetables ?? {}}
                  displayInBlue={false}
                  displayChevron={true}
                  pressable={editingMode || hasTimetables}
                  setSelectedInfoType={(infoType: any) => {

                  }}
                  setSelectedInfoValue={(infoValue: any) => {
                    navigate(`${window.location.pathname.slice(0, -1)}#timetables/`)
                  }}
                  backgroundColor={INFO_UI_BG_COLOR}
                />
              }


              {((isUserAccount && !isTab) || (hasAnAddress)) &&
                <InfoWithSymbolUI
                  infoType={'geolocation'}
                  paddingLeft={INFO_UI_PADDING}
                  infoValue={addressDescription}
                  displayInBlue={false}
                  displayChevron={true}
                  pressable={editingMode || hasAnAddress}
                  setSelectedInfoType={(infoType: any) => {

                  }}
                  setSelectedInfoValue={(infoValue: any) => {
                    navigate(`${window.location.pathname.slice(0, -1)}#address/`)
                  }}
                  backgroundColor={INFO_UI_BG_COLOR}
                />
              }

            </div>
          } />

        {/* Email + Phone number */}
        <SectionAppearance
          text={localization.contact_info}
          width={"100%"}
          marginTop={10}
          marginBottom={30}
          loadingAppearance={!(accountMainDataLoaded && profileLoaded)}
          border={false}
          children={
            <div className='flex flex-col items-start justify-start w-full'>


              {(hasAnEmail) &&
                <InfoWithSymbolUI
                  infoType={'email'}
                  paddingLeft={INFO_UI_PADDING}
                  infoValue={profile?.email ?? ""}
                  displayInBlue={false}
                  displayChevron={true}
                  pressable={true}
                  setSelectedInfoType={(infoType: any) => {

                  }}
                  setSelectedInfoValue={(infoValue: any) => {

                  }}
                  backgroundColor={INFO_UI_BG_COLOR}
                />
              }


              {((isUserAccount && !isTab) || (hasAPhoneNumber)) &&
                <InfoWithSymbolUI
                  infoType={'phoneNumber'}
                  paddingLeft={INFO_UI_PADDING}
                  infoValue={profile?.phone_number !== undefined ? getPhoneNumberDescription(profile?.phone_number ?? {} as PhoneNumber) : ""}
                  displayInBlue={false}
                  displayChevron={true}
                  pressable={true}
                  setSelectedInfoType={(infoType: any) => {
                  }}
                  setSelectedInfoValue={(infoValue: any) => {
                  }}
                  phoneNumber={profile?.phone_number ?? {} as any}
                  backgroundColor={INFO_UI_BG_COLOR}
                />
              }
            </div>

          } />
      </div>

      {/* Description (wide devices) */}
      {!isMobile &&
        <div className='w-2/5 items-start' style={{ marginLeft: 0 }}>
          {DESCRIPTION_SECTION_UI}
        </div>
      }


    </div>
  )
}



