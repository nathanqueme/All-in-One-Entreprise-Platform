import React, { useEffect, useState } from "react"
import Colors from '../../../assets/Colors'
import localization from "../../../utils/localizations"
import ActivityIndicator from "../../../components/ActivityIndicator"
import { getSegmentsFromUrl, isMobileHook } from "../../../components/functions"
import { ClassicHeader } from "../../../components/headersComponents"
import { RelatedItemUi } from "../../../components/relatedItemsRelated"
import { useDispatch, useSelector } from "react-redux"
import { BottomSheet } from "../../../components/sheets"
import { useLocation, useNavigate } from "react-router-dom"
import { AccountMainData, AccountMainDataObj, GeolocationObj, ImageDataObj, Page, PageObj, RelatedItem } from "../../../Data"
import { appendRelatedItems, getRelatedItems, selectPagesRelatedItems } from "../../../state/slices/relatedItemsSlice"
import { appendAccountMainData, selectPagesAccountsMainData } from "../../../state/slices/accountsMainDataSlice"
import { getAccountMainDataAttributesByUsername, queryRelatedItemAttributesByItemId } from "../../../aws/dynamodb"
import { Error404Screen, LoadingScreen, NoConnectionScreen } from "../../../components/screens"
import { getTimetablesTypeDescriptiveText } from "../../../components/TimetablesRelated"
import { DailyTimetablesList } from "../../../components/DailyTimetablesList"
import { ScreenViewTracker } from "../../../analytics"


const isMobile = isMobileHook()


