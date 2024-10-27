//
//  AnalyticsPage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême the 10/19/22
//

import React, { useState } from 'react'
import getColors, { ColorsInterface } from './../../../assets/Colors'
import localization from '../../../utils/localizations'
import TextSytlesProvider, { TextStylesInterface } from '../../../components/styles/TextStyles'
import NoConnectionUi from '../../../components/ui/NoConnectionUi'
import { ClassicHeader } from '../../../components/Headers'
import { StatusBar, ScrollView, Text, useColorScheme, View, Dimensions, TouchableHighlight, RefreshControl } from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { getUserSpokenLanguage, languagesInUserLocale } from '../../../assets/LanguagesList'
import { AccountActivity, AccountActivityObj, AccountView, ScreenViewTracker } from '../../../analytics'
import { useEffect } from 'react'
import { getHourSlice, getHourSliceDescription, getNextMonthDate, getPreviousMonthDate, getYearMonthDate } from '../../../components/functions'
import { useSelector } from 'react-redux'
import { selectUiStates } from '../../../state/slices/uiStatesSlice'
import { ChevronSymbol } from '../../../components/Symbols'
import { HourSlice } from '../../../Types'

// Dates 
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
dayjs.extend(localizedFormat) // enables using formats like 'LT' e.g. : dayjs().format('L LT')


const WINDOW_WIDTH = Dimensions.get("window").width


interface MonthlyActivityData {
  activity?: AccountActivity
  is_loaded: boolean
  year_month: string
}
interface MonthlyViewsData {
  views?: AccountView[]
  is_loaded: boolean
  year_month: string
}



