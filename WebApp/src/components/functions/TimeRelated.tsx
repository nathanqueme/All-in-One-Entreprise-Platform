//
//  TimeRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'
import localization from '../../utils/localizations'
import { TimetablesType, TemporaryTime, HourSlice } from '../../Types'
import { DailyTimetableObj } from '../../Data'
import { DailyTimetable } from '../../Data'
import { getUserPreferredLocale } from '../../assets/LanguagesList'
import { getDailyTimetablesOfEachDay } from '../TimetablesRelated'
import { capitalize } from './ConvertionsGenerationsObtentions'



// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import localizedFormat from "dayjs/plugin/localizedFormat"
import utc from "dayjs/plugin/utc"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()
dayjs.extend(localizedFormat) // enables using formats like 'LT' e.g. : dayjs().format('L LT')
dayjs.extend(utc) // enables utc related functions
// https://day.js.org/docs/en/plugin/utc







export function getCurrentDay() {
    return new Date().getDay()
}


/**
  * 
  * @param day : a number between 0 and 6. With 0 as Sunday and 1 as Monday.
  * @param dailyTimetables 
  * @returns : returns 
*/
export function getDailyTimetablesOfGivenDay(day: number, dailyTimetables: DailyTimetable[]): DailyTimetable[] {

    if (dailyTimetables === undefined) return []
    if (dailyTimetables.length < 7) return []

    let dailyTimetablesOfEachDay = getDailyTimetablesOfEachDay(dailyTimetables)

    return dailyTimetablesOfEachDay?.find(e => { return e[0].day === day }) ?? []

}


/** 
  * Time in 'HH:mm' format to current day date with corresponding time. (e.g. '14:02' to today's date at '14:02')
  * P.S. : The input and output are in UTC
*/
export function timeToDate(time: string) {
    var timeComponent = time.split(':')
    let hours = Number(timeComponent[0])
    let minutes = Number(timeComponent[1])

    let date = new Date()
    date.setUTCHours(hours); date.setUTCMinutes(minutes)
    return date
}


/** 
 * Date to time in 'HH:mm' format (e.g. '10:32')
 * Is used to save time on server with as less data as possible.
 * P.S. : The input and output are in UTC
*/
export function dateToTime(date: Date) {
    return `${date.getUTCHours()}:${date.getUTCMinutes()}`
}


/**
 * Date to '3:22 AM or 15:24' based on the locale
*/
export function localizedTimeString(locale: string, date: Date) {
    return date.toLocaleString(locale, {
        hour: 'numeric',
        minute: 'numeric',
    })
}


/** 
  * Returns the day name. The day value is between [0-6] (e.g. 1 returns 'Monday')
 */
export function getDayName(day: number) {
    var dayNumber = 0

    switch (day) {
        case 0: dayNumber = 21; break // The 31 of Novembre in 2022 was a Sunday 
        case 1: dayNumber = 22; break
        case 2: dayNumber = 23; break
        case 3: dayNumber = 24; break
        case 4: dayNumber = 25; break
        case 5: dayNumber = 26; break
        case 6: dayNumber = 27; break // ... was a Saturday
    }

    let date = new Date(`2021-11-${dayNumber}T12:00:00.000Z`)

    return capitalize(dayjs(date).locale(getUserPreferredLocale()).format('dddd'))
}


