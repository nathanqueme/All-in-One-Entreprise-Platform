import React, { useState, useEffect } from 'react'
import '../../styles/TextStyles.css'
import '../../styles/MainStyles.css'
import '../../index.css'
import CirclePhoto from '../../components/CirclePhoto'
import TextStyles from '../../styles/TextStyles'
import Divider from '../../components/Divider'
import localization from '../../utils/localizations'
import Colors from '../../assets/Colors'
import SlidingAlert from '../../components/SlidingAlert'
import NoConnectionUi from '../../components/ui/NoConnectionUi'
import { HomeTab, AccountInfoTab, InThePlaceTab } from './tabs'
import { RelatedItemsPage, PdfViewerOrPdfPage } from './secondaryTabs'
import { Helmet } from "react-helmet"
import { TabType } from '../../components/TabsRelated'
import { getSegmentsFromUrl, getProfilePhotoAlt, getFileName, getMainDivMinHeight, openAddressInMaps, copyString, getAppleMapsAddressUrl, getGoogleMapsAddressUrl, getAddressDescription, getYearMonthDate, isMobileHook, generateID, getTopLevelDomain } from '../../components/functions'
import { TabsButtons } from '../../components/TabsRelated'
import { CertificationBadgeIcon, FileIcon, MapIcon } from '../../components/Icons'
import { ClassicButton } from '../../components/Buttons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ParentDivId, SlidingAlertType } from '../../Types'
import { RelatedItemViewer } from '../../components/relatedItemsRelated'
import { BottomSheet } from '../../components/sheets'
import { AccountMainData, AccountMainDataObj, GeolocationObj, ImageDataObj, Page, PageObj } from '../../Data'
import { getTimetablesTypeDescriptiveText } from '../../components/TimetablesRelated'
import { DailyTimetablesList } from '../../components/DailyTimetablesList'
import { isIOS, isMacOs } from 'react-device-detect'
import { ProfilePageHeader } from '../../components/headersComponents/ProfilePageHeader'
import { Error404Screen, NoConnectionScreen } from '../../components/screens'
import { getAccountMainDataAttributesByUsername } from '../../aws/dynamodb'
import { Error404Ui } from '../../components/ui'
import { ScreenViewTracker, selectAnalytics, AccountViewObj } from '../../analytics'
import { PlatformType } from '../../analytics/AnalyticsData'
import { getUserSpokenLanguage } from '../../assets/LanguagesList'


// Global data
import { useSelector, useDispatch } from 'react-redux'
import { appendOrUpdateAccountMainData, selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { loadProfile, selectPagesProfiles } from '../../state/slices/profilesSlice'
import { loadPostCategories, selectPagesPostCategories } from '../../state/slices/postsSlice'
import { appendRelatedItems, getRelatedItems, selectPagesRelatedItems } from '../../state/slices/relatedItemsSlice'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { appendSeenAccountMainData } from '../../state/slices/historySlice'


// Dates 
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime) // enables using other functions such as fromNow()



const tabs: TabType[] = ['home', 'in_the_place', 'about']
const isMobile = isMobileHook()
const top_level_domain = getTopLevelDomain(window.location.href)
const t_l_d = top_level_domain === "localhost" ? "ch" : top_level_domain