// N.B. : DST (Daylight Saving Time) is applyed by javascript natively and modifies the graphics with hours but it is something we may not want to remove as it is accurate to keep it here.
export default function AnalyticsPage({ navigation }) {


  // States 
  const [month, setMonth] = useState<Date>(new Date())
  const [monthly_activity, setMonthlyActivity] = useState<MonthlyActivityData[]>([])
  const [monthly_views, setMonthlyViews] = useState<MonthlyViewsData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [no_connection, setNoConnection] = useState<boolean>(false)


  // Global 
  const uiStates = useSelector(selectUiStates)
  const account_id = uiStates.userAccountMainData?.account_id ?? ""
  const year_month = getYearMonthDate(month)


  // Values 
  const color_scheme = useColorScheme()
  const is_in_dark_color_scheme = color_scheme === "dark"
  const COLORS = getColors("detect_and_handle_scheme_changes")
  const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS) 
  const insets = useSafeAreaInsets()
  const userLocale = getUserSpokenLanguage().locale
  const data_has_already_been_loaded = monthly_activity.length > 0
  const month_activity = monthly_activity.find(e => { return e.year_month === year_month })
  const month_views = monthly_views.find(e => { return e.year_month === year_month })?.views
  // LOADING
  const views_loaded = month_views !== undefined
  const activity_is_loaded = month_activity !== undefined
  const text_color = activity_is_loaded ? COLORS.black : COLORS.clear
  const box_color = activity_is_loaded ? COLORS.clear : COLORS.lightGray
  // ACTIVITY
  const { view_count } = month_activity?.activity ?? AccountActivityObj(account_id, year_month, 253)
  function getYearMonthString(short: boolean) {
    return dayjs(month).locale(userLocale.split("-")[0]).format(short ? 'MMM YYYY' : 'MMMM YYYY')
  }
  const month_selector_limit = getYearMonthDate(month) === getYearMonthDate(new Date())
  // VIEWS
  const devices_id = month_views?.flatMap(e => e.device_id)
  const unique_devices_id = [...new Set(devices_id)]
  const hls = month_views?.flatMap(e => e.hl)
  const unique_hls = [...new Set(hls)]
  //
  const spoken_languages = unique_hls.map((hl) => {
    const devices_talking_hl = month_views?.filter(e => { return e.hl === hl }).flatMap(e => { return e.device_id })
    const unique_devices_talking_hl = [... new Set(devices_talking_hl)]
    return { "hl": hl, "count": unique_devices_talking_hl.length }
  }).sort(function (a, b) { // sorted by ascending quantity
    if (a.count > b.count) { return -1 }
    if (a.count < b.count) { return 1 }
    return 0
  })
  const hours_of_activity = month_views?.flatMap(e => {
    // viewing_date : UTC date (UTC hour)
    // hour : hour in local time 
    const date = new Date(e.viewing_date)
    const hour = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    return getHourSlice(hour, minutes, seconds)
  })
  let activityTime = (['0-3', '3-6', '6-9', '9-12', '12-15', '15-18', '18-21', '21-0'] as HourSlice[]).flatMap((hour_slice) => {
    const count = hours_of_activity?.filter(e => { return e === hour_slice }).length
    return { "hour_slice": hour_slice, "count": count }
  })
  let max_views = Math.max(...activityTime?.flatMap(e => e.count))





  function handleLoadingActivity(year_month_data: string) {

    fetch(`https://apis.atsight.ch/analytics/accountsActivity?account_id=${account_id}&year_month=${year_month_data}&part=account_id,year_month,view_count`)
      .then(async (response) => {

        let data = await response.json()
        setIsLoading(false)
        setRefreshing(false)

        let item: MonthlyActivityData = {
          "is_loaded": true,
          "year_month": year_month_data
        }
        if (response.ok) {
          item["activity"] = data
        }

        setMonthlyActivity(prevV => {
          return [...prevV, item]
        })

      })
      .catch(error => {
        setIsLoading(false)
        setRefreshing(false)
        setNoConnection(true)
      })

  }
  function handleLoadingViews(year_month_data: string) {
    fetch(`https://apis.atsight.ch/analytics/accountsViews?account_id=${account_id}&year_month=${year_month_data}&part=account_id,viewing_date,city,coordinates,country,device_id,hl,open_from_qr_code`)
      .then(async (response) => {

        let data = await response.json()
        setIsLoading(false)

        let item: MonthlyViewsData = {
          "is_loaded": true,
          "year_month": year_month_data
        }
        if (response.ok) {
          item["views"] = data
        }

        setMonthlyViews(prevV => {
          return [...prevV, item]
        })

      })
      .catch(error => {
        setNoConnection(true)
      })


  }
  async function loadAnalyticsData(year_month_data: string) {

    const delay = data_has_already_been_loaded ? 250 : (refreshing ? 350 : 0)

    // ACTIVITY
    if (monthly_activity.find(e => { return e.year_month === year_month_data }) === undefined) {
      if (data_has_already_been_loaded) setIsLoading(true)
      setTimeout(() => {
        handleLoadingActivity(year_month_data)
      }, delay)
    } else {
      setIsLoading(false)
      console.log(`Activity already loaded for the period : ${year_month_data}`)
    }



    // VIEWS
    // &jwt_token_enc=${JSON.stringify(jwt_token_enc)} with "jwt_token_enc" = { "iv": _, "content": _ }
    if (monthly_views.find(e => { return e.year_month === year_month_data }) === undefined) {
      setTimeout(() => {
        handleLoadingViews(year_month_data)
      }, delay)
    } else console.log(`Views already loaded for the period : ${year_month_data}`)


  }

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)

    // Reset variables 
    setMonthlyActivity([])
    setMonthlyViews([])
    setIsLoading(false)
    setNoConnection(false)

  }, [])
  useEffect(() => {
    if (refreshing) loadAnalyticsData(year_month)
  }, [refreshing])

  useEffect(() => {
    loadAnalyticsData(year_month)
  }, [year_month])






  return (
    <SafeAreaProvider>
      <ScreenViewTracker screen_name={"analytics"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
        <StatusBar
          barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
          backgroundColor={COLORS.clear}
          translucent
        />


        <ClassicHeader
          COLORS={COLORS}
          TEXT_STYLES={TEXT_STYLES}
          onClose={() => { navigation.goBack() }}
          closeButtonType={'chevronLeft'}
          headerText={localization.analytics}
          onPress={() => { }}
        />



        <View style={{ flex: 1, backgroundColor: COLORS.whiteGray }}>
          <ScrollView contentContainerStyle={{ justifyContent: 'center', paddingBottom: insets.bottom }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
            {
              no_connection ?
                <View style={{ marginTop: 80 }
                } >
                  <NoConnectionUi
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onPress={() => {
                      setNoConnection(false)
                      setTimeout(() => {
                        loadAnalyticsData(year_month)
                      }, 550)
                    }} />
                </View>
                :
                <>
                  <View style={{ paddingVertical: 30, width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.white }}>
                    <View style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100 }}>
                      {(month_activity?.activity === undefined && month_activity?.is_loaded) ?
                        // NO DATA AVAILABLE  
                        <View style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", }}>
                          <Text style={[TEXT_STYLES.noContentFont, { paddingHorizontal: 50, paddingTop: 20, textAlign: "center" }]}>{localization.no_data_for_this_month}</Text>
                        </View>
                        :
                        // LOADING APPEARANCE + UI 
                        <>
                          <Text style={{ fontSize: 28, fontWeight: "800", paddingHorizontal: 20, color: text_color, backgroundColor: box_color }}>{view_count}</Text>
                          <Text style={{ fontSize: 16, fontWeight: "800", paddingHorizontal: 40, color: text_color }}>{localization.impressions}</Text>
                          <Text numberOfLines={!activity_is_loaded ? 1 : undefined} style={[TEXT_STYLES.gray13Text, { marginHorizontal: 60, textAlign: "center", marginTop: 6, color: activity_is_loaded ? COLORS.smallGrayText : COLORS.clear, backgroundColor: box_color }]}
                          // ADD ("a total of ... times") and most importantly "both from your place and from outside." at the end of the text
                          >{localization.formatString(localization.your_info_has_been_seen_x_times_in_x, view_count, getYearMonthString(false) as any)}
                          </Text>
                        </>
                      }
                    </View>

                    <View style={{ opacity: data_has_already_been_loaded ? 1 : 0.01, paddingTop: 30, display: "flex", flexDirection: "row", justifyContent: "center", alignContent: "center" }}>

                      <MoveLeftOrRightButton onPress={() => {
                        const new_month = getPreviousMonthDate(month)
                        setMonth(new_month)
                      }} disabled={isLoading} left COLORS={COLORS} />


                      <View style={{ width: WINDOW_WIDTH * 0.5, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 15, fontWeight: "500", color: COLORS.black }}>{getYearMonthString(true)}</Text>
                      </View>


                      <MoveLeftOrRightButton
                        onPress={() => {
                          const new_month = getNextMonthDate(month)
                          setMonth(new_month)
                        }}
                        disabled={isLoading || month_selector_limit}
                        color={month_selector_limit ? COLORS.smallGrayText : COLORS.black}
                        COLORS={COLORS}
                      />

                    </View>

                  </View>


                  <CellDivider />


                  <>
                    {/* Looks great without a description and with multiple ones stacked vertically */}
                    <StatisticPlaceholder name={localization.unique_persons} statistic={unique_devices_id.length} description={unique_devices_id.length > 0 ? localization.number_persons_looked_info : localization.no_data_to_view} loadingAppearance={!views_loaded} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>


                    {/* Could have : Attention time    Average amount of time people spend looking at your information. */}

                    {/* Not so important : (Horizontall graph of how many times people do look at your information : 1 time (50%), 2 times (50%)) */}

                    <View style={{ width: "100%", paddingVertical: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor: COLORS.white }}>
                      <StatisticPlaceholder name={localization.spoken_languages} description={spoken_languages.length > 0 ? localization.people_main_language : localization.no_data_to_view} marginTop={0} loadingAppearance={!views_loaded} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>

                      {/* ROWS */}
                      {views_loaded &&
                        spoken_languages.map((people_talking_language, index) => {

                          const language_metadata = languagesInUserLocale.find(e => { return e.locale === people_talking_language.hl })

                          return (
                            <View key={index} style={{ display: "flex", paddingHorizontal: 20, paddingTop: 12, flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-between", }}>
                              <Text numberOfLines={1} style={{ fontWeight: "500", paddingRight: 20, width: "70%", color: COLORS.black }}>{language_metadata.name}</Text>
                              <Text style={{ fontWeight: "700", color: COLORS.black }}>{people_talking_language.count}</Text>
                            </View>
                            /** 
                            *<View style={{ display: "flex", paddingHorizontal: 20, paddingTop: 12, flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-between", }}>
                             <Text numberOfLines={1} style={{ fontWeight: "500", paddingRight: 20, backgroundColor: "red", width: "29%" }}>{e[1]}</Text>
                             <View style={{ height: 7, width: e[0], backgroundColor: COLORS.darkBlue }}></View>
                             <Text style={{ fontWeight: "700" }}>{e[0]}</Text>
                           </View>
                           */
                          )
                        })
                      }
                    </View>


                    <CellDivider />


                    <View style={{ width: "100%", paddingVertical: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor: COLORS.white }}>
                      <StatisticPlaceholder name={localization.activity_times} description={(max_views > 0) ? localization.avg_hours_people_view_info : localization.no_data_to_view} marginTop={0} loadingAppearance={!views_loaded} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>

                      {/* COLUMNS */}
                      {(max_views > 0) &&
                        <View style={{ display: "flex", marginHorizontal: 20, width: WINDOW_WIDTH - 40, height: 116, alignItems: "flex-end", justifyContent: "space-between", flexDirection: "row" }}>
                          {views_loaded ?
                            activityTime.map((e, index) => {

                              const percent_based_on_most_viewes = e.count / max_views
                              const opacity = percent_based_on_most_viewes < 0.5 ? 0.5 : percent_based_on_most_viewes
                              const placeholder = getHourSliceDescription(e.hour_slice, userLocale)

                              return (
                                <View key={index} style={{ width: "11.8%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                                  <Text style={{ paddingTop: 3, color: "gray", opacity: opacity, paddingBottom: 2 }}>{e.count}</Text>
                                  <View style={{ width: "100%", height: 70 * percent_based_on_most_viewes, backgroundColor: "gray", opacity: opacity }}></View>
                                  <Text style={[TEXT_STYLES.gray12Text, { paddingTop: 3 }]}>{placeholder}</Text>
                                </View>
                              )
                            })
                            : undefined
                          }
                        </View>
                      }
                    </View>

                  </>
                </>
            }
          </ScrollView>
        </View>



      </SafeAreaView >


    </SafeAreaProvider >
  )
}


interface MoveLeftOrRightButtonInterface {
  onPress: () => any
  disabled: boolean
  COLORS: ColorsInterface
  color?: string
  left?: boolean
}
function MoveLeftOrRightButton({ onPress, disabled, COLORS, color = COLORS.black, left = false }: MoveLeftOrRightButtonInterface) {
  return (
    <TouchableHighlight
      onPress={() => { onPress() }}
      disabled={disabled}
      activeOpacity={0.9}
      style={{
        position: "relative",
        borderRadius: 4.5,
      }}
    >
      <View style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: COLORS.softGray,
        borderRadius: 4.5,
        // Easier touch gestures
        width: 28, // 24 to be like on CategoryAppearance
        height: 28, // 24
      }}>
        <ChevronSymbol left={left} color={color} />
      </View>
    </TouchableHighlight>
  )
}


/** Blank space with a height of 10. */
function CellDivider() {
  return (<View style={{ height: 10 }} />)
}


interface StatisticDescriptionInterface {
  name: string
  COLORS: ColorsInterface
  TEXT_STYLES: TextStylesInterface
  statistic?: number
  description?: string
  marginTop?: number
  loadingAppearance?: boolean
}
function StatisticPlaceholder({ name, statistic, TEXT_STYLES, description, marginTop = 20, loadingAppearance = false, COLORS }: StatisticDescriptionInterface) {

  const box_color = loadingAppearance ? COLORS.lightGray : COLORS.clear

  return (
    <View style={{ width: "100%", paddingTop: marginTop, paddingBottom: 0, paddingHorizontal: 20, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", backgroundColor: COLORS.white }}>

      <View style={{ display: "flex", flexShrink: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <Text style={{ fontSize: 14, fontWeight: "800", backgroundColor: box_color, color: loadingAppearance ? COLORS.clear : COLORS.black }}>{loadingAppearance ? "Statistic name" : name}</Text>
        {(statistic && !loadingAppearance) ? <Text style={{ fontWeight: "700", color: COLORS.black }}>{statistic}</Text> : undefined}
      </View>

      {((description ?? "") !== "") &&
        <Text style={[TEXT_STYLES.gray12Text, { marginTop: 4, width: "75%", color: loadingAppearance ? COLORS.clear : COLORS.smallGrayText, backgroundColor: box_color }]}>{loadingAppearance ? "Statistic description" : description}</Text>
      }

    </View>
  )
}