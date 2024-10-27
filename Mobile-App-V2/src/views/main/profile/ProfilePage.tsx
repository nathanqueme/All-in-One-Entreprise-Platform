//
//  ProfilePage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useRef, createRef } from 'react'
import HomeTab from './tabs/HomeTab'
import getColors from '../../../assets/Colors'
import RelatedItemsTab from './tabs/RelatedItemsTab'
import localization from '../../../utils/localizations'
import { AccountInfoUi } from './tabs/AccountInfoTab'
import { ProfilePageHeader } from '../../../components/Headers'
import { SlidingAlert } from '../../../components/SlidingAlert'
import { ActionSheet } from '../../../components/ui/ActionSheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomSheet } from '../../../components/BottomSheetRelated'
import { actionSheetAnimation } from '../../../components/animations'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { TabData, TabsButtons, TabType } from '../../../components/ui/TabsRelated'
import { ImageDataObj, Page, AccountMainDataObj, GeolocationObj } from '../../../Data'
import { View, Dimensions, Animated, StatusBar, Platform, LayoutAnimation, ActionSheetIOS, useColorScheme, Text, ScrollView } from 'react-native'
import { copyString, getAddressDescription, getAppleMapsAddressUrl, getGoogleMapsAddressUrl, openAddressInMaps, shareAddress } from '../../../components/functions'

// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue } from '../../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../../state/slices/accountsMainDataSlice'
import { DailyTimetablesList, getTimetablesTypeDescriptiveText } from '../../../components/ui/TimetablesRelated'
import { selectPagesProfiles } from '../../../state/slices/profilesSlice'
import { ScreenViewTracker } from '../../../analytics'
import TextSytlesProvider from '../../../components/styles/TextStyles'



const screenWidth = Dimensions.get("screen").width



const tabs: TabType[] = ['home', 'related_items', 'about']
const data: TabData[] = tabs.map((e) => ({
  type: e,
  ref: createRef()
}))




/** Way content gets (re)loaded
   - Profile photo : when page appears 
   - Profile : when page appears 
   - relatedItems : when the page appears 
   - categories : Only 4 categories * (their 8 first posts) when the page appears -> The other ones are loaded as the user scrolls down.
 */
