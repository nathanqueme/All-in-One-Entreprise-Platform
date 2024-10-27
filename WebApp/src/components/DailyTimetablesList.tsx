import React from "react"
import Colors from "../assets/Colors"
import TextStyles from "../styles/TextStyles"
import { DailyTimetable, Timetables } from "../Data"
import { getDailyTimetableDescription, getDayName, getTemporaryTimeDescriptiveText } from "./functions"
import { getDailyTimetablesOfEachDay } from "./TimetablesRelated"
import { ChevronRight, ExclamationMarkTriangleIcon } from "./Icons"
import { TimetablesType } from "../Types"




interface TimetablesListInterface {
    timetables: Timetables
    editable: boolean
    setDailyTimetablesOfThatDay: any
    backgroundColor?: string
    blackAppearance?: boolean
}
/**
 * Displays a list of daily timetables and the special time warning at the bottom if any.
*/
export function DailyTimetablesList({ timetables, editable, setDailyTimetablesOfThatDay: setDailyTimetablesOfADay, backgroundColor = Colors.whiteToGray2, blackAppearance = false }: TimetablesListInterface) {


    // Values
    let dailyTimetablesOfEachDay = getDailyTimetablesOfEachDay(timetables.daily_timetables)
    /** 
     * The use of the values 'firstDailyTimetables' and 'otherDailyTimetables' remove the gregorian logic by displaying the "Sunday" at the end of the list.
     * Without it : ["Sunday", "Monday", ..., "Saturday"]
     * With it : ["Monday", ..., "Saturday", "Sunday"]
     * 
     * So the day are in the order : [1, 2, 3, 4, 5, 6, 0]
    */
    let firstDayDailyTimetables = [dailyTimetablesOfEachDay?.slice().shift() ?? []]
    let otherDaysDailyTimetables = dailyTimetablesOfEachDay.slice(1)
    let orderedDailyTimetablesOfEachDay = otherDaysDailyTimetables.concat(firstDayDailyTimetables)
    let hasTemporaryTime = (timetables?.temporary_time ?? "") !== ""


    return (
        <div className='flex items-start justify-center' style={{ backgroundColor: backgroundColor, }}>
            <ul className='w-full'>
                {orderedDailyTimetablesOfEachDay.map((e, index) => {
                    return (
                        <DailyTimetablesOfADayUi
                            key={index}
                            dailyTimetables={e}
                            timetablesType={timetables.type}
                            pressable={editable}
                            setDailyTimetables={(dailyTimetable: DailyTimetable) => { setDailyTimetablesOfADay(dailyTimetable) }}
                            disabled={hasTemporaryTime}
                            blackAppearance={blackAppearance}
                        />

                    )
                })
                }
            </ul>

            {/* Special time */}
            {(hasTemporaryTime && !editable) &&
                <div className={`flex items-center justify-start w-full ${false ? "bg-red-50" : ""}`} style={{ paddingLeft: 20, paddingRight: 20, height: 60 }}>
                    <ExclamationMarkTriangleIcon color={Colors.red} fontSize={22} />

                    <p className='text-start' style={Object.assign({}, TextStyles.calloutMedium, {
                        color: Colors.red,
                        marginLeft: 7
                    })}
                    >{getTemporaryTimeDescriptiveText(timetables.temporary_time!, timetables.type)}</p>
                </div>
            }
        </div>
    )
}




interface DailyTimetablesOfADayUiInterface {
    dailyTimetables: DailyTimetable[]
    timetablesType: TimetablesType
    pressable: boolean
    setDailyTimetables: any
    disabled: boolean
    blackAppearance?: boolean
}
/**
 * Displays the day and its hours or special time. 
 * e.g. : Monday           08H00 AM - 03H00 PM
 * e.g. : Monday                  Open all day 
 */
export function DailyTimetablesOfADayUi({ dailyTimetables, timetablesType, pressable, setDailyTimetables, disabled, blackAppearance }: DailyTimetablesOfADayUiInterface) {

    // States
    const text_color = blackAppearance ? "white" : Colors.black

    return (
        <div className='flex items-center justify-between' style={{
            paddingLeft: 20,
            paddingRight: 20,
            height: 60,
        }}>
            <p className='text-start' style={Object.assign({}, TextStyles.calloutMedium, { color: text_color })}>{getDayName(dailyTimetables[0]?.day ?? 0)}</p>
            <div className='flex items-center justify-end' style={{ paddingLeft: 20 }}>
                <p className='text-end' style={Object.assign({}, TextStyles.calloutMedium, { color: text_color, opacity: disabled ? 0.25 : 1, paddingRight: pressable ? 16 : 0 })}>{dailyTimetables.map(e => { return getDailyTimetableDescription(e, timetablesType) }).join(", ")}</p>
                {/* Has 4 of padding */}
                {pressable && <ChevronRight />}
            </div>
        </div>
    )
}



