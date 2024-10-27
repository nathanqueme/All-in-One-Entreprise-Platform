//
//  TimetablesEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SectionAppearance from '../../components/ui/SectionAppearance'
import RedError from '../../components/ui/RedError'
import ToggleUI from '../../components/ui/ToggleUI'
import DailyTimetableEditor from './DailyTimetableEditor'
import localization from '../../utils/localizations'
import Divider from '../../components/ui/Divider'
import { StatusBar, Modal, View, ScrollView, Keyboard, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { InformationType, TimetablesType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DailyTimetable, Page, Timetables, TimetablesObj } from '../../Data'
import { DailyTimetablesList, getTimetablesTypeDescriptiveText } from '../../components/ui/TimetablesRelated'
import { SimpleCenteredButton } from '../../components/Buttons'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { generateDefaultDailyTimetables } from '../../components/functions'
import { updateAttribute } from '../../components/AttributeEditingFunctions'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, UiStatesInterface } from '../../state/slices/uiStatesSlice'
import { EmojiAlert } from '../../components/ui/AlertUi'
import TextSytlesProvider from '../../components/styles/TextStyles'



interface TimetableEditorInterface {
    show: boolean
    setShow: any
    originalTimetables: Timetables
    setTimetables: any
    displaySubjectField?: boolean
    hideTimetablesTypeToggle?: boolean
    updatesTimetables?: boolean
    page?: Page
    username?: string
}



