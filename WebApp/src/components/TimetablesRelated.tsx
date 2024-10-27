import React from "react"
import { DailyTimetable } from "../Data"
import { TimetablesType } from "../Types"
import localization from "../utils/localizations"




/** 
  * Transforms an array of unordered "DailyTimetables" into an array of array of "DailyTimetables".
  * -> Each child array contains the "DailyTimetables" of an certain day for instance all the "DailyTimetables" of Monday
*/
export function getDailyTimetablesOfEachDay(dailyTimetables: DailyTimetable[]) {

    let days = [0, 1, 2, 3, 4, 5, 6]

    return days.map(day => {
        let dailyTimetablesOfThatDay = dailyTimetables.filter(e => { return e.day === day })
        return dailyTimetablesOfThatDay
    })
}




/**
 * 
 * @param timetablesType 
 * @returns "Opening hours" or "Hours of availability"
 */
export function getTimetablesTypeDescriptiveText(timetablesType: TimetablesType) {
    return timetablesType === 'opening_hours' ? localization.opening_hours : localization.hours_of_availability
}



/**
 * 
 * @param timetablesType 
 * @param subject 
 * @returns something like : "Restaurant (Opening hours)" or "Room service (Hours of availability)"
 */
export function getTimetablesDescriptiveText(timetablesType: TimetablesType, subject: string) {
    const hasSubject = (subject ?? "") !== ""
    const type_description = getTimetablesTypeDescriptiveText(timetablesType)
    return `${hasSubject ? `${subject ?? ""} ` : ""}${hasSubject ? "("+type_description+")" : type_description}`
}