/** Returns the description of values from a DailyTimetable object. 
 * The output can be : 
 * - 07:30 AM - 08:00 PM or 07:30 - 20:00  (based on user's locale)
 * - "Open all day" or "Available all day"  (based on the timetablesType)
 * - "Close all day" or "Not available that day"  (based on the timetablesType)
 * 
 * N.B. : 
 * - voluntarily ignores DST (Daylight Saving Time) so that dates don't change during summer/winter. 
*/
export function getDailyTimetableDescription(dailyTimetable: DailyTimetable, timetablesType: TimetablesType) {

    let start_date = timeToDate(dailyTimetable?.start_time ?? '')
    let end_date = timeToDate(dailyTimetable?.end_time ?? '')
    let user_locale = getUserPreferredLocale()

    let sd_without_dst = dateWithoutDST(start_date)
    let ed_wihout_dst = dateWithoutDST(end_date)

    switch (dailyTimetable?.special_time ?? '') {
        case 'all_day': return (timetablesType === 'opening_hours' ? localization.open_all_day : localization.available_all_day)
        case 'never_that_day': return (timetablesType === 'opening_hours' ? localization.close_all_day : localization.not_available_that_day)
        default:
            // The date input is a UTC and the output is a local time for instance time in France will have +2 hours.
            return `${dayjs(sd_without_dst).locale(user_locale.split("-")[0]).format('LT')} - ${dayjs(ed_wihout_dst).locale(user_locale.split("-")[0]).format('LT')}`
    }
}


/** 
 * Returns the default daily timetables (daily times starting at 06:00 AM and ending at 11:00 PM)
 * N.B.: 
 * - avoids DST (Daylight Saving Time) so that it returns the same time on summer and winter.
 * - works for all the UTC offsets so that it alaways returns "06:00 - 22:00".
*/
export function generateDefaultDailyTimetables(): DailyTimetable[] {
    var timetables = []
    let is_dst = isDST(new Date())

    for (let i = 0; i <= 6; i++) {
        // UTC date that it adapts to local time 
        let six_am = new Date(); six_am.setHours(is_dst ? 7 : 6);
        let six_am_hour = six_am.getUTCHours() // will be different in France and in Australia but will end up displaying 06H00 in both cases
        // UTC date so that adapts to local time  
        let ten_pm = new Date(); ten_pm.setHours(is_dst ? 23 : 22)
        let ten_pm_hour = ten_pm.getUTCHours()
        timetables.push(DailyTimetableObj(i, `${six_am_hour < 10 ? `0${six_am_hour}` : six_am_hour}:00`, `${ten_pm_hour < 10 ? `0${ten_pm_hour}` : ten_pm_hour}:00`, ''))
    }

    return timetables
}


export function getTemporaryTimeDescriptiveText(temporaryTime: TemporaryTime, timetablesType: TimetablesType) {
    return timetablesType === "opening_hours" ? localization.temporarily_closed : localization.temporarily_not_available
}


export type TimeIntervalType =
    'all_day' | // Case 1
    'basic' | // Case 2
    'until_end_of_day' | // Case 3
    'until_time_in_today_and_in_tomorrow' // Case 4
export interface IsInTimeIntervalOutput {
    isInTimeInterval: boolean
    type: TimeIntervalType
}
export function IsInTimeIntervalOutputObj(isInTimeInterval: boolean, type: TimeIntervalType) {
    return {
        isInTimeInterval: isInTimeInterval,
        type: type,
    }
}


/**
 * Determines if the current date is between the given time interval or if there is a special time such as "all_day" or "never_that_day".
 * 
 * Is able to do so with basic time intervals such as 16H00 - 19H00 and more complicated ones such as 16H00-02H00
  
  
   Case 1 : 05H00 - 05H00           (equal)                                   start_date = start_date                true 
   Case 2 : 05H00 - 21H00           (croissant)                               start_date < end_date                  is in interval 
   Case 3 : 05H00 - 00H00           (05H00 - 23H59)                           end_time = 00H00                       use 23h59 instead of 00H00
   Case 4 : 05H00 - 02H00           (05H00 - 23H59 or 00H00 - 02H00)          end_time < start_time                  use 23h59 instead of 00H00 and another interval for 00H00 - 02H00
  
  
 */