interface RelatedItemsPageInterface {
    showLoadingIndicator: boolean
    onEndReached: () => any
}
/**
 * (LARGE & THIN DEVICES)
 * 
 * Displays : 
 * - a phone looking header 
 * - all the posts of a post category
 * - related items's "Actions" bottom sheet
*/
export default function RelatedItemsPage({ showLoadingIndicator, onEndReached }: RelatedItemsPageInterface) {


    // States 
    const [isDeleting, setIsDeleting] = useState(false)


    // Values 
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const urlSegments = getSegmentsFromUrl(new URL(window.location.href))
    const username = urlSegments[0]
    const openFromRelatedItemId = urlSegments[2] ?? ""
    const dummyIsUserAccount = false


    // Global data 
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
    const pageRelatedItems = useSelector(selectPagesRelatedItems).find(e => { return e.page.username === username })
    const account_main_data = pageAccountMainData?.account_main_data ?? AccountMainDataObj('', '', '', '', '', 'hotel', false, false, GeolocationObj('', '', '', '', '', ''), ImageDataObj("", 1))
    const { account_id, account_name, account_type, certified, image_data, geolocation, has_photo, short_id } = account_main_data
    let itemOpenFrom = pageRelatedItems?.related_items.find(e => { return e.item_id === openFromRelatedItemId })
    let otherItems = (pageRelatedItems?.related_items.filter(e => { return e.item_id !== openFromRelatedItemId }) ?? [])
        // Sorted by most recently created
        .sort(function (a, b) {
            if (a.created_date > b.created_date) { return -1 }
            if (a.created_date < b.created_date) { return 1 }
            return 0
        }) ?? []
    let relatedItemsInProperOrder = (itemOpenFrom ? [itemOpenFrom].concat(otherItems) : otherItems).slice()




    // Values for loading
    let relatedItemsLoaded = ((pageRelatedItems?.page.account_id ?? "") !== "")




    // Initialization (UI SCROLL TOP)__________________
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0 }) // , behavior: "smooth" 
    }, [])
    //_________________________________________________





    // LOADING IF NEEDED________________________________
    /** The page was open from scratch.
     * 
     * Process : 
     * - 1 : load's accountMainData
     * - 2 : load the 12 first related items 
     * - 3 : load the targeted item if not already
     * 
     * Errors : 
     * - 1 : no result is found for the query. 
     * - 2 : there is no connection.
    */
    const [noConnection, setNoConnection] = useState(false)
    const [noResultFound, setNoResultFound] = useState(false)
    async function loadFirstRelatedItemsAndTargetedOne() {


        // 1
        let page = {} as Page
        let accountMainData = {} as AccountMainData
        try {

            let output = await getAccountMainDataAttributesByUsername(username, "all")
            if (output !== undefined) {
                accountMainData = output
                page = PageObj(accountMainData.username, accountMainData.account_id, accountMainData.short_id)
            } else {
                setNoResultFound(true)
                return
            }

        } catch (error) {
            setNoConnection(true)
            return
        }


        // 2
        let relatedItems: RelatedItem[] = []
        try {
            relatedItems = await getRelatedItems(page, 12, undefined, dummyIsUserAccount === false)
        } catch (error) {
            setNoConnection(true)
            return
        }


        // 3
        let targetedRelatedItem = {} as RelatedItem
        let targetedItemAlreadyLoaded = relatedItems.some(e => { return e.item_id === openFromRelatedItemId })
        if (!targetedItemAlreadyLoaded) {
            try {
                let output = await queryRelatedItemAttributesByItemId(accountMainData.account_id, openFromRelatedItemId, "all")
                if (output) {
                    targetedRelatedItem = output
                }
            } catch (error) {
            }
        }




        // 
        dispatch(appendRelatedItems({ page: page, relatedItems: (targetedRelatedItem?.account_id ?? "") !== "" ? [targetedRelatedItem].concat(relatedItems) : relatedItems }))
        dispatch(appendAccountMainData({ page: page, accountMainData: accountMainData }))



    }
    useEffect(() => {

        if (!relatedItemsLoaded) {
            loadFirstRelatedItemsAndTargetedOne()
        }

    }, [])
    //__________________________________________________






    // BOTTOM SHEETS_____________________________________ 
    const editingSheetOptions = [localization.delete, localization.edit, localization.cancel]
    // 
    const [selectedRelatedItem, setSelectedRelatedItem]: [RelatedItem | undefined, any] = useState()
    let hasTimetables = (selectedRelatedItem?.timetables?.daily_timetables?.length ?? 0) > 0
    // 
    let showEditingSheet = window.location.href.includes("#edit")
    let showTimetablesSheet = window.location.href.includes("#timetables")
    function handleEditingSheet(buttonIndex: number) {

        navigate(-1)

        setTimeout(async () => {
            switch (buttonIndex) {
                case 0: console.log("delete"); break
                case 1: console.log("edit"); break
                default: break
            }
        }, 320)

    }
    //___________________________________________________






    if (true) {
        return (
            <div className='flex flex-col'>
                <ScreenViewTracker screen_name={"related_items"} />

                {(noConnection || noResultFound) ?
                    (noConnection ?
                        <NoConnectionScreen onClick={() => {

                            setNoConnection(false)
                            setTimeout(() => {
                                loadFirstRelatedItemsAndTargetedOne()
                            }, 550)

                        }} />
                        :
                        <Error404Screen />
                    )
                    :
                    (relatedItemsLoaded ?
                        <>
                            {isMobile &&
                                <ClassicHeader
                                    onClose={() => { 
                                        if (location.key === "default") {
                                            navigate("/")
                                        } else {
                                            navigate(-1)
                                        }
                                     }}
                                    closeButtonType={'chevronLeft'}
                                    headerText={localization.in_the_place}
                                    isLoading={isDeleting}
                                    buttonType={dummyIsUserAccount ? "addSymbol" : undefined}
                                    onClick={() => {
                                    }}
                                    sticky
                                />
                            }
                            <RelatedItemsList
                                relatedItems={relatedItemsInProperOrder}
                                isUserAccount={dummyIsUserAccount}
                                short_id={pageRelatedItems?.page.short_id ?? ""}
                                account_name={account_name}
                                showLoadingIndicator={showLoadingIndicator}
                                onShowTimetables={(relatedItem) => {
                                    setSelectedRelatedItem(relatedItem)
                                    navigate(`${window.location.pathname}#timetables/`)
                                }}
                                onClickEdit={(relatedItem) => {
                                    setSelectedRelatedItem(relatedItem)
                                    navigate(`${window.location.pathname}#edit/`)
                                }}
                                onEndReached={() => {
                                    onEndReached()
                                }}
                            />
                        </>
                        :
                        <LoadingScreen />
                    )

                }


                {/* Sheets */}
                <BottomSheet
                    show={showEditingSheet}
                    options={editingSheetOptions}
                    handleClick={handleEditingSheet}
                />
                <BottomSheet
                    options={[]}
                    headerText={getTimetablesTypeDescriptiveText(selectedRelatedItem?.timetables?.type ?? 'opening_hours')}
                    show={showTimetablesSheet}
                    content_height={60 * 7 + ((selectedRelatedItem?.timetables?.temporary_time ?? "") !== "" ? 60 : 0)}
                    content={
                        hasTimetables ?
                            <DailyTimetablesList
                                timetables={selectedRelatedItem?.timetables ?? {} as any}
                                editable={false}
                                setDailyTimetablesOfThatDay={() => { }}
                                backgroundColor={Colors.whiteToGray}
                            />
                            :
                            <div style={{ height: 60 * 7 }} />
                    } />


            </div>
        )
    }
}



