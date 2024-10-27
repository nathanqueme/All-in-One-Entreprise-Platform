//
//  analyticsData.ts
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 10/01/22.
//

import { AccountType } from "./types"


// HISTORY 
// - SEARCH (id, query, trigger, date)
// - POSTS SEEN (post_id, start_date, duration, translated_to_locale: ? string, zoomed_count:? number) -> can be used to understand what the user likes or to understand how people consumme content in general


// TRIGGERED ONCE END WHEN THE APP IS OPEN FOR THE FIRST TIME
export type OsType = "ios" | "android" | "windows" | "macos" | "web"
export type PlatformType = "app" | "web"
export interface DeviceInfo {
  // device_id : 
  // -> NOW : Generated for each device from each platform. Respects laws but is a bit messy since once device that runs the app and then the web version is recognized as two different devices. 
  // -> SOON : may be the unique deviceID in the future, but only after seeing a lawyer (https://github.com/react-native-device-info/react-native-device-info#getuniqueid) + (https://support.google.com/googleplay/android-developer/answer/10144311)
  device_id: string
  registration_date: string
  platform: PlatformType
  ip: string 
  // APP ONLY
  model?: string
  os?: OsType
  os_version?: string
  // APP + WEB 
  user_agent?: string
}
export function DeviceInfoObj(device_id: string, registration_date: string, platform: PlatformType, ip: string, model?: string, os?: OsType, os_version?: string, user_agent?: string) {
  return {
    device_id: device_id,
    registration_date: registration_date,
    platform: platform,
    ip: ip,
    model: model,
    os: os,
    os_version: os_version,
    user_agent: user_agent
  }
}


// EVENTS __________________________________________________
export type EventType = 'action' | 'screen_view' | 'timing' | 'exception'

export type SuccessState = 'success' | 'failed' | 'canceled'
export type ActionEventType = 'search' | 'select_content' | 'share' | 'sign_up' | 'login' | 'log_out' | 'view_item' | 'view_item_list' | 'view_promotion' | 'scan'
/**
 * Action types  	      / Label
- search		            / search_term (e.g. 'Parc near me')
- select_content		    / resource_type (e.g. 'post')
- share		              / method (e.g. 'message')
- sign_up		            / success_state (success/failed/canceled)
- login                 / success_state (success/failed/canceled)
- log_out               / success_state (success/failed/canceled)
- view_item		 
- view_item_list		 
- view_promotion		 
- scan                  / success_state (success/failed/canceled)
 */
export interface ActionEvent {
  action: ActionEventType // (see above)
  log_time: string
  label?: string // (see above)
  user_one?: boolean 
}
/**
 * @param action 
 * @param log_time  hour, minutes, seconds e.g. "08:30:50"
 * @param label A string to describe the action.
 */
export function ActionEventObj(action: ActionEventType, log_time: string, label?: string, user_one?: boolean) {
  return {
    action: action,
    log_time: log_time,
    label: label,
    user_one: user_one
  }
}

export type ScreenNameType = 'scanner' | 'sign_in' | 'sign_up' | 'posts' | 'related_items' | 'profile' | 'qr' | 'pdf_viewer' | 'pdf_info' | 'settings' | 'account_info' | 'post_editor' | 'post_editor' | 'related_items_editor' | 'post_categories_sorter'
export interface ScreenViewEvent {
  screen_name: ScreenNameType
  log_time: string
  duration: number // (milliseconds)
  user_one?: boolean
}
/**
 * @param screen_name 
 * @param log_time hour, minutes, seconds e.g. "08:30:50".
 * @param duration the amount of seconds the user has spent looking at the view.
 * @param user_one indicates if the screen belongs to the user, so if the user is looking at it's information.
 */
export function ScreenViewEventObj(screen_name: ScreenNameType, log_time: string, duration: number, user_one?: boolean) {
  return {
    screen_name: screen_name,
    log_time: log_time,
    duration: duration,
    user_one: user_one
  }
}

export interface TimingEvent {
  name: string
  value: number
  label?: string
}
/**
 * @param name A string to identify the variable being recorded (e.g. 'load'). 
 * @param value	The number of milliseconds in elapsed time to report to Analytics (e.g. 20). 
 * @param label A string that can be used to describe what was loaded (e.g. 'First 12 related items').  
 */
export function TimingEventObj(name: string, value: number, label?: string) {
  return {
    name: name,
    value: value,
    label: label
  }
}

export interface ExceptionEvent {
  description: string
  fatal?: boolean
}
/**
 * @param description  A description of the error.
 * @param fatal true if the error was fatal
 */
export function ExceptionEventObj(description: string, fatal?: boolean) {
  return {
    description: description,
    fatal: fatal
  }
}
// __________________________________________________


export interface Session {
  id: string
  device_id: string
  start_date: string
  duration: number // in seconds
  version: string
  ip: string 
  // APP ONLY 
  os_version?: string,
  installer_package?: string // Only when comes from the app e.g. for App Store can be 'appstore' or 'testflight'
  // WEB  
  user_agent?: string
  referrer?: string // Only when comes from the web_version e.g. 'https://www.google.com'
  //
  account_type?: AccountType // could be replaced by account's short_id?: string  
  end_date?: string // devices only
  // EVENTS
  actions?: ActionEvent[]
  screen_views?: ScreenViewEvent[]
  timing?: TimingEvent[]
  exceptions?: ExceptionEvent[]
}
export function SessionObj(id: string, device_id: string, start_date: string, duration: number, version: string, ip: string, os_version?: string, installer_package?: string, user_agent?: string, referrer?: string, account_type?: AccountType, end_date?: string, actions?: ActionEvent[], screen_views?: ScreenViewEvent[], timing?: TimingEvent[], exceptions?: ExceptionEvent[]) {
  return {
    id: id,
    device_id: device_id,
    start_date: start_date,
    duration: duration,
    version: version,
    ip: ip,
    os_version: os_version,
    installer_package: installer_package,
    user_agent: user_agent,
    referrer: referrer,
    account_type: account_type,
    end_date: end_date,
    actions: actions,
    screen_views: screen_views,
    timing: timing,
    exceptions: exceptions
  }
}










export interface AccountActivity {
  account_id: string
  year_month: string
  view_count: number
}
export function AccountActivityObj(account_id: string, year_month: string, view_count: number) {
  return {
    account_id: account_id,
    year_month: year_month,
    view_count: view_count
  }
}


export interface AccountView {
  account_id: string
  id: string
  viewing_date: string
  // viewing_duration: number (seconds)
  device_id: string
  ip: string
  country: string
  city: string
  coordinates: number[]
  platform: PlatformType
  open_from_qr_code?: boolean
  hl?: string
}
export function AccountViewObj(account_id: string, id: string, viewing_date: string, device_id: string, ip: string, country: string, city: string, coordinates: number[], platform: PlatformType, open_from_qr_code?: boolean, hl?: string) {
  return {
    account_id: account_id,
    id: id,
    viewing_date: viewing_date,
    device_id: device_id,
    ip: ip,
    country: country,
    city: city,
    coordinates: coordinates,
    platform: platform,
    open_from_qr_code: open_from_qr_code,
    hl: hl
  }
}