export function checkIfIsInTimeInterval(dailyTimetable: DailyTimetable) {

    // UTC
    let currentDate = new Date
    let startDate = timeToDate(dailyTimetable.start_time)
    let endDate = timeToDate(dailyTimetable.end_time)



    // Get the hours and minutes from the "start_time" and "end_time".
    // These values are based on the LOCAL TIME --> not UTC.
    let startTimeData = { hours: startDate.getHours(), minutes: startDate.getMinutes() }
    let endTimeData = { hours: endDate.getHours(), minutes: endDate.getMinutes() }



    // Apply these values to today.
    // LOCAL
    const todayStartDate = new Date()
    todayStartDate.setHours(startTimeData.hours)
    todayStartDate.setMinutes(startTimeData.minutes)
    // LOCAL 
    const todayEndDate = new Date()
    todayEndDate.setHours(endTimeData.hours)
    todayEndDate.setMinutes(endTimeData.minutes)
    // LOCAL
    const todayAt23H59 = new Date()
    todayAt23H59.setHours(23)
    todayAt23H59.setMinutes(59)
    todayAt23H59.setSeconds(0)
    // LOCAL
    const beginnigOfCurrentDay = new Date()
    beginnigOfCurrentDay.setHours(0, 0, 0, 0)





    // Get case 
    let isInTimeInterval = undefined
    let type: TimeIntervalType
    if ((startTimeData.hours === endTimeData.hours) && (startTimeData.minutes === endTimeData.minutes)) {

        isInTimeInterval = true
        type = 'all_day'
    } else if (todayStartDate < todayEndDate) {

        isInTimeInterval = currentDate >= todayStartDate && currentDate <= todayEndDate
        type = 'basic'
    } else if ((endDate.getHours() === 0) && (endDate.getMinutes() === 0)) {

        isInTimeInterval = currentDate >= todayStartDate && currentDate <= todayAt23H59
        type = 'until_end_of_day'
    } else {

        isInTimeInterval = (currentDate >= todayStartDate && currentDate <= todayAt23H59) ||  // --> this part is true the current day 
            (currentDate >= beginnigOfCurrentDay && currentDate <= todayEndDate) // --> this part will be true the next day 
        type = 'until_time_in_today_and_in_tomorrow'
    }





    // Special time check 
    switch (dailyTimetable.special_time) {
        case 'all_day': isInTimeInterval = true; break
        case 'never_that_day': isInTimeInterval = false; break
        default: break
    }




    return IsInTimeIntervalOutputObj(isInTimeInterval, type)

}


/** 
 * @returns a text that describes wether or not something can currently be done.
  - "Open" or "Available"     (based on the timetablesType)
  - "Close" or "Not Available"     (based on the timetablesType)
*/
export function getIsOpenOrAvailableText(isInTimeInterval: boolean, timetablesType: TimetablesType) {
    switch (isInTimeInterval) {
        case true: return timetablesType === 'opening_hours' ? localization.open : localization.available
        case false: return timetablesType === 'opening_hours' ? localization.closed : localization.not_available
    }
}