interface RelatedItemsListInterface {
    relatedItems: RelatedItem[]
    isUserAccount: boolean
    short_id: string
    account_name: string
    showLoadingIndicator: boolean
    onShowTimetables: (relatedItem: RelatedItem) => any
    onClickEdit: (relatedItem: RelatedItem) => any
    onEndReached: () => any
}
/**
 * (LARGE & THIN DEVICES)
 * 
 * Displays a list of all the related items on their real size. And detects when the end of the list was reached.
 */
function RelatedItemsList({ relatedItems, isUserAccount, short_id, account_name, showLoadingIndicator, onShowTimetables, onClickEdit, onEndReached }: RelatedItemsListInterface) {


    // States
    const [alreadyReachedDiv, setAlreadyReachedDiv] = useState([] as string[])


    // Values 
    let lastItemId = relatedItems[relatedItems.length - 1]?.item_id ?? ""


    /**
     * Will triggers onEndReached() on each scroll, once it has detected that the last related item is starting to be visible.
    */
    function handleEndReached() {

        let listDiv = document.getElementById("relatedItemsDiv")
        if (listDiv === null) return

        let listDivMeasures = listDiv.getBoundingClientRect()

        let lastItemDivName = `${lastItemId}_div`
        let lastItemDiv = document.getElementById(lastItemDivName)
        if (lastItemDiv === null) return
        let lastItemDivMeasures = lastItemDiv.getBoundingClientRect()
        let lastItemStartsToBeVisible = (listDivMeasures.bottom - window.innerHeight) - lastItemDivMeasures.height <= 0


        // The value of listDivMeasures.bottom gets close to window.innerHeight while scrolling down.
        // Once the end has been reached it remembers of it.
        if (lastItemStartsToBeVisible) {
            if (alreadyReachedDiv.includes(lastItemDivName)) return // Avoids re trigerring hundreds of times once triggered once.
            onEndReached()
            setAlreadyReachedDiv(prevV => {
                return [...prevV, lastItemDivName] // Remembers of it
            })
        } else {

            let index = alreadyReachedDiv.findIndex(e => { return e === lastItemDivName })
            if (index === -1) return
            // Remove the remembering
            setAlreadyReachedDiv(prevV => {
                prevV.splice(index, 1)
                return [...prevV]
            })

        }

    }

    window.onscroll = handleEndReached
    window.onresize = handleEndReached


    return (
        <ul id="relatedItemsDiv" className="flex flex-col justify-center items-center">

            {relatedItems.map((e: RelatedItem) => {
                return (
                    <RelatedItemUi
                        key={e.item_id}
                        relatedItem={e}
                        isUserAccount={isUserAccount}
                        onClickTimetables={() => {
                            onShowTimetables(e)
                        }}
                        onClickEdit={() => {
                            onClickEdit(e)
                        }}
                        short_id={short_id}
                        account_name={account_name}
                    />
                )
            })}

            {showLoadingIndicator &&
                <div className='flex items-center justify-center w-full' style={{ height: 90, marginBottom: 30 }}>
                    <ActivityIndicator color={Colors.smallGrayText} />
                </div>
            }
        </ul>
    )
}