interface ProfilePageInterface {
}
/**
 * The page of the account. (Also handles no page founded).
 * Contains the main tabs ("Home", "In the place", "About")
 * 
 * "Home" : Account's main photo + place's name + account's name + description + map + menu + categories 
 * "In the place" : All physical things/services in the place.
 * "About" : Text information like timetables, description, website.
 * 
*/
export default function ProfilePage({ }: ProfilePageInterface) {


    // All tabs____________________________________________
    const [pageFailedLoading, setPageFailedLoading] = useState(false)
    const [profileNotFound, setProfileNotFound] = useState(false)
    const [tabBeforePdfOpen, setTabBeforePdfOpen]: [TabType | undefined, (_: any) => any] = useState(undefined as any) // Used to keep the current tab visible when looking at the pdf


    // Values 
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const marginOnWideDevices = !isMobile ? 20 : 0


    // Navigation 
    // Url is like https://www.atsight.ch/george6paris/ ( + about/ or in_the_place/ ) 
    let urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    let username = urlSegments[0]
    let currentTab = (urlSegments[1] as TabType) ?? "home" as TabType
    let currentMainTab = currentTab === "r_i" ? "in_the_place" : ((currentTab === "map") || (currentTab === "menu") ? (tabBeforePdfOpen ?? "home") : currentTab)


    // Global data 
    const uiStates = useSelector(selectUiStates)
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.username === username })
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
    const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.username === username })
    const relatedItems = pageRelatedItems?.related_items ?? []
    const profile = useSelector(selectPagesProfiles).find(e => { return e.page.username === username })?.profile
    const account_main_data = pageAccountMainData?.account_main_data ?? AccountMainDataObj('', '', '', '', '', 'hotel', false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
    const { account_id, account_name, search_name, account_type, certified, image_data, geolocation, has_photo, short_id } = account_main_data


    let isUserAccount = false
    let timetables = profile?.timetables ?? undefined
    let hasTimetables = (timetables?.daily_timetables?.length ?? 0) > 0


    // Loading trackers
    let accountMainDataLoaded = (account_id !== "")
    let profileLoaded = ((profile?.account_id ?? "") !== "")
    let categoriesLoaded = pagePostCategories?.post_categories.every(e => { return typeof e.posts === 'object' }) ?? false

    let showPdf = accountMainDataLoaded && profileLoaded && (currentTab === "map" || currentTab === "menu")


    // Initialisation + updates
    useEffect(() => {

        let urlSegments = getSegmentsFromUrl(new URL(window.location.href))
        username = urlSegments[0]
        currentTab = (urlSegments[1] as TabType) ?? "home" as TabType
        if (((tabBeforePdfOpen) !== currentTab) && (currentTab !== "map") && (currentTab !== "menu")) {
            setTabBeforePdfOpen(currentTab)
        }

    }, [location])


    // ANALYTICS 
    function generateAndSaveAnalytics(account_id: string) {

        if (isUserAccount) { return }
        if (process.env.NODE_ENV !== 'production' && (true)) { return }

        let year_month = getYearMonthDate()
        fetch(`https://apis.atsight.${t_l_d}/analytics/accountsActivity?account_id=${account_id}&year_month=${year_month}&v=1`, { method: "PUT", credentials: "include", }).catch(e => { })

        const device_id = "" // <- will be set by the server
        const id = generateID(6)
        const viewing_date = new Date().toISOString()
        const ip = ""        // <- will be set by the server
        const country = ""   // <- will be set by the server
        const city = ""      // <- will be set by the server
        const coordinates: number[] = [] // <- will be set by the server
        const platform: PlatformType = "web"
        const open_from_qr_code = window.location.href.includes("s=qr")
        const hl = getUserSpokenLanguage().locale
        const accountView = AccountViewObj(account_id, id, viewing_date, device_id, ip, country, city, coordinates, platform, open_from_qr_code, hl)
        fetch(`https://apis.atsight.${t_l_d}/analytics/accountsViews`, { method: "POST", credentials: "include", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountView) }).catch(e => { })

    }


    // LOADING CONTENT________________________________________
    const [noProfileFound, setNoProfileFound] = useState(false)
    const [noConnection, setNoConnection] = useState(false)
    /**
     * @param username 
     * @param source when the page is open from a qr code. This will enable tracking how many people use qr codes.
     * 
     * Steps : 
     * - Load then save account's accountMainData and catch errors if any : 
     *        - Error A : No accounts match the username
     *        - Error B : No internet connection
    */
    async function startLoadingProfilePage(source?: "qr") {

        // Preparation
        let loadedPage: Page

        // 1
        try {

            let accountMainData = await getAccountMainDataAttributesByUsername(username, "all")

            // Error 1.A
            if (accountMainData === undefined) {
                setNoProfileFound(true)
            } else {
                loadedPage = PageObj(accountMainData.username, accountMainData.account_id, accountMainData.short_id)
                dispatch(appendOrUpdateAccountMainData({ page: loadedPage, accountMainData: accountMainData }))
                generateAndSaveAnalytics(accountMainData.account_id)
            }

        } catch (error) {
            // Error 1.B
            setNoConnection(true)
        }

    }
    // Step 1 (load accountMainData because the account_id and short_id are needed for loading the rest)
    useEffect(() => {

        if (!accountMainDataLoaded) {
            startLoadingProfilePage()
        }

    }, [location])
    // Step 2 (load profile + postsCategories)
    useEffect(() => {

        let page = pageAccountMainData?.page
        if ((short_id === "") || (page === undefined)) return
        if (!profileLoaded) { dispatch(loadProfile(page, isUserAccount === false) as any) }
        if (!categoriesLoaded) { dispatch(loadPostCategories(page, isUserAccount === false) as any) }

    }, [short_id])
    async function handleTryReloading() {

        setNoConnection(false)
        setTimeout(() => {
            startLoadingProfilePage()
        }, 550)

    }
    //________________________________________________________



    // LOADING EXTRA RELATED ITEMS____________________________
    // Issue : sometimes can trigger 2 loads at once --> loads items one more time 
    const [isLoadingRelatedItems, setIsLoadingRelatedItems] = useState(false)
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)

    let moreItemsCanBeLoaded = relatedItems.length < (profile?.related_items_count ?? 0)

    function handleReachedEnd() {
        if (moreItemsCanBeLoaded && !showLoadingIndicator) setShowLoadingIndicator(true)
    }

    useEffect(() => {
        setTimeout(() => {
            if (showLoadingIndicator) loadExtraRelatedItems()
        }, 100)
    }, [showLoadingIndicator])

    async function loadExtraRelatedItems() {

        if (!moreItemsCanBeLoaded || isLoadingRelatedItems) {
            console.log("Avoided unwanted loading")
            return
        } else {
            console.log("LOAD")
        }
        let oldestCreatedDate = relatedItems[relatedItems.length - 1].created_date // (Related item at the all bottom)
        setIsLoadingRelatedItems(true)

        try {
            let page = pageAccountMainData?.page ?? {} as Page
            let rItems = await getRelatedItems(page, isMobile ? 12 : 9, oldestCreatedDate, isUserAccount === false)
            dispatch(appendRelatedItems({ page: page, relatedItems: rItems }))
            setIsLoadingRelatedItems(false)
            setShowLoadingIndicator(false)
        } catch (error) {
            setIsLoadingRelatedItems(false)
            setShowLoadingIndicator(false)
            let payload: updateUiStateValuePayload = { attribute: 'slidingAlertType', value: 'no_connection' as SlidingAlertType }
            dispatch(updateUiStateValue(payload))
        }

    }
    //_______________________________________________________




    // BOTTOM SHEETS (home tab)__________________________
    /** Depending of if it's user's account and if the menu has timetables the options can be the following.
      * 
      * See menu + see timetables + cancel 
      * See menu + cancel
      * 
      * See menu + see timetables + edit + cancel
      * See menu + edit + cancel 
      * 
    */
    function getMenuBotttomSheetOptions() {

        if (isUserAccount) {
            if (hasTimetables) {
                return [localization.see_menu, localization.see_menu_timetables, localization.edit, localization.cancel]
            }
            else {
                return [localization.see_menu, localization.edit, localization.cancel]
            }
        } else {
            if (hasTimetables) {
                return [localization.see_menu, localization.see_menu_timetables, localization.cancel]
            }
            else {
                return [localization.see_menu, localization.cancel]
            }
        }
    }
    const menuBottomSheetOptions = getMenuBotttomSheetOptions()
    const mapBottomSheetOptions = isUserAccount ? [localization.see_map, localization.edit, localization.cancel] : [localization.see_map, localization.cancel]
    let hasAMap = (profile?.additional_resources ?? []).includes("map")
    let hasAMenu = (profile?.additional_resources ?? []).includes("menu")
    function handleMapBottomSheetClick(buttonIndex: number) {

        navigate(-1)

        setTimeout(() => {
            switch (buttonIndex) {
                case 0:
                    if (hasAMap) {
                        window.open(`https://www.atsightcdn.com/${getFileName("pdf", short_id, undefined, false)}`)
                    } else { navigate(`/${username}/map/`) }
                    break
                case 1: if (isUserAccount) { navigate(`${username}/map/edit/`) }; break
                default: break
            }
        }, 320)

    }
    function handleMenuBottomSheetClick(buttonIndex: number) {

        navigate(-1)

        setTimeout(() => {
            switch (buttonIndex) {
                case 0:
                    if (hasAMenu) {
                        window.open(`https://www.atsightcdn.com/${getFileName("pdf", short_id, undefined, true)}`)
                    } else { navigate(`/${username}/menu/`) }
                    break
                case 1:
                    if (hasTimetables) {
                        navigate(`${username}/menu/info/`)
                    } else if (isUserAccount) { navigate(`${username}/menu/edit/`) }
                    break
                case 2: if (isUserAccount && hasTimetables) { navigate(`${username}/menu/edit/`) }; break
                default: break
            }
        }, 320)

    }
    //___________________________________________________



    // BOTTOM SHEETS (about tab)_________________________
    const addressSheetOptions = [localization.open_in_maps, localization.copy, localization.cancel]
    // 
    let showAddressSheet = window.location.href.includes("#address")
    let showTimetablesSheet = window.location.href.includes("#timetables")

    function handleAddressSheet(buttonIndex: number) {

        navigate(-1)

        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: openAddressInMaps(account_main_data.geolocation); break
                case 1:
                    let addressUrl = isIOS || isMacOs ? getAppleMapsAddressUrl(account_main_data.geolocation) : getGoogleMapsAddressUrl(account_main_data.geolocation)
                    copyString(addressUrl, dispatch)
                    break
                default: break
            }
        }, 320)

    }
    //___________________________________________________



    // HISTORY____________________________________________
    function addToHistory() {
        if (!accountMainDataLoaded) return
        let history: AccountMainData[] = JSON.parse(localStorage.getItem("h") ?? "[]")
        let index = history.findIndex(e => { return e.account_id === account_id })
        if (index !== -1) {
            history.splice(index, 1)
        }
        let simplifiedAccountMainData = AccountMainDataObj(account_id, short_id, account_name, search_name, username, account_type, certified, has_photo, geolocation)
        localStorage.setItem("h", JSON.stringify([simplifiedAccountMainData, ...history]))
        dispatch(appendSeenAccountMainData({ accountMainData: simplifiedAccountMainData }))
    }
    useEffect(() => {
        addToHistory()
    }, [accountMainDataLoaded])
    // When the page has already been loaded and is watched again but was not on history anymore
    useEffect(() => {
        addToHistory()
    }, [location])
    //____________________________________________________





    // Ui
    let pdfViewerOrPage =
        <PdfViewerOrPdfPage
            isMenuPdf={currentTab === "menu"}
            page={pageAccountMainData?.page ?? PageObj("", "", "")}
            onClose={() => {
                if (tabBeforePdfOpen !== undefined) {
                    navigate(-1)
                } else {
                    navigate(`/${username}/`)
                }
            }} />




    if (currentTab === "r_i") {
        return (
            <div
                style={{ // NEEDED OTHERWISE GETS BLANK ON LARGE DEVICES
                    minHeight: getMainDivMinHeight(),
                }}>

                <RelatedItemsPage
                    showLoadingIndicator={showLoadingIndicator}
                    onEndReached={() => { handleReachedEnd() }}
                />

            </div >
            /*
             
        */

        )
    } else if (isMobile && showPdf) {
        return (
            pdfViewerOrPage
        )
    } else {
        return (
            /** Layout based on the device.
                Desktops: 
                  1 - Top
                    -> Account main photo + name + account name + description + Map + Menu buttons 
                    -> Tabs buttons 
     
                  2 - Tabs
              
                Phones: 
                  1 - Top
                      -> Profile page header (account name)
                      -> Tabs buttons
                      
                  2 - Tabs 
            */
            <div
                id={"ProfilePageDiv" as ParentDivId}
                className='flex flex-col items-center justify-start text-center bg-transparent'
                style={{
                    minHeight: getMainDivMinHeight(),
                    // backgroundColor: Colors.superWhitegray
                }}>


                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{account_name !== "" ? `${account_name} - AtSight` : "AtSight"}</title>
                </Helmet>


                <ScreenViewTracker screen_name={"profile"} is_user_one={isUserAccount} />


                <div className='w-full' style={{ maxWidth: 980 }}>
                    {/** Errors ui */}
                    {((noConnection || noProfileFound)) ?
                        (noConnection ?
                            isMobile ? <NoConnectionScreen onClick={() => { handleTryReloading() }} /> : <NoConnectionUi paddingTop={90} onClick={() => { handleTryReloading() }} />
                            :
                            isMobile ? <Error404Screen /> : <Error404Ui />
                        )
                        :
                        <>
                            {/* Top */}
                            {isMobile ?
                                <div className='flex flex-col items-start justify-start z-50 sticky' style={{ top: -44.5, backgroundColor: Colors.whiteToGray2 }}>
                                    <ProfilePageHeader username={username} onClose={() => {
                                        if (location.key === "default") {
                                            navigate("/")
                                        } else {
                                            navigate(-1)
                                        }
                                    }} />
                                    <TabsButtons
                                        tabs={tabs}
                                        currentMainTab={currentMainTab}
                                        username={username}
                                    />
                                </div>
                                :
                                <div className='px-5'>
                                    <div className='flex items-center justify-start mt-8 mb-4'>
                                        {/* Profile photo */}
                                        <button className='ml-8 mr-8' disabled={!isUserAccount} onClick={() => { }}>
                                            <CirclePhoto
                                                src={accountMainDataLoaded && has_photo ? `https://www.atsightcdn.com/${getFileName("profile_photo", short_id)}` : ""}
                                                alt={getProfilePhotoAlt(username)}
                                                widthAndHeight={135}
                                                displayLetterIfNoPhoto={account_name?.slice(0, 1) ?? ""}
                                            />
                                        </button>

                                        <div className='w-full'>
                                            <div className='flex justify-between items-center'>
                                                {/* Name + Certification */}
                                                <div className='flex items-center justify-center'>
                                                    <p className='text-left' style={Object.assign({}, TextStyles.headline, { color: accountMainDataLoaded ? Colors.black : Colors.clear, backgroundColor: accountMainDataLoaded ? undefined : Colors.softGray, width: accountMainDataLoaded ? undefined : 140 })}>{accountMainDataLoaded ? account_name : "Name's text"}</p>

                                                    {certified &&
                                                        <div style={{ paddingLeft: 4, paddingRight: 4 }}>
                                                            <CertificationBadgeIcon />
                                                        </div>
                                                    }
                                                </div>

                                                {/* Pdf buttons (Map + Menu) */}
                                                <div className='flex items-center justify-center h-8'  // h-8 --> height of the buttons so that the layout stays the same even without buttons
                                                >
                                                    {profile?.buttons?.includes("map") &&
                                                        <Link to={`/${username}/map/`}>
                                                            <ClassicButton
                                                                onClick={() => { }}
                                                                text={localization.map}
                                                                backgroundColor={Colors.softGray}
                                                                smallAppearance
                                                                textStyle={TextStyles.medium15}
                                                                icon={<MapIcon size='1.2em' />}
                                                            />
                                                        </Link>
                                                    }

                                                    {profile?.buttons?.includes("menu") &&
                                                        <Link to={`/${username}/menu/`} style={{ marginLeft: 10 }}>
                                                            <ClassicButton
                                                                onClick={() => { }}
                                                                text={localization.menu}
                                                                backgroundColor={Colors.softGray}
                                                                smallAppearance
                                                                textStyle={TextStyles.medium15}
                                                                icon={<FileIcon size='1.2em' />}
                                                            />
                                                        </Link>
                                                    }
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {accountMainDataLoaded ?
                                                <Link to={`/${username}/about/`}>
                                                    <p className={`gray13 text-left line-clamp-2 hover:brightness-0 active:opacity-100`} style={{ marginTop: 10 }}
                                                    >{localization.see_information_of_place}</p>
                                                </Link>
                                                :
                                                <p className={`gray13 text-left line-clamp-2 active:opacity-100`} style={{ marginTop: 10, color: Colors.clear, backgroundColor: Colors.softGray, width: 140 }}
                                                >{"Descriptive text"}</p>
                                            }
                                        </div>
                                    </div>

                                    <TabsButtons
                                        tabs={tabs}
                                        currentMainTab={currentMainTab}
                                        username={username}
                                    />
                                    <Divider />
                                </div>
                            }

                            {/* Tabs */}
                            <div style={{ paddingLeft: marginOnWideDevices, paddingRight: marginOnWideDevices }}>
                                {
                                    (() => {
                                        switch (currentMainTab) {
                                            case "in_the_place": return (
                                                <InThePlaceTab
                                                    page={pageAccountMainData?.page ?? PageObj("", "", "")}
                                                    account_name={account_name}
                                                    moreItemsCanBeLoaded={moreItemsCanBeLoaded}
                                                    showLoadingIndicator={showLoadingIndicator}
                                                    onEndReached={() => { handleReachedEnd() }}
                                                />
                                            )
                                            case "about": return (
                                                <AccountInfoTab accountMainDataLoaded={accountMainDataLoaded} profileLoaded={profileLoaded} />
                                            )
                                            default: return (
                                                <HomeTab
                                                    isUserAccount={isUserAccount}
                                                    pageFailedLoading={pageFailedLoading}
                                                    setPageFailedLoading={setPageFailedLoading}
                                                    profileNotFound={profileNotFound}
                                                    setProfileNotFound={setProfileNotFound}
                                                    accountMainDataLoaded={accountMainDataLoaded}
                                                    profileLoaded={profileLoaded}
                                                    categoriesLoaded={categoriesLoaded}
                                                />
                                            )
                                        }
                                    })()
                                }
                            </div>
                        </>
                    }
                </div>


                {/* Sheets */}
                {/* Home tab / Mobile */}
                {
                    <>
                        <BottomSheet
                            show={urlSegments[1] === "map_options" && profileLoaded && isMobile}
                            options={mapBottomSheetOptions}
                            handleClick={(buttonIndex) => handleMapBottomSheetClick(buttonIndex)}
                        />
                        <BottomSheet
                            show={urlSegments[1] === "menu_options" && profileLoaded && isMobile}
                            options={menuBottomSheetOptions}
                            handleClick={(buttonIndex) => handleMenuBottomSheetClick(buttonIndex)}
                        />
                    </>
                }


                {/* Account info tab */}
                {/* Mobiles */}
                {currentMainTab === "about" &&
                    <>
                        <BottomSheet
                            show={showAddressSheet}
                            options={addressSheetOptions}
                            handleClick={handleAddressSheet}
                            description={getAddressDescription(geolocation)}
                        />

                        <BottomSheet
                            options={[]}
                            headerText={getTimetablesTypeDescriptiveText(profile?.timetables?.type ?? 'opening_hours')}
                            show={showTimetablesSheet}
                            content_height={60 * 7 + ((profile?.timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                            content={
                                hasTimetables ?
                                    <DailyTimetablesList
                                        timetables={profile?.timetables ?? {} as any}
                                        editable={false}
                                        setDailyTimetablesOfThatDay={() => { }}
                                        backgroundColor={Colors.whiteToGray}
                                    />
                                    :
                                    <div style={{ height: 60 * 7 }} />
                            } />

                        <SlidingAlert
                            slidingAlertType={uiStates.slidingAlertType}
                            resetSlidingAlertType={() => { dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "" })) }}
                        />
                    </>
                }


                {showPdf &&
                    pdfViewerOrPage
                }



            </div >
        )
    }
}










