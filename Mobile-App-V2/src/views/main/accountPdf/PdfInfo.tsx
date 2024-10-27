//
//  PdfInfo.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useCallback, useEffect } from 'react'
import getColors from './../../../assets/Colors'
import SectionAppearance from '../../../components/ui/SectionAppearance'
import TextSytlesProvider from '../../../components/styles/TextStyles'
import DocumentPicker, { types } from 'react-native-document-picker'
import TimetablesEditor from '../../contentEditors/TimetablesEditor'
import Divider from '../../../components/ui/Divider'
import localization from '../../../utils/localizations'
import { StatusBar, Text, View, ScrollView, Alert } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { EditablePageHeader } from '../../../components/Headers'
import { FileImporterButton } from '../../../components/Buttons'
import { Page, PhoneNumber, Profile, Timetables } from '../../../Data'
import { InformationType, ProfileButtonType } from '../../../Types'
import { SimpleCenteredButton } from '../../../components/Buttons'
import { DailyTimetablesList, getTimetablesDescriptiveText } from '../../../components/ui/TimetablesRelated'
import { BottomSheet } from '../../../components/BottomSheetRelated'
import { InfoWithSymbolUI } from '../../../components/ui/InfoDisplay'
import { arrayEquals, getFileName, getPhoneNumberDescription, phoneNumberWasChangedChecker } from '../../../components/functions'
import { getErrorDescription } from '../../../components/AlertsAndErrors'
import { updateProfile } from '../../../aws/dynamodb'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../../aws/cognito'
import { deleteContent, putContent } from '../../../aws/s3'


// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../../state/slices/uiStatesSlice'
import { selectPagesProfiles, updateProfileValue } from '../../../state/slices/profilesSlice'
import { selectPagesAccountsMainData } from '../../../state/slices/accountsMainDataSlice'
import { ScreenViewTracker } from '../../../analytics'
import { InfoInputButton } from '../../../components/ui/ForContentEditors'
import PhoneNumberEditor from '../../contentEditors/PhoneNumberEditor'



