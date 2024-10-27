//
//  TimetablesRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import localization from '../../utils/localizations'
import { ColorsInterface } from './../../assets/Colors'
import { View, Text, Pressable } from 'react-native'
import { TimetablesType } from '../../Types'
import { DailyTimetable, Timetables } from '../../Data'
import { getDayName, getDailyTimetableDescription, getTemporaryTimeDescriptiveText } from '../functions'
import { ChevronSymbol, ExclamationMarkTriangleSymbol } from '../Symbols'
import { TextStylesInterface } from '../styles/TextStyles'



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














interface TimetablesListInterface {
    timetables: Timetables
    editable: boolean
    setDailyTimetablesOfThatDay: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    backgroundColor?: string
    textColor?: string
}
/**
 * Displays a list of daily timetables and the special time warning at the bottom if any.
*/
export function DailyTimetablesList({ timetables, editable, setDailyTimetablesOfThatDay: setDailyTimetablesOfADay, COLORS, TEXT_STYLES, backgroundColor = COLORS.whiteToGray2, textColor }: TimetablesListInterface) {


    // Values
    let dailyTimetablesOfEachDay = getDailyTimetablesOfEachDay(timetables.daily_timetables)
    /** 
     * The use of the values 'firstDailyTimetables' and 'otherDailyTimetables' remove the gregorian logic by displaying the "Sunday" at the end of the list.
     * Without it : ["Sunday", "Monday", ..., "Saturday"]
     * With it : ["Monday", ..., "Saturday", "Sunday"]
     * 
     * So the day are in the order : [1, 2, 3, 4, 5, 6, 0]
    */
    let firstDayDailyTimetables = [dailyTimetablesOfEachDay.slice().shift()]
    let otherDaysDailyTimetables = dailyTimetablesOfEachDay.slice(1)
    let orderedDailyTimetablesOfEachDay = otherDaysDailyTimetables.concat(firstDayDailyTimetables)
    let hasTemporaryTime = (timetables?.temporary_time ?? "") !== ""


    return (
        <View style={{ backgroundColor: backgroundColor, flex: 1, width: '100%', alignItems: "flex-start", justifyContent: "center" }}>
            {orderedDailyTimetablesOfEachDay.map((e, index) => {
                return (

                    <DailyTimetablesOfADayUi
                        key={index}
                        COLORS={COLORS}
                        dailyTimetables={e}
                        timetablesType={timetables.type}
                        pressable={editable}
                        setDailyTimetables={(dailyTimetable) => { setDailyTimetablesOfADay(dailyTimetable) }}
                        disabled={hasTemporaryTime}
                        textColor={textColor}
                        TEXT_STYLES={TEXT_STYLES}
                    />

                )
            })
            }


            {/* Special time */}
            {hasTemporaryTime && !editable &&
                <View style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    height: 60
                }}>

                    <ExclamationMarkTriangleSymbol COLORS={COLORS} color={COLORS.red} size={22} />

                    <Text style={[TEXT_STYLES.calloutMedium, {
                        fontSize: 16,
                        color: COLORS.red,
                        marginLeft: 7
                    }]}
                    >{getTemporaryTimeDescriptiveText(timetables.temporary_time, timetables.type)}</Text>
                </View>
            }
        </View>
    )
}



interface DailyTimetablesOfADayUiInterface {
    dailyTimetables: DailyTimetable[]
    timetablesType: TimetablesType
    pressable: boolean
    setDailyTimetables: any
    disabled: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    textColor?: string
}
/**
 * Displays the day and its hours or special time. 
 * e.g. : Monday           08H00 AM - 03H00 PM
 * e.g. : Monday                  Open all day 
 */
export function DailyTimetablesOfADayUi({ dailyTimetables, timetablesType, pressable, setDailyTimetables, disabled, COLORS, TEXT_STYLES, textColor = COLORS.black }: DailyTimetablesOfADayUiInterface) {
    return (
        <Pressable
            disabled={!pressable}
            onPress={() => { setDailyTimetables(dailyTimetables) }}
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                paddingLeft: 20,
                paddingRight: 20,
                height: 60,
            }}>


            <Text style={[TEXT_STYLES.calloutMedium, { color: textColor, textAlign: "left" }]}
            >{getDayName(dailyTimetables[0]?.day ?? 0)}</Text>


            <View
                style={{
                    flex: 1,
                    paddingLeft: 20,
                    paddingRight: pressable ? 20 : 0,
                    alignItems: 'flex-end'
                }}>
                <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                    style={[TEXT_STYLES.calloutMedium, { color: textColor, opacity: disabled ? 0.25 : 1, textAlign: "right" }]}
                >{dailyTimetables.map(e => { return getDailyTimetableDescription(e, timetablesType) }).join(", ")}</Text>
            </View>



            {pressable && <ChevronSymbol />}



        </Pressable>

    )
}