// NEW
export function getHourSliceDescription(hour_slice: HourSlice, locale: string) {

    let hour_number
    let text
    const is_english_locale = locale.startsWith("en")
  
    if (is_english_locale) {
      if (hour_slice === "0-3" || hour_slice === "3-6" || hour_slice === "6-9" || hour_slice === "9-12") {
        text = "a"
      } else {
        text = "p"
      }
    } else {
      text = " H"
    }
  
    switch (hour_slice) {
      case '0-3':
        hour_number = is_english_locale ? 12 : 0; break
      case '3-6':
        hour_number = 3; break
      case '6-9':
        hour_number = 6; break
      case '9-12':
        hour_number = 9; break
      case '12-15':
        hour_number = 12; break
      case '15-18':
        hour_number = is_english_locale ? 3 : 15; break
      case '18-21':
        hour_number = is_english_locale ? 6 : 18; break
      case '21-0':
        hour_number = is_english_locale ? 9 : 21; break
    }
  
    return `${hour_number}${text}`
  }
  
  // NEW 
  /**
   * Returns the given date with it's previous one. 
   * e.g. : "2022-07-22T09:30:00.000Z" returns "2022-06-22T09:30:00.000Z"
  */
  export function getPreviousMonthDate(date: Date) {
    const current_month_number = date.getUTCMonth()
    const change_year = current_month_number === 0
    const new_month_number = change_year ? -1 : current_month_number - 1
    let new_month = new Date(date)
    new_month.setMonth(new_month_number)
    return new_month
  }
  
  
  // NEW 
  /**
   * Returns the given date with it's previous one. 
   * e.g. : "2022-06-22T09:30:00.000Z" returns "2022-07-22T09:30:00.000Z"
  */
  export function getNextMonthDate(date: Date) {
    const current_month_number = date.getUTCMonth()
    const new_month_number = current_month_number + 1
    let new_month = new Date(date)
    new_month.setUTCMonth(new_month_number)
    return new_month
  }
  
  
  // NEW 
  /**
   * Returns the hours slice based on the provide hour and minutes.
   * e.g. : 7,12 returns "6-9"
   * e.g. : 0, 30 returns "0-3"
   */
  export function getHourSlice(hour: number, minutes: number, seconds: number): HourSlice {
  
  
    const m_and_s_equal_0 = minutes === 0 && seconds === 0
  
  
    if ((hour === 0 && !(m_and_s_equal_0)) || (hour > 0 && hour < 3) || (hour === 3 && m_and_s_equal_0)) {
      return '0-3' // mostly : 1 - 2 - 3 
    }
    else if ((hour === 3 && (!m_and_s_equal_0)) || (hour > 3 && hour < 6) || (hour === 6 && m_and_s_equal_0)) {
      return '3-6' // mostly : 4 - 5 - 6
    }
    else if ((hour === 6 && (!m_and_s_equal_0)) || (hour > 6 && hour < 9) || (hour === 9 && m_and_s_equal_0)) {
      return '6-9' // mostly : 7 - 8 - 9 
    }
    else if ((hour === 9 && (!m_and_s_equal_0)) || (hour > 9 && hour < 12) || (hour === 12 && m_and_s_equal_0)) {
      return '9-12' // mostly : 10 - 11 - 12 
    }
    else if ((hour === 12 && (!m_and_s_equal_0)) || (hour > 12 && hour < 15) || (hour === 15 && m_and_s_equal_0)) {
      return '12-15' // mostly : 13 - 14 - 15 
    }
    else if ((hour === 15 && (!m_and_s_equal_0)) || (hour > 15 && hour < 18) || (hour === 18 && m_and_s_equal_0)) {
      return '15-18' // mostly : 16 - 17 - 18 
    }
    else if ((hour === 18 && (!m_and_s_equal_0)) || (hour > 18 && hour < 21) || (hour === 21 && m_and_s_equal_0)) {
      return '18-21' // mostly : 19 - 20 - 21
    }
    else if ((hour === 21 && (!m_and_s_equal_0)) || (hour > 21 && hour < 24) || (hour === 0 && m_and_s_equal_0)) {
      return '21-0' // mostly : 22 - 23 - 00 
    } else return '0-3'
  
  }
  
  
  // NEW
  // https://stackoverflow.com/a/30280636
  /** VALUES FOR TESTS : 
   *  PARIS : 27 Mars from "2022-03-27T01:00:00.775Z" - 29 Octobre before "2022-10-30T01:00:00.775Z" 
   *  NEW YORK : 13 mars from "2022-03-13T07:00:00.775Z" - 6 novembre before "2022-11-06T06:00:00.775Z"
   *  SYDNEY : 2 October from "2022-10-01T16:00:00.775Z" - 2 April 2023 before "2023-04-01T16:00:00.000Z"
  */
  export function isDST(d: Date) {
    let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== d.getTimezoneOffset();
  }
  
  
  // NEW
  /**
   * Makes the date avoid DST (Daylight Saving Time) so that the date always stay the same and people don't have to update them of +1/-1 hour in summer/winter.
   * e.g. : In winter a user set the time to "14:00" which stays "14H00" in summer. (Without, it would switch to "15H00" in summer. And if the user was setting it to "14H00" in summer would become "13H00" in winter due to DST)
  */
  export function dateWithoutDST(d: Date) {
    if (isDST(d)) {
      let utcHours = d.getUTCHours()
      d.setUTCHours(utcHours - 1) // Cancels adding one hour in summer 
    }
    return d
  }