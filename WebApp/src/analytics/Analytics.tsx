//
//  Analytics.ts
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 10/01/22.
//

import React, { useState, useEffect } from 'react'
import package_json from './../../package.json'
import { AccountMainData } from '../Data'
import { generateID, getTopLevelDomain } from '../components/functions'
import { ScreenNameType, ScreenViewEventObj } from '.'
import { isAndroid, isDesktop, isIOS, isMacOs, isWindows } from 'react-device-detect'
import { OsType, Session, SessionObj } from './AnalyticsData'

// Global data 
import { useDispatch, useSelector } from "react-redux"
import { selectAnalytics, updateCurrentSession } from "."
import { atag } from "./reduxSlice"


// SESSIONS LIFECYCLE : 
// 1 - CREATE THE SESSION
// 2 - UPDATE THE CURRENT SESSION WITH EVENTS COMING FROM ALL OVER THE APP
// 3 - SAVE IT ON SERVER : WHEN APP CLOSED (ALL DEVICES) or WHEN VISIBILITY CHANGE (NON DESKTOPS : PHONES, TABLETS, ...)

// CACHE : 
// user_account_main_data (TODO)

// COOKIES :
// _adid : AtSight Device ID
// _ii : Ip Info

// OTHER INFORMATION :
// onchange("visibilitychange") navigator.sendBeacon() https://dev.to/chromiumdev/sure-you-want-to-leavebrowser-beforeunload-event-4eg5 https://stackoverflow.com/a/19524949 https://nodejs.org/api/os.html#osrelease 


const top_level_domain = getTopLevelDomain(window.location.href)
const t_l_d = top_level_domain === "localhost" ? "ch" : top_level_domain


export default function Analytics() {

  // States 
  const [visibility, setVisibility] = useState<DocumentVisibilityState>("visible")


  // Values
  const dispatch = useDispatch()
  const analytics = useSelector(selectAnalytics)
  const current_session = analytics?.session


  async function initializeSessionValues() {

    // console.log("\n\n_________________INITIALIZING A NEW SESSION__________________")
    const start_date = new Date().toISOString()
    const ip = "" // <- will be set by the server if empty
    const account_type = (await getCachedUserAccountMainData())?.account_type
    const user_agent = navigator.userAgent
    const referrer = document.referrer !== "" ? document.referrer : undefined

    const session = SessionObj("", "", start_date, 0, package_json.version, ip, undefined, undefined, user_agent, referrer, account_type)
    dispatch(updateCurrentSession({ session: session }))

  }
  function saveSession(session: Session) {


    // PREPARATION
    // device_id : will be set by the server
    if (session === undefined) { return }
    const id = generateID(15)
    // ip : will be set by the server 
    const duration = getDuration(new Date(), new Date(session.start_date))
    let final_session = Object.assign({}, session)
    final_session.id = id
    final_session.duration = duration

    // NON DESKTOP SESSIONS IMPROVEMENT
    if (!isDesktop && duration <= 5) { return } // -> Fast hack to improve data collection's precision by avoiding to get "short" (1-5 sec) / "transitions" sessions.

    // SEND BEACON
    if (!navigator.sendBeacon) { // FALLBACK
      navigator.sendBeacon = (url: string, data: any) => window.fetch(url, { method: 'POST', body: data, credentials: 'include', headers: { 'Content-Type': 'application/json' } }) as any
    }
    var blob = new Blob([JSON.stringify(final_session)], { type: "application/json" });
    navigator.sendBeacon(`https://apis.atsight.${t_l_d}/analytics/sessions`, blob)
    // navigator.sendBeacon(`https://localhost/analytics/sessions`, blob)
  }


  // CACHE 
  function getCachedUserAccountMainData() {
    return new Promise<AccountMainData | undefined>(async (resolve, reject) => {
      let account_main_data: AccountMainData | undefined = undefined
      try {

        const cached_account_main_data = localStorage.getItem("@user_account_main_data")
        account_main_data = cached_account_main_data && JSON.parse(cached_account_main_data)
        resolve(account_main_data)

      } catch (error) {
        reject(error)
      }
    })
  }



  // INITIALIZATON + HANDLE ANALYTICS
  useEffect(() => {
    initializeSessionValues()
    if (!isDesktop) {
      window.addEventListener('visibilitychange', () => {
        setVisibility(document.visibilityState)
      })
    }
  }, [])
  useEffect(() => {
    if (current_session) {
      window.onbeforeunload = () => {
        saveSession(current_session)
      }
    }
  }, [current_session])
  //
  function handleAnalyticsBasedOnVisibility() {
    if (visibility === 'visible') {
      if (current_session === undefined) initializeSessionValues()
    } else if (current_session !== undefined) {
      saveSession(current_session)
      dispatch(updateCurrentSession({ session: undefined })) // Clear
    }
  }
  useEffect(() => {
    handleAnalyticsBasedOnVisibility()
  }, [visibility])



  return (null)
  /** FOR HELP DURING DEVELOPMENT   
   return (<p>{"ANALYTICS : "}{JSON.stringify(current_session)}</p>)
  */

}


/**
 * @param log_date 
 * @returns hour, minutes, seconds e.g. "08:30:50"
 */
export function getLogTime(log_date?: Date) {
  let date = log_date ? log_date : new Date()
  return date.toLocaleString("fr", { "second": "numeric", "minute": "numeric", "hour": "numeric" })
}


/**
 * Returns the difference of time between the two dates in seconds.
*/
export function getDuration(end_date: Date, start_date: Date) {

  const timeSinceLastSessionInMilliseconds = (end_date as any) - (start_date as any)
  let timeSinceLastSession = (timeSinceLastSessionInMilliseconds / 1000) // (in minutes : x / 60000, in seconds: x / 1000)

  return Number(timeSinceLastSession.toFixed(0))
}


// UNUSED
export function getOs(): OsType {
  if (isIOS) {
    return "ios"
  } else if (isMacOs) {
    return "macos"
  }
  else if (isAndroid) {
    return "android"
  } else if (isWindows) {
    return "windows"
  } else return "web"
}


// SCREEN VIEW
interface ScreenViewTrackerInterface {
  screen_name: ScreenNameType
  is_user_one?: boolean
}
export function ScreenViewTracker({ screen_name, is_user_one = false }: ScreenViewTrackerInterface) {

  const dispatch = useDispatch()

  function handleScreenView() {
    let start_date = new Date()
    return () => {
      let end_date = new Date()
      let duration = getDuration(new Date(), start_date)
      let user_one = is_user_one ? true : undefined
      let event = ScreenViewEventObj(screen_name, getLogTime(end_date), duration, user_one)
      if (duration > 2) { // Avoids to catch the goBack() events on the web version
        dispatch(atag({ "event_type": "screen_view", "event": event }))
      }
    }
  }

  useEffect(() => {
    return handleScreenView()
  }, [])


  return (null)
}

