//
//  HomeScreen.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SearchPage, { SearchResultUi } from './SearchPage'
import QrScannerModal from './QrScannerModal'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import CirclePhoto from '../../components/ui/CirclePhoto'
import TextStylesProvider from '../../components/styles/TextStyles'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getAccountMainData } from '../../aws/dynamodb'
import { getContent } from '../../aws/s3'
import { getFileName, getSegmentsFromUrl } from '../../components/functions'
import { LayoutAnimation, Text, View, StatusBar, Image, Linking, Alert, Pressable, Dimensions, TouchableOpacity, FlatList, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActionSheet } from './../../components/ui/ActionSheet'
import { BarCodeReadEvent } from 'react-native-camera'
import { actionSheetAnimation, layoutAnimation } from '../../components/animations'
import { CameraSymbol, SearchSymbol } from '../../components/Symbols'
import { AccountMainData, ImageDataObj, SearchResultObj } from '../../Data'


// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { openAndLoadNewProfilePage } from '../../state/slices/pagesSlice'
import { initializeHistory, removeSeenAccountMainData, selectHistory } from '../../state/slices/historySlice'


import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()
import localizedFormat from "dayjs/plugin/localizedFormat"
dayjs.extend(localizedFormat) // enables using formats like 'LT' e.g. : dayjs().format('L LT')
import utc from "dayjs/plugin/utc"
dayjs.extend(utc) // enables utc related functions