/**
 * A view to choose a category type and define its custom name.
*/
export default function PdfInfo({ navigation, route }) {

    // States 
    const [originalHasAPdf, setOriginalHasAPdf] = useState<boolean>(false)
    const [originalMenuTimetables, setOriginalMenuTimetables] = useState<Timetables[]>([])
    const [originalMenuPhoneNumber, setOriginalMenuPhoneNumber] = useState<PhoneNumber | undefined>()
    const [hasAPdf, setHasAPdf] = useState<boolean>(false)
    const [pdfUri, setPdfUri] = useState<string>("")
    const [menuTimetables, setMenuTimetables] = useState<Timetables[]>([])
    const [menuPhoneNumber, setMenuPhoneNumber] = useState<PhoneNumber | undefined>()
    // 
    const [pdfWasChanged, setPdfWasChanged] = useState<boolean>(false)
    const [bottomSheet, setBottomSheet] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // 
    const [phoneNumberEditor, setPhoneNumberEditor] = useState(false)
    const [timetablesEditor, setTimetablesEditor] = useState(false)
    const [selectedTimetables, setSelectedTimetables] = useState<Timetables>(undefined)


    // Navigation values
    const { page, isMenuViewer, editingMode } = route.params
    const { page_number, account_id, short_id } = page as Page


    // Global data
    const uiStates = useSelector(selectUiStates)
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page_number })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page_number })
    const dispatch = useDispatch()


    // Values
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let isUserAccount = (account_id === uiStates.account_id && account_id !== "")
    //
    let a = menuTimetables.flatMap(e => { return e.type + e.daily_timetables.flatMap(e => e.end_time + e.special_time + e.start_time) + e.subject })
    let b = originalMenuTimetables.flatMap(e => { return e.type + e.daily_timetables.flatMap(e => e.end_time + e.special_time + e.start_time) + e.subject })
    let menuTimetablesWereChanged = !arrayEquals(a, b)
    let menuPhoneNumberWasChanged = phoneNumberWasChangedChecker(originalMenuPhoneNumber, menuPhoneNumber)
    let metadataWasChanged =
        pdfWasChanged ||
        menuTimetablesWereChanged ||
        menuPhoneNumberWasChanged



    const handlePdfSelection = useCallback(async () => {
        try {
            const response = await DocumentPicker.pick({
                presentationStyle: 'pageSheet', type: [types.pdf]
            })

            let sizeInBytes = response[0].size
            let sizeInMegaBytes = Number((sizeInBytes / 1000000).toFixed(1))

            if (sizeInMegaBytes > 2) {
                Alert.alert(
                    localization.pdf_size_error_title,
                    localization.pdf_size_error_message,
                )


            } else {
                setPdfUri(response[0].uri)
                setHasAPdf(true)
                setPdfWasChanged(true)
            }


        } catch (err) {
            console.warn(err)
        }
    }, [])




    // Initialization
    useEffect(() => {

        // Shallow copy 
        let oHasAPdf = (pageProfile?.profile.additional_resources ?? []).includes(isMenuViewer ? "menu" : "map")

        setOriginalHasAPdf(oHasAPdf)
        setHasAPdf(oHasAPdf)

        // Shallow copy 
        if (isMenuViewer) {
            let oMenuTimetables = pageProfile?.profile.menu_timetables ?? []
            let oPhoneNumber = pageProfile?.profile.menu_phone_number
            setOriginalMenuTimetables([...oMenuTimetables])
            setOriginalMenuPhoneNumber(oPhoneNumber)

            setMenuTimetables(oMenuTimetables)
            setMenuPhoneNumber(oPhoneNumber)
        }

    }, [])


    /** Process steps : 
     * - 1 - Upload/delate pdf file                         (if needed : pdf uploaded for first time or updated)
     * - 2 - Update metadata                                (if needed : // or // )
     *   - 2.1 : USE or DON'T USE pdf
     *   - 2.2 : TIMETABLES
     *   - 2.3 : PHONE NUMBER
     * - 3 - Update UI
    */
    let updatedAdditionalResources: ProfileButtonType[] = []
    async function publishMenuAndItsInformation(deleteAction: boolean) {

        // Preparation
        setIsLoading(true)
        let didNotHadAPdf = hasAPdf && !originalHasAPdf


        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (uiStates.jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }


        // 1
        if (pdfWasChanged || deleteAction) {


            let blob: Blob = undefined
            if (!deleteAction) {
                try {
                    let response = await fetch(pdfUri)
                    blob = await response.blob()
                } catch (error) {
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }
            }



            try {

                let file_name = getFileName("pdf", short_id, "", isMenuViewer)
                deleteAction ?
                    await deleteContent(jwtToken, "anyid-eu-west-1", file_name)
                    :
                    await putContent(jwtToken, "anyid-eu-west-1", file_name, blob, isMenuViewer ? "pdf_menus" : "pdf_map", "application/pdf")

            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }

            console.log("\nStep 1.1 done")

        } else console.log("\nStep 1.1 not needed")


        // 2.1 (USE (OR NOT) PDF)
        if (didNotHadAPdf || deleteAction) {

            updatedAdditionalResources = pageProfile?.profile.additional_resources ?? []

            if (deleteAction) {
                updatedAdditionalResources = updatedAdditionalResources.filter(e => e !== (isMenuViewer ? "menu" : "map"))
            } else {
                updatedAdditionalResources = [...updatedAdditionalResources, (isMenuViewer ? "menu" : "map")]
            }

            try {
                await updateProfile(account_id, "additional_resources", updatedAdditionalResources, jwtToken)
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }

            console.log("Step 2.1 done")
        } else console.log("Step 2.1 not needed")


        // 2.2 (TIMETABLES)
        let updatedTimetables: Timetables[]
        if (isMenuViewer && (menuTimetablesWereChanged || deleteAction)) {

            updatedTimetables = deleteAction ? [] : menuTimetables ?? []

            try {
                await updateProfile(account_id, "menu_timetables", updatedTimetables, jwtToken)
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
            console.log("Step 2.2 done")

        } else console.log("Step 2.2 not needed")


        // 2.3 (PHONE NUMBER)
        let updatedMenuPhoneNumber: PhoneNumber | undefined
        if (isMenuViewer && (menuPhoneNumberWasChanged || deleteAction)) {

            updatedMenuPhoneNumber = deleteAction ? null : menuPhoneNumber ?? null

            try {
                await updateProfile(account_id, "menu_phone_number", updatedMenuPhoneNumber, jwtToken)
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
            console.log("Step 2.3 done")

        } else console.log("Step 2.3 not needed")


        // 3 (UI)
        if (didNotHadAPdf || deleteAction) {
            const payload = { page_number: page_number, attribute: "additional_resources" as keyof Profile, newValue: updatedAdditionalResources }
            dispatch(updateProfileValue(payload))
        }
        if (updatedTimetables !== undefined) {
            const timetablesPayload = { page_number: page_number, attribute: "menu_timetables" as keyof Profile, newValue: updatedTimetables }
            dispatch(updateProfileValue(timetablesPayload))
        }
        if (updatedMenuPhoneNumber !== undefined) {
            const phoneNumberPayload = { page_number: page_number, attribute: "menu_phone_number" as keyof Profile, newValue: updatedMenuPhoneNumber }
            dispatch(updateProfileValue(phoneNumberPayload))
        }

        let payload: updateUiStateValuePayload = { attribute: "refreshPdfPage", value: new Date().toISOString() }
        setTimeout(() => {
            dispatch(updateUiStateValue(payload))
        }, 500)
        console.log("Step 3 done")


        // Reset
        setIsLoading(false)
        navigation.goBack()

    }



    // UI
    function getSectionText() {
        if (editingMode) {
            if (isMenuViewer) {
                return localization.menu_pdf_and_timetables
            } else {
                return localization.map_pdf
            }
        } else {
            return localization.timetables_of_menu
        }
    }
    const timetablesList =
        <View>
            {menuTimetables.map((e, index) => {
                return (
                    <InfoWithSymbolUI
                        key={index}
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        infoType={'timetables' as InformationType}
                        infoValue={e}
                        displayInBlue={false}
                        displayChevron={true}
                        pressable={true}
                        setSelectedInfoValue={() => {

                            if (editingMode) {
                                setSelectedTimetables(e)
                                setTimetablesEditor(true)
                            } else {
                                setSelectedTimetables(e)
                                setBottomSheet(true)
                            }

                        }}
                        setSelectedInfoType={() => { }}
                        blackSchemeAppearance
                        paddingHorizontal={20}
                    />
                )
            })}
        </View>



    return (
        <SafeAreaProvider>
            {!editingMode &&
                <ScreenViewTracker screen_name={"pdf_info"} />
            }
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgDarkGray }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={"light-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <EditablePageHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    onPress={async () => {

                        await publishMenuAndItsInformation(false)

                    }}
                    editingMode={editingMode}
                    isUserAccount={isUserAccount}
                    accountMainData={pageAccountMainData?.account_main_data}
                    description={isMenuViewer ? localization.menu : localization.map}
                    withCancelButton={true}
                    closeButtonType={"xmark"}
                    isLoading={isLoading}
                    condition={metadataWasChanged}
                    hideEditButtonWhenNotEditing={!editingMode}
                    blackSchemeAppearance
                />


                <ScrollView
                    style={{ backgroundColor: COLORS.whiteGrayBlackScheme }}
                    keyboardDismissMode={'on-drag'}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={{ marginTop: editingMode ? 0 : 40, paddingBottom: insets.bottom + 40 }}>


                        {editingMode ?
                            <View style={{ backgroundColor: COLORS.bgDarkGray, marginTop: -0.5 }}>
                                <Divider COLORS={COLORS} />

                                {/* Pdf uploader */}
                                <View
                                    pointerEvents={editingMode ? "auto" : "none"}
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingTop: editingMode ? 35 + 20 : 0,
                                        paddingBottom: editingMode ? 35 : 0
                                    }}>


                                    {editingMode &&
                                        <FileImporterButton
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            uri={''}
                                            onPress={handlePdfSelection}
                                            contentType={hasAPdf ? "pdf" : "any"}
                                            backgroundColor={COLORS.bgDarkGray}
                                        />
                                    }


                                    {editingMode &&
                                        <Text style={[
                                            TEXT_STYLES.gray13Text, {
                                                paddingHorizontal: 70,
                                                paddingTop: 10,
                                                textAlign: "center"
                                            }]}>{(hasAPdf ?
                                                localization.press_to_switch_pdf
                                                :
                                                localization.press_to_import_pdf
                                            )}</Text>

                                    }

                                </View>

                                <Text style={[TEXT_STYLES.calloutMedium, { paddingHorizontal: 20, paddingBottom: 12, color: "white" }]}>{localization.options}</Text>

                                <Divider COLORS={COLORS} />

                                {isMenuViewer &&
                                    <>
                                        <Text style={[TEXT_STYLES.gray12Text, { marginVertical: 8, marginHorizontal: 20 }]}>{localization.add_phone_number_to_menu}</Text>

                                        <InfoInputButton
                                            infoType={'phoneNumber'}
                                            TEXT_STYLES={TEXT_STYLES}
                                            COLORS={COLORS}
                                            infoValue={menuPhoneNumber ? getPhoneNumberDescription(menuPhoneNumber) : ""}
                                            onPress={() => { setPhoneNumberEditor(true) }}
                                        />

                                        <Text style={[TEXT_STYLES.gray12Text, { marginVertical: 8, marginHorizontal: 20 }]}>{localization.add_timetables_to_menu}</Text>

                                        {timetablesList}

                                        <InfoInputButton
                                            infoType={'timetables'}
                                            TEXT_STYLES={TEXT_STYLES}
                                            COLORS={COLORS}
                                            infoValue={''}
                                            onPress={() => { setTimetablesEditor(true); setSelectedTimetables(undefined) }}
                                        />
                                    </>
                                }
                                <Divider COLORS={COLORS} />
                            </View>
                            :

                            <SectionAppearance
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                text={getSectionText()}
                            >
                                {timetablesList}
                            </SectionAppearance>
                        }




                        {/* Delete button */}
                        {(editingMode && originalHasAPdf) &&
                            <View style={{ paddingTop: 40 }} >
                                <Divider COLORS={COLORS} />
                                <SimpleCenteredButton
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    onPress={() => {
                                        isMenuViewer ?
                                            Alert.alert(
                                                localization.sure_want_remove_menu,
                                                localization.removing_menu_consequences,
                                                [
                                                    {
                                                        text: localization.cancel,
                                                        style: "cancel"
                                                    },
                                                    { text: localization.delete, style: "destructive", onPress: async () => { await publishMenuAndItsInformation(true) } }
                                                ])
                                            :
                                            Alert.alert(
                                                localization.sure_want_remove_map,
                                                localization.removing_map_consequences,
                                                [
                                                    {
                                                        text: localization.cancel,
                                                        style: "cancel"
                                                    },
                                                    { text: localization.delete, style: "destructive", onPress: async () => { await publishMenuAndItsInformation(true) } }
                                                ])

                                    }}
                                    text={isMenuViewer ? localization.remove_all : localization.remove}
                                    marginVertical={0}
                                    hideTopDivider={true}
                                    hideBottomDivider={true}
                                    destructiveColor={true}
                                    backgroundColor={COLORS.bgDarkGray}
                                />
                                <Divider COLORS={COLORS} />
                            </View>
                        }





                    </View>
                </ScrollView>



                {/* Modals */}
                {isMenuViewer &&
                    <TimetablesEditor
                        show={timetablesEditor}
                        setShow={setTimetablesEditor}
                        originalTimetables={selectedTimetables}
                        setTimetables={(e: Timetables) => {

                            let timetablesIndex = menuTimetables.findIndex(e => { return e === selectedTimetables })

                            // Delete 
                            if (e === undefined) {

                                let updatedMenuTimetables = [...menuTimetables]
                                updatedMenuTimetables.splice(timetablesIndex, 1)
                                setMenuTimetables(updatedMenuTimetables)

                            }
                            // Update
                            else if (selectedTimetables) {

                                let updatedMenuTimetables = [...menuTimetables]
                                updatedMenuTimetables[timetablesIndex] = e
                                setMenuTimetables(updatedMenuTimetables)


                            }
                            // Append 
                            else {
                                setMenuTimetables((previousValues: Timetables[]) => { return [...previousValues, e] })
                            }

                        }}
                        displaySubjectField={true}
                    />
                }
                <PhoneNumberEditor
                    show={phoneNumberEditor}
                    setShow={setPhoneNumberEditor}
                    originalPhoneNumber={menuPhoneNumber ?? pageProfile.profile.phone_number}
                    setPhoneNumber={(phoneNumber) => {
                        setMenuPhoneNumber(phoneNumber)
                    }}
                    page={page}
                    phoneNumberCanBeDeleted
                    username={pageAccountMainData.account_main_data.username}
                />


            </SafeAreaView>



            <BottomSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                headerText={(selectedTimetables?.subject ?? "") !== "" ? selectedTimetables?.subject ?? "" : getTimetablesDescriptiveText(selectedTimetables?.type ?? 'opening_hours', selectedTimetables?.subject ?? "")}
                show={bottomSheet}
                setShow={setBottomSheet}
                bottom_inset={insets.bottom}
                content_height={60 * 7 + ((selectedTimetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                backgroundColor={COLORS.bgGray}
                textColor={"white"}
                content={
                    selectedTimetables !== undefined ?
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <DailyTimetablesList
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                timetables={selectedTimetables}
                                editable={false}
                                setDailyTimetablesOfThatDay={() => { }}
                                backgroundColor={COLORS.bgGray}
                                textColor={"white"}
                            />
                        </View>
                        :
                        <View style={{ height: 60 * 7 }} />
                } />


        </SafeAreaProvider >
    )
}


