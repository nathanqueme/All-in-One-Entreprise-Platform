//
//  DailyTimetableEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SectionAppearance from '../../components/ui/SectionAppearance'
import ToggleUI from '../../components/ui/ToggleUI'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import TextSytlesProvider from '../../components/styles/TextStyles'
import { StatusBar, Modal, Text, View, ScrollView, LayoutAnimation, TouchableOpacity, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ClassicHeader } from '../../components/Headers'
import { dateToTime, dateWithoutDST, getDayName, isDST, timeToDate } from '../../components/functions'
import { TimePickerField } from '../../components/ui/ForContentEditors'
import { DailyTimetable, DailyTimetableObj, Timetables } from '../../Data'
import { SpecialTimeType } from '../../Types'
import { SimpleCenteredButton } from '../../components/Buttons'
import { actionSheetAnimation } from '../../components/animations'



interface DailyTimetableEditorInterface {
    show: boolean
    setShow: any
    originalDailyTimetables: DailyTimetable[]
    timetables: Timetables
    setDailyTimetables: any
    isPdfTimetable?: boolean
}
/** 
 * A view to determine the time start, time end and special time of a timetable. 
*/
export default function DailyTimetableEditor({ show, setShow, originalDailyTimetables, timetables, setDailyTimetables, isPdfTimetable = false }: DailyTimetableEditorInterface) {

    // States 
    const determinesAvailability = timetables.type !== 'opening_hours'
    const [editedDailyTimetables, setEditedDailyTimetables]: [DailyTimetable[], any] = useState([])
    const [allDay, setAllDay]: [boolean, any] = useState(false)
    const [neverThatDay, setNeverThatDay]: [boolean, any] = useState(false)



    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS) 
    let day = (originalDailyTimetables?.length ?? 0) === 0 ? 0 : originalDailyTimetables[0].day
    // let isNewDailyTimetable = false --> is never a new daily timetable
    // let metadataFilled = true --> metadata is always filled 
    // let metadataWasChanged = true  




    // Initialization
    useEffect(() => {

        if (!show) return

        setEditedDailyTimetables(originalDailyTimetables)
        let special_time = originalDailyTimetables[0]?.special_time ?? ""
        setAllDay(special_time === "all_day")
        setNeverThatDay(special_time === "never_that_day")


    }, [show])


    // Usage : Makes the picker work properly when the DST i active. (During summer)
    // Solved issue description : Whitout this when the user leaves it's finger after changing the time (during summer) it will use it's selected value but by removing one hour in front of user's eyes.
    // To understand solved issue : Remove the dateWithoutDST() and use this function : alert(`${dateToTime(date)} \n\n${date.toISOString()}`) to understand
    function getSelectedPickerTime(date: Date) {
        if (isDST(date)) {
            let time = dateToTime(date)
            let hours = Number(time.split(":")[0] ?? "0")
            let minutes = Number(time.split(":")[1] ?? "0")
            return `${hours === 24 ? 0 : hours + 1}:${minutes}`
        } else { return dateToTime(date) }
    }



    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={show}
            onRequestClose={() => {
                setShow(false)
            }}
        >


            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />


                    <ClassicHeader
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        onClose={() => { setShow(false) }}
                        closeButtonType={'cancelText'}
                        headerText={getDayName(day)}
                        condition={true}
                        onPress={() => {

                            // Values 
                            let specialTime: SpecialTimeType = editedDailyTimetables.length > 1 ? "" : (allDay ? "all_day" : (neverThatDay ? "never_that_day" : "" as any))
                            let dailyTimetables = [...editedDailyTimetables.flatMap(e => { return DailyTimetableObj(e.day, e.start_time, e.end_time, specialTime) })]



                            // Remove all old values for that day 
                            let oldDailyTimetables = timetables.daily_timetables.filter(e => { return e.day !== day })
                            let newDailyTimetables = oldDailyTimetables.concat(dailyTimetables)


                            // Updates 
                            setDailyTimetables(newDailyTimetables)
                            setShow(false)


                        }}
                        buttonType={'doneText'}
                    />







                    <ScrollView
                        style={{ backgroundColor: COLORS.whiteGray }}
                        keyboardDismissMode={'on-drag'}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        {/* Start time + End time */}
                        {editedDailyTimetables.map((e, index) => {
                            return (
                                <View key={`interval-${index}`} style={{ paddingTop: 40 }
                                }>
                                    <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={!determinesAvailability ? localization.opening_hours : localization.hours_of_availability} children={
                                        <View style={{ opacity: editedDailyTimetables.length === 1 && (allDay || neverThatDay) ? 0.5 : 1 }}>
                                            <TimePickerField
                                                key={`${index}-1`}
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                text={!determinesAvailability ? localization.opened_from : localization.available_from}
                                                date={dateWithoutDST(timeToDate(e.start_time))} // DST avoidance
                                                setDate={(date: Date) => {

                                                    let i = editedDailyTimetables[index]
                                                    editedDailyTimetables[index] = DailyTimetableObj(i.day, getSelectedPickerTime(date), i.end_time, i.special_time)
                                                    setEditedDailyTimetables([...editedDailyTimetables])

                                                }}
                                            />

                                            <View style={{ paddingLeft: 20 }} >
                                                <Divider COLORS={COLORS} />
                                            </View>

                                            <TimePickerField
                                                key={`${index}-2`}
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                text={!determinesAvailability ? localization.closes_at : localization.available_up_to}
                                                date={dateWithoutDST(timeToDate(e.end_time))} // DST avoidance
                                                setDate={(date: Date) => {

                                                    let i = editedDailyTimetables[index]
                                                    editedDailyTimetables[index] = DailyTimetableObj(i.day, i.start_time, getSelectedPickerTime(date), i.special_time)
                                                    setEditedDailyTimetables([...editedDailyTimetables])

                                                }}
                                            />
                                        </View>
                                    } />
                                    {index !== 0 &&
                                        <TouchableOpacity onPress={() => {
                                            LayoutAnimation.configureNext(actionSheetAnimation)
                                            let updatedDailyTimetables = [...editedDailyTimetables]
                                            updatedDailyTimetables.splice(index, 1)
                                            setEditedDailyTimetables(updatedDailyTimetables)
                                        }}>
                                            <Text style={[{
                                                fontSize: 13,
                                                color: COLORS.red,
                                                paddingVertical: 10,
                                                paddingHorizontal: 20,
                                                alignSelf: "flex-end"
                                            }]}>{localization.remove}</Text>
                                        </TouchableOpacity>
                                    }
                                    {index === editedDailyTimetables.length - 1 &&
                                        <SimpleCenteredButton
                                            text={localization.add_interval}
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            onPress={() => {
                                                LayoutAnimation.configureNext(actionSheetAnimation)

                                                // From generateDefaultDailyTimetables()
                                                let date = new Date()
                                                let ten_pm = date; ten_pm.setHours(isDST(date) ? 23 : 22)
                                                let ten_pm_hour = ten_pm.getUTCHours() // will be different in France and in Australia but will end up displaying 06H00 in both cases
                                                // 
                                                let end_time_string = `${ten_pm_hour < 10 ? `0${ten_pm_hour}` : ten_pm_hour}:00`
                                                let updatedDailyTimetables = [...editedDailyTimetables, DailyTimetableObj(day, editedDailyTimetables[editedDailyTimetables.length - 1].end_time, end_time_string, '')]
                                                setEditedDailyTimetables(updatedDailyTimetables)
                                            }}
                                            marginVertical={40}
                                        />
                                    }
                                </View>
                            )
                        })}









                        {/* Special times */}
                        {editedDailyTimetables.length <= 1 &&
                            < View style={{ marginTop: 35 }}>
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={!determinesAvailability ? localization.special_opening_time : localization.special_availability_time} children={
                                    <View style={{ backgroundColor: COLORS.white }} >

                                        <ToggleUI
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            title={!determinesAvailability ? localization.open_all_day : localization.available_all_day}
                                            value={allDay}
                                            onSetValue={() => {
                                                setAllDay(!allDay)
                                                if (neverThatDay) { setNeverThatDay(false) }
                                            }}
                                        />


                                        <Divider COLORS={COLORS} marginLeft={20} />


                                        <ToggleUI
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            title={!determinesAvailability ? localization.close_all_day : localization.not_available_that_day}
                                            value={neverThatDay}
                                            onSetValue={() => {
                                                setNeverThatDay(!neverThatDay)
                                                if (allDay) { setAllDay(false) }
                                            }}
                                        />

                                    </View>
                                } />
                            </View>
                        }
                    </ScrollView>





                </SafeAreaView>
            </SafeAreaProvider >

        </Modal >
    )
}