export default function ProfilePage({ navigation, route }) {

  // States
  // Tabview
  const scrollX = useRef(new Animated.Value(0)).current
  const [currentTab, setCurrentTab] = useState(data[0].type)


  // Navigation values 
  let page: Page = route.params.page
  const navigationUsername = route.params.username
  let open_from_qr_code = route.params?.open_from_qr_code ?? false
  /**
   * This is for that the page looks like user's account even if it has not been loaded yet.
   * This is particularly usefull when the profile page can not be opened
   * To see this : --> Open the app sign in to a dummy place then close the app --> remove your internet connecion and open it back --> the application will try to load your "ProfilePage" and will have the proper isUserAccount === true appearance.
  */
  const overWriteIsUserAccount = route.params.overWriteIsUserAccount ?? false



  // Global data
  // const globalValues = useSelector(state => state)
  const dispatch = useDispatch()
  const uiStates = useSelector(selectUiStates)
  const accountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? "" })?.account_main_data
  let profile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page?.page_number ?? "" })?.profile




  // Values 
  const color_scheme = useColorScheme()
  const is_in_dark_color_scheme = color_scheme === "dark"
  const COLORS = getColors("detect_and_handle_scheme_changes")
  const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
  const insets = useSafeAreaInsets()
  const tabsListRef = useRef(null)
  // 
  // Account values  
  // N.B. : don't use the username from the accountMainData has the default one has it may not be loaded --> use the one provided by the navigation
  const { account_id, account_name, username, account_type, certified, image_data, geolocation } = accountMainData ?? AccountMainDataObj('', '', '', '', '', 'hotel', false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
  let isUserAccount = (account_id === uiStates.account_id && account_id !== "") || overWriteIsUserAccount




  // All tabs ____________________________________________
  const [pageFailedLoading, setPageFailedLoading] = useState(false)
  const [profileNotFound, setprofileNotFound] = useState(false)





  // Account info tab _____________________________________________________ 
  const [timetablesBottomSheet, setTimetablesBottomSheet] = useState(false)
  const [addressActionSheet, setAddressActionSheet] = useState(false) // Android
  const addressActionSheetOptions = [localization.open_in_maps, localization.copy, localization.share, localization.cancel]
  function openAddressActionSheet() {

    // if (Platform.OS !== 'ios') {
      LayoutAnimation.configureNext(actionSheetAnimation)
      setAddressActionSheet(true)
    // } else {
      /* ActionSheetIOS.showActionSheetWithOptions({
        options: addressActionSheetOptions,
        cancelButtonIndex: 3,
        title: getAddressDescription(geolocation)
        // destructiveButtonIndex: 0,
      }, buttonIndex => { addressActionSheetPress(buttonIndex) })
      */
    // }

  }
  function addressActionSheetPress(index) {
    switch (index) {
      case 0: openAddressInMaps(geolocation); break
      case 1:
        // Values 
        let addressUrl = Platform.OS === "ios" ? getAppleMapsAddressUrl(geolocation) : getGoogleMapsAddressUrl(geolocation)
        copyString(addressUrl, dispatch)
        break
      case 2: shareAddress(geolocation); break
      default: console.log("Out of range")
    }
  }

  let timetables = profile?.timetables ?? undefined
  let hasTimetables = (timetables?.daily_timetables?.length ?? 0) > 0
  let addressDescription = getAddressDescription(geolocation)


  return (
    <SafeAreaProvider >
      <ScreenViewTracker screen_name={"profile"} is_user_one={isUserAccount} />
      <SafeAreaView style={{ backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
        <StatusBar
          barStyle={timetablesBottomSheet || addressActionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
          backgroundColor={COLORS.clear}
          translucent
        />




        <View style={{
          position: "absolute",
          zIndex: 2
        }}>
          <SafeAreaView edges={['top', 'right', 'left']}>
            {/* Header height : 39 */}
            <ProfilePageHeader
              COLORS={COLORS}
              TEXT_STYLES={TEXT_STYLES}
              username={username ?? ""}
              navigationUsername={navigationUsername ?? ""}
              onClosePress={() => { navigation.goBack() }}
            />
            {/* Tabs buttons height : 48 */}
            <TabsButtons
              COLORS={COLORS}
              TEXT_STYLES={TEXT_STYLES}
              tabs={tabs}
              data={data}
              tabsListRef={tabsListRef}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              scrollX={scrollX}
            />
          </SafeAreaView>
        </View>





        {/* TabView Tabs */}
        <View style={{
          width: screenWidth,
          height: "100%",
          paddingTop: 39 + 48 // Header's height
        }}>
          <Animated.FlatList
            ref={tabsListRef}
            data={tabs}
            horizontal
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            snapToAlignment="center"
            showsHorizontalScrollIndicator={false}
            scrollEnabled={Platform.OS === "ios"}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => {
              switch (item) {
                case 'home': return (
                  <HomeTab
                    navigation={navigation}
                    route={route}
                    pageFailedLoading={pageFailedLoading}
                    setPageFailedLoading={setPageFailedLoading}
                    profileNotFound={profileNotFound}
                    setprofileNotFound={setprofileNotFound}
                    open_from_qr_code={open_from_qr_code}
                  />
                )


                case 'related_items': return (
                  <RelatedItemsTab
                    navigation={navigation}
                    route={route}
                    currentTab={currentTab}
                    profileNotFound={profileNotFound}
                  />
                )

                case 'about': return (
                  <AccountInfoUi
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    route={route}
                    openAddressActionSheet={openAddressActionSheet}
                    setTimetablesBottomSheet={setTimetablesBottomSheet}
                    //
                    editingMode={false}
                    setMultiLanguageTexEditor={() => { }}
                    pageFailedLoading={pageFailedLoading}
                    setPageFailedLoading={setPageFailedLoading}
                    profileNotFound={profileNotFound}
                    isTab
                  />
                )
              }
            }}
          />
        </View>
      </SafeAreaView >










      {/* Modals */}
      <SlidingAlert
        COLORS={COLORS}
        TEXT_STYLES={TEXT_STYLES}
        topInset={insets.top}
        bottomInset={insets.bottom}
        slidingAlertType={(uiStates.slidingAlertType === "no_connection") || uiStates.slidingAlertType === "profile_not_found" || uiStates.slidingAlertType === "copied_alert" ? uiStates.slidingAlertType : "" as any}
        resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
        slideFromBottom={true}
      />




      <BottomSheet
        COLORS={COLORS}
        TEXT_STYLES={TEXT_STYLES}
        headerText={getTimetablesTypeDescriptiveText(timetables?.type ?? 'opening_hours')}
        show={timetablesBottomSheet}
        setShow={setTimetablesBottomSheet}
        bottom_inset={insets.bottom}
        content_height={60 * 7 + ((timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
        content={
          (hasTimetables) &&
          <DailyTimetablesList
            COLORS={COLORS}
            TEXT_STYLES={TEXT_STYLES}
            timetables={timetables}
            editable={false}
            setDailyTimetablesOfThatDay={() => { }}
            backgroundColor={COLORS.whiteToGray}
          />
        } />



      {/* Android */}
      <ActionSheet
        COLORS={COLORS}
        TEXT_STYLES={TEXT_STYLES}
        description={addressDescription}
        show={addressActionSheet}
        setShow={setAddressActionSheet}
        options={addressActionSheetOptions}
        actionSheetPress={addressActionSheetPress}
      />



    </SafeAreaProvider>
  )
}