// A modal to edit, delete and determine the type of timetables.
export default function TimetablesEditor({ show, setShow, originalTimetables, setTimetables, displaySubjectField = false, hideTimetablesTypeToggle = false, updatesTimetables = false, page, username }: TimetableEditorInterface) {


    // States 
    const [subject, setSubject] = useState("")
    const [isAvailabilityTimetables, setIsAvailabilityTimetables]: [boolean, any] = useState(false)
    const [timetablesType, setTimetablesType]: [TimetablesType, any] = useState('opening_hours')
    const [dailyTimetables, setDailyTimetables]: [DailyTimetable[], any] = useState([])
    // 
    const [editedInfoType, setEditedInfoType]: [InformationType | string, any] = useState('')
    const [error, setError]: [string, any] = useState('')
    //
    const [dailyTimetableEditor, setDailyTimetableEditor]: [boolean, any] = useState(false)
    const [selectedDailyTimetables, setSelectedDailyTimetables]: [DailyTimetable[], any] = useState()
    const [temporaryTime, setTemporaryTime]: [boolean, any] = useState(false)


    // Global data
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const timetables = TimetablesObj(timetablesType, dailyTimetables, displaySubjectField ? subject.trim() : undefined, temporaryTime ? "off" : undefined)
    let isUpdatingInfo = uiStates?.isUpdatingInfo ?? false
    let isNewTimetables = (originalTimetables?.type ?? "") === ""



    // Initialization
    useEffect(() => {

        if (!show) return
        setSubject(originalTimetables?.subject ?? '')
        // 
        let originalTimetablesType = originalTimetables?.type ?? 'opening_hours'
        setIsAvailabilityTimetables(originalTimetablesType !== 'opening_hours')
        // 
        switch (isNewTimetables) {
            case false: setDailyTimetables(originalTimetables.daily_timetables); break
            case true:
                // Generates timetables 
                setDailyTimetables(generateDefaultDailyTimetables()); break
        }
        setTemporaryTime((originalTimetables?.temporary_time ?? "") === "off")


        setError('')

    }, [show])



    // Clear error
    useEffect(() => {
        setError("")
    }, [editedInfoType])



    useEffect(() => {
        setTimetablesType(isAvailabilityTimetables ? 'availability_hours' as TimetablesType : 'opening_hours' as TimetablesType)
    }, [isAvailabilityTimetables])


    function closeViewAndResetSelectedInfoType() {
        setShow(false)
        dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: '' }))
    }





    async function handlePress(timetables: Timetables) {

        // Preparation
        setError('')
        Keyboard.dismiss()


        // Updates or launch update
        switch (updatesTimetables) {
            case false:
                setTimetables(timetables)
                setShow(false)
                break

            case true:

                try {
                    await updateAttribute(dispatch, page, 'timetables', timetables, username, uiStates.jwtTokenWasRefreshed)
                    closeViewAndResetSelectedInfoType()
                } catch (error) {
                    alert(error)
                    dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                }
                break

        }
    }



    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={show}
            onRequestClose={() => { closeViewAndResetSelectedInfoType() }}
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
                        headerText={localization.timetables}
                        onPress={async () => { handlePress(timetables) }}
                        editedInfoType={editedInfoType as InformationType}
                        setEditedInfoType={setEditedInfoType}
                        buttonType={'doneText'}
                        displayOkButtonWhenInfoEdited={true}
                        isLoading={isUpdatingInfo}
                        hideCancelButtonWhenLoading={false}
                        condition={displaySubjectField ? subject !== "" : true}
                    />




                    <ScrollView
                        style={{ backgroundColor: COLORS.whiteGray }}
                        keyboardDismissMode={'on-drag'}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <View style={{ marginVertical: 40, paddingBottom: insets.bottom }}>


                            {/* Description */}
                            {displaySubjectField &&
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.subject_of_timetables} >
                                    <InfoInput
                                        text={subject}
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        setText={(text) => { setError(""); setSubject(text) }}
                                        style={'with_name'}
                                        autoCapitalize={'sentences'}
                                        infoType={'subject'}
                                        editedInfoType={editedInfoType as InformationType}
                                        setEditedInfoType={setEditedInfoType}
                                        doneReturnKey={false}
                                        onSubmitEditing={() => { }}
                                    />
                                </SectionAppearance>
                            }




                            {/* Error */}
                            {(error !== "") &&
                                <RedError
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    error={error}
                                    marginTop={20}
                                    marginH={20}
                                    alignItems={'flex-start'}
                                    textAlign={'left'}
                                />
                            }



                            {/* Timetables */}
                            <View style={{ paddingTop: displaySubjectField ? 35 : 0 }}>
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={getTimetablesTypeDescriptiveText(timetables.type)} children={
                                    <DailyTimetablesList
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        timetables={timetables}
                                        editable={true}
                                        setDailyTimetablesOfThatDay={(dailyTimetables) => {
                                            setDailyTimetableEditor(true)
                                            setSelectedDailyTimetables(dailyTimetables)
                                        }}
                                    />
                                } />
                            </View>






                            {/* Options (type + timetables issues) */}
                            <View style={{ paddingTop: 35 }}>
                                <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.options} children={
                                    <View>
                                        {!hideTimetablesTypeToggle &&
                                            <View>
                                                <ToggleUI
                                                    COLORS={COLORS}
                                                    TEXT_STYLES={TEXT_STYLES}
                                                    title={localization.determines_timetables_of_a_service_or_an_activity}
                                                    description={localization.availability_hours_explanation}
                                                    value={isAvailabilityTimetables}
                                                    onSetValue={setIsAvailabilityTimetables}
                                                />
                                                <Divider COLORS={COLORS} marginLeft={20} />
                                            </View>
                                        }



                                        <ToggleUI
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            title={isAvailabilityTimetables ? localization.temporarily_not_available : localization.temporarily_closed}
                                            description={isAvailabilityTimetables ? localization.temporarily_not_available_explanation : localization.temporarily_closed_explanation}
                                            value={temporaryTime}
                                            onSetValue={setTemporaryTime}
                                        />
                                    </View>
                                } />
                            </View>





                            {/* Delete button */}
                            {!isNewTimetables &&
                                <SimpleCenteredButton
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    text={localization.delete_timetables}
                                    onPress={() => {
                                        handlePress(undefined)
                                    }}
                                    destructiveColor={true}
                                    marginVertical={40}
                                />
                            }








                        </View>
                    </ScrollView>


                </SafeAreaView>


                {/* Modals */}
                <DailyTimetableEditor
                    show={dailyTimetableEditor}
                    setShow={setDailyTimetableEditor}
                    originalDailyTimetables={selectedDailyTimetables}
                    setDailyTimetables={(dailyTimetables) => { setDailyTimetables(dailyTimetables) }}
                    timetables={timetables}
                />
                <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />


            </SafeAreaProvider>

        </Modal>

    )
}


