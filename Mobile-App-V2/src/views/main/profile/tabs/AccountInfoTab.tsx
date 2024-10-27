//
//  AccountInfoTab.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors, { ColorsInterface } from '../../../../assets/Colors'
import SectionAppearance from '../../../../components/ui/SectionAppearance'
import AddressEditor from '../../../contentEditors/AddressEditor'
import PhoneNumberEditor from '../../../contentEditors/PhoneNumberEditor'
import TimetablesEditor from '../../../contentEditors/TimetablesEditor'
import localization from '../../../../utils/localizations'
import MultiLanguageTextEditor from '../../../contentEditors/MultiLanguageTextEditor'
import { StatusBar, View, ScrollView, TouchableOpacity, Platform, LayoutAnimation, ActionSheetIOS, Dimensions, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { call, copyString, getAddressDescription, getAppleMapsAddressUrl, getGoogleMapsAddressUrl, getLocalizedTextText, getPhoneNumberDescription, openAddressInMaps, openLinkWithInAppWeb, shareAddress, writeEmail } from '../../../../components/functions'
import { EditablePageHeader } from '../../../../components/Headers'
import { EmptyInfoUi, InfoWithSymbolUI } from '../../../../components/ui/InfoDisplay'
import { LinkObj, Page } from '../../../../Data'
import { InformationType } from '../../../../Types'
import { DailyTimetablesList, getTimetablesTypeDescriptiveText } from '../../../../components/ui/TimetablesRelated'
import { BottomSheet } from '../../../../components/BottomSheetRelated'
import { TranslatableExpandableText } from '../../../../components/ui/ExpandableText'
import { ChevronSymbol } from '../../../../components/Symbols'
import { actionSheetAnimation } from '../../../../components/animations'
import { SlidingAlert } from '../../../../components/SlidingAlert'
import { ActionSheet } from '../../../../components/ui/ActionSheet'
import { ReloadPageButton } from '../../../../components/Buttons'
import { ProfileNotFoundUi } from '../../../../components/ui/ProfileNotFoundUi'
import { getLocalizedText, getLocalizedTexts } from '../../../../assets/LanguagesList'

// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, UiStatesInterface, updateUiStateValue } from '../../../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../../../state/slices/accountsMainDataSlice'
import { selectPagesProfiles } from '../../../../state/slices/profilesSlice'
import { loadProfilePage } from '../../../../state/slices/pagesSlice'
import { ScreenViewTracker } from '../../../../analytics'
import TextSytlesProvider, { TextStylesInterface } from '../../../../components/styles/TextStyles'



const screenWidth = Dimensions.get("screen").width



// A view to choose a category type and define its custom name.
export default function AccountInfoPage({ navigation, route }) {

    // States 
    const insets = useSafeAreaInsets()
    const [editingMode, setEditingMode] = useState(false)
    const [addressEditor, setAddressEditor] = useState(false)
    const [phoneNumberEditor, setPhoneNumberEditor] = useState(false)
    const [timetablesEditor, setTimetablesEditor] = useState(false)
    const [multiLanguageTexEditor, setMultiLanguageTexEditor] = useState(false)
    const [timetablesBottomSheet, setTimetablesBottomSheet] = useState(false)


    // Navigation values 
    const { page }: { page: Page } = route.params
    const { page_number, account_id } = page as Page


    // Global values
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page_number })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page_number })
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const { selectedInfoType, isUpdatingInfo, updatedAppearance } = uiStates
    let isUserAccount = account_id === uiStates.account_id && account_id !== ""



    let profileLoaded = (typeof pageProfile?.profile === 'object') ?? false



    // 
    let description = getLocalizedText(pageProfile?.profile?.description)
    let descriptionLocalization = getLocalizedTexts(pageProfile?.profile?.description_localization ?? {})
    let geolocation = pageAccountMainData?.account_main_data.geolocation
    let addressDescription = getAddressDescription(geolocation)
    let phoneNumber = pageProfile?.profile.phone_number
    let username = pageAccountMainData?.account_main_data.username ?? ''
    let timetables = pageProfile?.profile.timetables ?? undefined

    // 
    let hasTimetables = (timetables?.daily_timetables?.length ?? 0) > 0





    const addressActionSheetOptions = [localization.open_in_maps, localization.copy, localization.share, localization.cancel]
    const [addressActionSheet, setAddressActionSheet] = useState(false) // Android
    function openAddressActionSheet() {

        // if (Platform.OS !== 'ios') {
            LayoutAnimation.configureNext(actionSheetAnimation)
            setAddressActionSheet(true)
        // } else {
            /*ActionSheetIOS.showActionSheetWithOptions({
                options: addressActionSheetOptions,
                cancelButtonIndex: 3,
                title: getAddressDescription(geolocation)
                // destructiveButtonIndex: 0,
            }, buttonIndex => { addressActionSheetPress(buttonIndex) }) 
            */
        // }

    }
    function addressActionSheetPress(index) {
        switch (index) {
            case 0: openAddressInMaps(geolocation); break
            case 1:
                // Values 
                let addressUrl = Platform.OS === "ios" ? getAppleMapsAddressUrl(geolocation) : getGoogleMapsAddressUrl(geolocation)
                copyString(addressUrl, dispatch)
                break
            case 2: shareAddress(geolocation); break
            default: console.log("Out of range")
        }

    }





    // Shows content editors
    useEffect(() => {

        if (!editingMode) return
        switch (selectedInfoType as InformationType) {
            case 'description': setMultiLanguageTexEditor(true); break
            case 'phoneNumber': setPhoneNumberEditor(true); break
            case 'geolocation': setAddressEditor(true); break
            case 'timetables': setTimetablesEditor(true); break
            case '' as any: break
            default: navigation.navigate('InfoEditor', { page: page })
        }


    }, [selectedInfoType])


    // Reset
    useEffect(() => {

        if (!addressEditor && !phoneNumberEditor) {
            dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: '' }))
        }

    }, [addressEditor, phoneNumberEditor, editingMode, timetablesEditor])



    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"account_info"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={timetablesBottomSheet || is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <EditablePageHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    onPress={() => { setEditingMode(!editingMode) }}
                    editingMode={editingMode}
                    isUserAccount={isUserAccount}
                    accountMainData={pageAccountMainData?.account_main_data}
                />




                {profileLoaded &&
                    <AccountInfoUi
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        route={route}
                        openAddressActionSheet={openAddressActionSheet}
                        setTimetablesBottomSheet={setTimetablesBottomSheet}
                        editingMode={editingMode}
                        setMultiLanguageTexEditor={setMultiLanguageTexEditor}
                        pageFailedLoading={false}
                        setPageFailedLoading={() => { }}
                        profileNotFound={false}
                        isTab={false}
                    />
                }
            </SafeAreaView>






            {/* Modals */}
            <MultiLanguageTextEditor
                show={multiLanguageTexEditor}
                setShow={setMultiLanguageTexEditor}
                originalLocalizedText={description}
                originalTextLocalization={descriptionLocalization}
                updatesProfileDescription
                page={page}
                username={username}
            />
            <AddressEditor
                show={addressEditor}
                setShow={setAddressEditor}
                originalGeolocation={geolocation}
                setGeolocation={(addressAsGeolocation) => {
                    // Handled on the component itself
                }}
                updatesAddress={true}
                page={page}
                username={username}
                addressCanBeDeleted={false}
            />
            <PhoneNumberEditor
                show={phoneNumberEditor}
                setShow={setPhoneNumberEditor}
                originalPhoneNumber={phoneNumber}
                setPhoneNumber={(phoneNumber) => {
                    // Handled on the component itself
                }}
                updatesPhoneNumber={true}
                page={page}
                username={username}
            />
            <TimetablesEditor
                show={timetablesEditor}
                setShow={setTimetablesEditor}
                originalTimetables={timetables}
                hideTimetablesTypeToggle={true}
                setTimetables={(timetables) => {
                    // Handled on the component itself
                }}
                updatesTimetables={true}
                page={page}
                username={username}
            />






            <SlidingAlert
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                topInset={insets.top}
                bottomInset={insets.bottom}
                slidingAlertType={uiStates.slidingAlertType}
                resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                slideFromBottom={true}
            />




            <BottomSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                headerText={getTimetablesTypeDescriptiveText(timetables?.type ?? 'opening_hours')}
                show={timetablesBottomSheet}
                setShow={setTimetablesBottomSheet}
                bottom_inset={insets.bottom}
                content_height={60 * 7 + ((timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                content={
                    (hasTimetables) ?
                        <DailyTimetablesList
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            timetables={timetables}
                            editable={false}
                            setDailyTimetablesOfThatDay={() => { }}
                            backgroundColor={COLORS.whiteToGray}
                        />
                        :
                        null
                } />



            {/* Android */}
            <ActionSheet
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                description={addressDescription}
                show={addressActionSheet}
                setShow={setAddressActionSheet}
                options={addressActionSheetOptions}
                actionSheetPress={addressActionSheetPress}
            />




        </SafeAreaProvider>
    )
}





interface AccountInfoUiInterface {
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    route: any
    setTimetablesBottomSheet: (_: boolean) => any,
    openAddressActionSheet: () => void,
    // 
    editingMode?: boolean,
    setMultiLanguageTexEditor: (_: boolean) => any,
    pageFailedLoading: boolean,
    setPageFailedLoading: (_: boolean) => any,
    profileNotFound: boolean,
    isTab: boolean
}
// A view to choose a category type and define its custom name.
export const AccountInfoUi = ({
    COLORS,
    TEXT_STYLES,
    route,
    setTimetablesBottomSheet,
    openAddressActionSheet,
    // 
    editingMode = false,
    setMultiLanguageTexEditor,
    pageFailedLoading,
    setPageFailedLoading,
    profileNotFound,
    isTab
}: AccountInfoUiInterface) => {

    // States 
    const insets = useSafeAreaInsets()



    // Navigation values 
    const { page }: { page: Page } = route.params
    const { page_number, account_id } = page as Page
    const navigationUsername = route.params.username
    let doNotUseUsername = route.params?.doNotUseUsername ?? false


    // Global values
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page_number })
    const pageProfile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page_number })
    const uiStates = useSelector(selectUiStates)
    const dispatch = useDispatch()


    // Values 
    const { selectedInfoType, isUpdatingInfo, updatedAppearance } = uiStates
    let isUserAccount = account_id === uiStates.account_id && account_id !== ""



    let profileLoaded = (typeof pageProfile?.profile === 'object') ?? false


    // 
    let websiteLink = pageProfile?.profile?.links?.find((link) => { return link.name === "Website" }) ?? LinkObj('', '')

    // 
    let description = getLocalizedTextText(pageProfile?.profile?.description)
    let geolocation = pageAccountMainData?.account_main_data?.geolocation
    let addressDescription = getAddressDescription(geolocation)
    let phoneNumber = pageProfile?.profile?.phone_number
    let email = pageProfile?.profile?.email ?? ''
    let account_name = pageAccountMainData?.account_main_data?.account_name ?? ''
    let username = pageAccountMainData?.account_main_data?.username ?? ''
    let timetables = pageProfile?.profile?.timetables ?? undefined

    // 
    let hasDescription = description !== ""
    let hasAWebsite = (websiteLink?.url ?? "") !== ""
    let hasTimetables = (timetables?.daily_timetables?.length ?? 0) > 0
    let hasAnAddress = addressDescription !== ""
    let hasAnEmail = (email ?? "") !== ""
    let hasAPhoneNumber = (phoneNumber?.number ?? "") !== ""




    return (
        <ScrollView
            style={{ backgroundColor: COLORS.whiteToGray2, width: screenWidth }}
            keyboardDismissMode={'on-drag'}
            keyboardShouldPersistTaps={'handled'}
        >
            {profileLoaded &&
                <View style={{ paddingBottom: insets.bottom + 40 }}>
                    {/* Descrption */}
                    {(hasDescription || (isUserAccount && !isTab)) &&
                        <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.description} marginTop={20} children={
                            <TouchableOpacity
                                onPress={() => {
                                    setMultiLanguageTexEditor(true)
                                }}
                                disabled={!editingMode}
                            >
                                <View
                                    style={{
                                        alignItems: 'flex-start',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        backgroundColor: COLORS.whiteToGray2,
                                        paddingHorizontal: 20,
                                        paddingVertical: 12,
                                    }}>





                                    {/* Value */}
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: 'flex-start',
                                            alignSelf: 'flex-start',
                                            justifyContent: 'flex-start',
                                            paddingRight: 10
                                        }}>
                                        {hasDescription ?
                                            <TranslatableExpandableText
                                                COLORS={COLORS}
                                                description={pageProfile?.profile?.description}
                                                description_localization={pageProfile?.profile.description_localization}
                                                textType={'profile_description'}
                                                uniqueId={account_id}
                                                maximumLines={10}
                                                marginTop={4}
                                                fontSize={16}
                                                fontWeight={"500"}
                                            />
                                            :
                                            <EmptyInfoUi placeholder={localization.description} TEXT_STYLES={TEXT_STYLES} />
                                        }
                                    </View>



                                    {editingMode &&
                                        <ChevronSymbol />
                                    }



                                </View>
                            </TouchableOpacity>
                        } />
                    }




                    {/* Website + Opening hours + Address */}
                    <View style={{ paddingTop: 40 }}>
                        <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.essential_info} children={
                            <View>


                                {((isUserAccount && !isTab) || (hasAWebsite)) &&
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'website_link'}
                                        infoValue={websiteLink.url}
                                        displayInBlue={true}
                                        displayChevron={editingMode}
                                        displayNameInstead={true}
                                        pressable={editingMode || (hasAWebsite)}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false: openLinkWithInAppWeb(infoValue); break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: infoValue }))
                                                    break
                                            }
                                        }}
                                    />
                                }


                                {((isUserAccount && !isTab) || (hasTimetables)) &&
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'timetables' as InformationType}
                                        infoValue={timetables}
                                        displayInBlue={false}
                                        displayChevron={true}
                                        pressable={editingMode || hasTimetables}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case true: break // Done on AccountInfoPage 
                                                case false: setTimetablesBottomSheet(true)
                                                    break
                                            }
                                        }}
                                    />
                                }


                                {((isUserAccount && !isTab) || (hasAnAddress)) &&
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'geolocation'}
                                        infoValue={addressDescription}
                                        displayInBlue={false}
                                        displayChevron={true}
                                        pressable={editingMode || hasAnAddress}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false:
                                                    openAddressActionSheet()
                                                    break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: geolocation }))
                                                    break
                                            }
                                        }}
                                    />
                                }


                            </View>
                        } />
                    </View>



                    {/* Email + Phone number */}
                    <View style={{ paddingTop: 40 }}>
                        <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.contact} children={
                            <View>


                                {(hasAnEmail) &&
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'email'}
                                        infoValue={email}
                                        displayInBlue={false}
                                        displayChevron={true}
                                        pressable={true}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false:
                                                    writeEmail(email)
                                                    break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: infoValue }))
                                                    break
                                            }
                                        }}
                                    />
                                }


                                {((isUserAccount && !isTab) || (hasAPhoneNumber)) &&
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'phoneNumber'}
                                        infoValue={getPhoneNumberDescription(phoneNumber)}
                                        displayInBlue={false}
                                        displayChevron={true}
                                        pressable={true || hasAPhoneNumber}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false:
                                                    call(phoneNumber.number, phoneNumber.calling_code)
                                                    break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: infoValue }))
                                                    break
                                            }
                                        }}
                                    />
                                }


                            </View>
                        } />
                    </View>




                    {/* Username + name (only you see this) */}
                    {isUserAccount &&
                        <View style={{ paddingTop: 40 }}>
                            <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.info_on_the_place} children={
                                <View>
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'account_name'}
                                        infoValue={account_name}
                                        displayInBlue={false}
                                        displayChevron={editingMode}
                                        pressable={editingMode}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: infoValue }))
                                                    break
                                            }
                                        }}
                                    />
                                    <InfoWithSymbolUI
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        infoType={'username'}
                                        infoValue={username}
                                        displayChevron={editingMode}
                                        pressable={editingMode}
                                        setSelectedInfoType={(infoType) => {
                                            switch (editingMode) {
                                                case false:
                                                    break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoType' as keyof UiStatesInterface, value: infoType }))
                                                    break
                                            }
                                        }}
                                        setSelectedInfoValue={(infoValue) => {
                                            switch (editingMode) {
                                                case false: break
                                                case true:
                                                    dispatch(updateUiStateValue({ attribute: 'selectedInfoValue' as keyof UiStatesInterface, value: username }))
                                                    break
                                            }
                                        }}
                                    />
                                </View>
                            } />
                        </View>
                    }




                </View>
            }



            {/* Loading failure */}
            {pageFailedLoading && !profileNotFound &&
                <ReloadPageButton
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onPress={() => {
                        setPageFailedLoading(false)
                        setTimeout(async () => {
                            dispatch(loadProfilePage(page, navigationUsername, doNotUseUsername, isUserAccount === false) as any)
                        }, 120)
                    }} />
            }
            {profileNotFound &&
                <ProfileNotFoundUi COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />
            }




        </ScrollView>
    )
}