export default function HomeScreen({ navigation }) {


  // States 
  const [actionSheet, setActionSheet]: [boolean, any] = useState(false)
  const [showScanner, setShowScanner]: [boolean, any] = useState(false)
  const [searchPage, setSearchPage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // Can be used to try to avoid unwanted effects when the app is open for the first time.


  // Values 
  const WINDOW = Dimensions.get('window')
  const COLORS = getColors("detect_and_handle_scheme_changes")
  const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
  const color_scheme = useColorScheme()
  const is_in_dark_color_scheme = color_scheme === "dark"
  const insets = useSafeAreaInsets()
  // Displays the logo immediatly and without any glitch. (Not like with : const logo = require('./../../assets/images/logos/AtSight_logo.png'))
  const logoBase64 = 'data:image/png;base64,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'
  const logoWidth = WINDOW.width * 0.48



  // Global data 
  const dispatch = useDispatch()
  const uiStates = useSelector(selectUiStates)
  const userIsSignIn = (uiStates?.userAccountMainData?.username ?? "") !== ""



  function actionSheetPress(index) {
    switch (index) {
      case 0: navigation.navigate("Login"); break
      case 1: navigation.navigate("AccountTypeSelector"); break
      default: break
    }
  }


  // Initialization
  useEffect(() => {

    listenAndHandleUniversalLinks()
    refreshUserAccountMainData()

  }, [])



  // Session related___________________________________________________
  /** Session cached values : 
    * - 1 - from cache
    * - 2 - from server if possible
   */
  async function refreshUserAccountMainData() {


    setTimeout(() => {
      setIsInitialized(true)
    }, 0)


    // From cache
    let cachedAccountMainData: AccountMainData = undefined
    try {
      let encodedCachedAccountMainData = await AsyncStorage.getItem("@user_account_main_data")
      cachedAccountMainData = JSON.parse(encodedCachedAccountMainData)
      dispatch(updateUiStateValue({ attribute: "userAccountMainData", value: cachedAccountMainData }))
      dispatch(updateUiStateValue({ attribute: "account_id", value: cachedAccountMainData.account_id }))
    } catch (error) {
    }




    // From server
    if ((cachedAccountMainData?.account_id ?? "") === "") return // Avoids error (may be unnecessary)
    console.log("Refreshing")



    // Values 
    let accountMainData: AccountMainData = undefined
    try {
      accountMainData = await getAccountMainData(cachedAccountMainData?.account_id)
    } catch (error) {
      if (error.includes("Network")) return // --> Values can't be refreshed so dont't use them 
    }

    // Photo if any 
    let base64
    if (accountMainData?.has_photo ?? false) {
      let file_name = getFileName("profile_photo", accountMainData.short_id)
      base64 = await getContent("anyid-eu-west-1", file_name)
      accountMainData = Object.assign({}, accountMainData)
      accountMainData.image_data = ImageDataObj(base64, 1)

      // UI
      dispatch(updateUiStateValue({ attribute: "userAccountMainData", value: accountMainData }))
    } else {
      // UI
      dispatch(updateUiStateValue({ attribute: "userAccountMainData", value: accountMainData }))
    }




    // Cache them
    try {
      let encodedAccountMainData = JSON.stringify(accountMainData)
      await AsyncStorage.setItem("@user_account_main_data", encodedAccountMainData)
    } catch (error) { }



  }
  //___________________________________________________________________




  // Universal links related__________________________________________
  async function listenAndHandleUniversalLinks() {

    // Called oncen (app just open)
    let initialUrl = await Linking.getInitialURL()
    if ((initialUrl ?? "") !== "") handleUniversalLink(initialUrl)


    // Called during all other moments 
    Linking.addEventListener('url', event => {
      handleUniversalLink(event.url)
    })

  }

  async function handleUniversalLink(incomingUrl: string) {

    const url = new URL(incomingUrl) // https://atsight.ch/george6paris/
    const username = getSegmentsFromUrl(url)[0] ?? ""
    // s=u_l (source = universal link) --> we could track how many people use the universal link. So how much people prefer using the app.

    if (username !== "") dispatch(openAndLoadNewProfilePage("", "", navigation, username) as any)

  }
  //__________________________________________________________________




  // QR______________________________________________________________
  async function handleQrScan(e: BarCodeReadEvent) {

    // Preparation
    let url = new URL(e?.data ?? "") // https://atsight.ch/george6paris?s=qr/
    const username = getSegmentsFromUrl(url)[0] ?? ""
    setShowScanner(false)


    setTimeout(() => {
      if (
        url.href.includes("https://atsight.app/") || // Deprecated first version
        url.href.includes("https://www.atsight.app/") || // Deprecated first version
        url.href.includes("https://atsight.ch/") ||
        url.href.includes("https://www.atsight.ch/") ||
        url.href.includes("https://atsight.fr/") ||
        url.href.includes("https://www.atsight.fr/")
      ) {
        if (username !== "") {
          dispatch(openAndLoadNewProfilePage("", "", navigation, username, undefined, undefined, undefined, undefined, true) as any)
        } else Alert.alert(localization.no_match, localization.qr_code_matching_no_place)
      } else Alert.alert(localization.invalid_qr_code, localization.only_qr_code_of_places)
    }, 600)

  }
  //_________________________________________________________________




  // HISTORY _________________________________________________
  // 
  const [seenAccountsHistory, setSeenAccountsHistory] = useState<AccountMainData[]>()

  // Global data
  const history = useSelector(selectHistory) ?? []

  // Initialization
  useEffect(() => {
    getHistory()
  }, [])

  // Caches the history when it changes 
  useEffect(() => {

    if (history !== seenAccountsHistory && seenAccountsHistory !== undefined) {
      AsyncStorage.setItem("@seen_accounts", JSON.stringify(history.slice(0, 4))) // Only the first 4 
      setSeenAccountsHistory(history)
    }

  }, [history])

  async function getHistory() {

    try {

      // Values 
      let cachedHistory = await AsyncStorage.getItem('@seen_accounts')
      let seenAccounts: AccountMainData[] = JSON.parse(cachedHistory)

      // Updates
      setSeenAccountsHistory(seenAccounts)
      dispatch(initializeHistory({ seenAccounts: seenAccounts }))

    } catch (error) {
      console.log(error)
    }

  }
  //
  //
  // ____________________________________________________________




  return (
    <SafeAreaProvider>
      {!isInitialized ?
        <View style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} />
        :
        <SafeAreaView
          style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }}
          edges={['top', 'right', 'left']}
        >
          <StatusBar
            barStyle={actionSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
            backgroundColor={COLORS.clear}
            translucent
          />


          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: insets.bottom,
              backgroundColor: COLORS.lightGray
            }}>



            {/* Account photo */}
            <View style={{ width: "100%", justifyContent: "center", alignItems: "flex-end", backgroundColor: COLORS.whiteToGray2 }}>
              <TouchableOpacity onPress={async () => {

                if (userIsSignIn) {
                  navigation.push("AccountManager")
                } else {
                  LayoutAnimation.configureNext(actionSheetAnimation)
                  setActionSheet(true)
                }

              }}>

                {/* Facilitates gestures and add the space around */}
                <View style={{ width: 50 + 15, height: 50 + 15, backgroundColor: COLORS.clear, justifyContent: "center", alignItems: "center", marginRight: 8, marginTop: 8 }}>
                  <CirclePhoto
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    base64={uiStates.userAccountMainData?.image_data?.base64 ?? ""}
                    widthAndHeight={40}
                    isAccountManagerPreview
                    displayLetterIfNoPhoto={uiStates.userAccountMainData?.account_name?.slice(0, 1) ?? ""}
                  />
                </View>

              </TouchableOpacity>
            </View>


            <View
              style={{
                paddingTop: 80 - 25,
                alignItems: 'stretch', // 'center',
                justifyContent: 'center',
                width: "100%",
                backgroundColor: COLORS.whiteToGray2
              }}>

              {/* Logo and brand's message */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: 32 - 16
                }}>
                <Image
                  source={{ uri: logoBase64 }}
                  style={{
                    width: logoWidth,
                    height: logoWidth * 0.3,
                    resizeMode: 'contain'
                  }}
                />
                <Text style={[TEXT_STYLES.calloutMedium, { textAlign: "center", paddingTop: 0, color: COLORS.black }]}>{'See information from places'}</Text>

              </View>


              {/* Searchbar */}
              <Pressable
                onPress={() => { setSearchPage(true) }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  backgroundColor: COLORS.whiteToGray,
                  marginHorizontal: 20,
                  marginVertical: 16,
                  height: 44,
                  borderWidth: 1,
                  borderRadius: 26,
                  borderColor: COLORS.capsuleGray,
                }}>
                <View style={{ paddingHorizontal: 2 * 5 }}>
                  <SearchSymbol COLORS={COLORS} size={20} />
                </View>

                <Text numberOfLines={1} style={[TEXT_STYLES.calloutMedium, { paddingVertical: 2 * 5, color: COLORS.smallGrayText, fontSize: 16, flex: 1 }]}>{localization.enter_a_location_or_use_the_camera}</Text>

                <TouchableOpacity
                  onPress={() => { setShowScanner(true) }}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.darkBlue,
                    marginHorizontal: 5,
                    borderRadius: 40,
                    height: 44 - 11,
                    width: 54, // 44 - 11,
                  }}>
                  <CameraSymbol size={19} color={"white"} />
                </TouchableOpacity >

              </Pressable>

              {/*
              <ClassicButton onPress={() => { setShowScanner(true) }} text={localization.see_a_place_information} horizontalMargin={20} topMargin={16} symbol={<QRCodeSymbol size={19} color={"white"} />} textColor="white" backgroundColor={COLORS.darkBlue} />
                  */}
            </View>



            {/* History */}
            <FlatList
              data={seenAccountsHistory} // Only 4 firsts 
              style={{ backgroundColor: COLORS.whiteToGray2 }}
              contentContainerStyle={{ paddingBottom: insets.bottom + 10, paddingTop: 30, width: WINDOW.width, paddingHorizontal: 15 }}
              keyExtractor={e => e.account_id}
              keyboardDismissMode={"on-drag"}
              keyboardShouldPersistTaps={"always"}
              renderItem={({ item, index }: { item: AccountMainData, index: any }) => (
                // TODO : MAKE THE LIST BE CIRCLES ALIGNED HORIZONTALLY 4 X 2
                <SearchResultUi
                  searchResult={SearchResultObj("", "accountMainData", item)}
                  displayXMarkIcon
                  onPress={() => {

                    const isUserAccount = item.account_id === uiStates.account_id && item.account_id !== ""
                    dispatch(openAndLoadNewProfilePage(item.account_id, item.short_id, navigation, item.username, false, true, undefined, isUserAccount === false) as any)

                  }}
                  onPressDelete={() => {
                    LayoutAnimation.configureNext(layoutAnimation)

                    dispatch(removeSeenAccountMainData({ account_id: item.account_id }))

                  }}
                  COLORS={COLORS}
                  TEXT_STYLES={TEXT_STYLES}
                />
              )}
            />




            {/* Footer */}
            <Divider COLORS={COLORS} />

            <View
              style={{
                height: 44,
                width: "100%",
                // 
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text style={[TEXT_STYLES.gray13Text, { paddingHorizontal: 12, lineHeight: 28 }]}>{"© 2022 AtSight"}</Text>
              <Pressable onPress={() => {
                navigation.navigate("About")
              }}>
                <Text style={[TEXT_STYLES.gray13Text, { paddingHorizontal: 12, lineHeight: 28 }]}>{localization.about}</Text>
              </Pressable>
            </View>




          </View>
        </SafeAreaView>
      }


      {/* Modals */}
      <QrScannerModal
        show={showScanner}
        setShow={setShowScanner}
        onSuccessScan={async (e: BarCodeReadEvent) => {
          handleQrScan(e)
        }}
      />


      <SearchPage
        show={searchPage}
        setShow={setSearchPage}
        navigation={navigation}
      />


      <ActionSheet
        TEXT_STYLES={TEXT_STYLES}
        COLORS={COLORS}
        show={actionSheet}
        setShow={setActionSheet}
        options={[localization.sign_in, localization.create_new_account, localization.cancel]}
        actionSheetPress={actionSheetPress}
      />


    </SafeAreaProvider >
  )
}


