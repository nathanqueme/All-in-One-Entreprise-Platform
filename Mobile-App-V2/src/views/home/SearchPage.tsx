import React, { useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import getColors, { ColorsInterface } from '../../assets/Colors'
import localization from "../../utils/localizations"
import Divider from "../../components/ui/Divider"
import TextStylesProvider, { TextStylesInterface } from "../../components/styles/TextStyles"
import NoConnectionUi from "../../components/ui/NoConnectionUi"
import { Pressable, Image, StatusBar, View, TextInput, Text, FlatList, LayoutAnimation, Dimensions, Keyboard, useColorScheme, BackHandler, NativeEventSubscription, Platform } from "react-native"
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowBackSymbol, XMarkSymbol } from "../../components/Symbols"
import { AccountMainData, SearchResult, SearchResultObj } from "../../Data"
import { getMatchingAccountsMainData } from "../../aws/dynamodb"
import { capitalize, getAddressDescription, stringInSearchQueryFormat } from "../../components/functions"
import { layoutAnimation } from "../../components/animations"
import { NavigationContext } from '@react-navigation/native';

// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { openAndLoadNewProfilePage } from '../../state/slices/pagesSlice'
import { initializeHistory, removeSeenAccountMainData, selectHistory } from '../../state/slices/historySlice'
import { selectUiStates } from "../../state/slices/uiStatesSlice"


const WINDOW = Dimensions.get("window")



interface SearchPageInterface {
    show: boolean
    setShow: (_: boolean) => any
    navigation: any
}
/**
 * A view that occupies all the screen and that displays a search bar at the top and all the searchResults.
*/
export default function SearchPage({ show, setShow, navigation }: SearchPageInterface) {


    // Values
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    const listContainerStyle = { paddingBottom: insets.bottom + 10, paddingTop: 10, backgroundColor: COLORS.whiteToGray2 }


    // Global values
    const uiStates = useSelector(selectUiStates)



    // SEARCH _____________________________________________________
    // 
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([] as SearchResult[])
    const [searchHadResponse, setSearchHadResponse] = useState(false)
    const [noConnection, setNoConnection] = useState(false)
    let formattedSearchQuery = stringInSearchQueryFormat(searchQuery)
    /** 
     * It lets display the matching search results without seeing glitchs on the ui when the user types --> looks and feels much better.
     * When the user types "Geor" and then "George" the result "George 6 Paris" won't disappear. 
     * 
     * What it does is filters all results on clients side.
     * 
     * 
     * Explanation : To understand the small visual issue it corrects try displaying the "searchResults" directly via the "Code" below and look at the small glitch when you type text.
     * Code : const matchingSearchResults = searchResults.filter(e => { return e.search_query === searchQuery })
     * 
    */
    let matchingSearchResults = searchResults.filter((e) => {

        if (formattedSearchQuery === "") return
        if (e.type === "accountMainData") {
            let accountMainData = e.object as AccountMainData
            return accountMainData.search_name.includes(formattedSearchQuery) || accountMainData.username.includes(formattedSearchQuery)
        } else {
            return e
        }

    })
    let uniqueMatchingSearchResults = matchingSearchResults.reduce((unique, searchR) => {

        if (!unique.some(item => (item.object as AccountMainData).account_id === (searchR.object as AccountMainData).account_id)) {
            unique.push(searchR)
        }

        return unique
    }, []) as SearchResult[]


    /**
     * Searches if needed and updates the ui.
    */
    async function handleSearchQuery(newSearchQuery: string) {

        /** Unnecessary Search prevention : 
          - when the user deletes it's search query.
          - when the search has already been queried and some results were found. (So it does search again if no results were founded). For instance, if the user has typed "George VI pm", then erases the "m" and types it again it searches again and results in displaying the no "Results founded" text.
        */
        if ((newSearchQuery.length < searchQuery.length) || (searchResults.findIndex(e => { return e.search_query === newSearchQuery }) !== -1)) {
            console.log("Avoided unnecessary search")
        } else {
            console.log("Search")
            search(newSearchQuery)
        }

        // Update Ui
        setSearchQuery(newSearchQuery)

    }
    /**
     * Executes the search.
    */
    async function search(searchQuery: string) {

        try {

            let results: AccountMainData[] = []
            // Waits until the two querries are done. (These are done simultaneously).
            await Promise.all([true, false].map(async (searchWithUsername) => {

                const ouptput = await getMatchingAccountsMainData(searchQuery, searchResults, searchWithUsername)
                results = results.concat(ouptput)

            }))



            setSearchHadResponse(true)

            let newSearchResults: SearchResult[] = []
            results.forEach(e => {
                let newSearchResult = SearchResultObj(searchQuery, "accountMainData", e)
                newSearchResults.push(newSearchResult)
            })

            let updatedSearchResults = searchResults.concat(newSearchResults)
            setSearchResults(updatedSearchResults)
            setNoConnection(false)


        } catch (error) {
            setNoConnection(true)
        }


    }


    // Reset
    useEffect(() => {

        if (searchHadResponse && ((uniqueMatchingSearchResults.length > 0) || (searchQuery.length === 0))) {
            setSearchHadResponse(false)
        }

        if (noConnection && (searchQuery.length === 0)) {
            setNoConnection(false)
        }

    }, [uniqueMatchingSearchResults, searchQuery])
    function resetSearch() {
        setSearchQuery(""); setSearchHadResponse(false); setNoConnection(false)
    }
    //
    //
    // ____________________________________________________________











    // HISTORY _________________________________________________
    // 
    const [seenAccountsHistory, setSeenAccountsHistory] = useState<AccountMainData[]>()

    // Global data
    const history = useSelector(selectHistory) ?? []

    // Initialization
    useEffect(() => {
        getHistory()
    }, [])

    // Caches the history when it changes 
    useEffect(() => {

        if (history !== seenAccountsHistory && seenAccountsHistory !== undefined) {
            AsyncStorage.setItem("@seen_accounts", JSON.stringify(history.slice(0, 4))) // Only the first 4 
            setSeenAccountsHistory(history)
        }

    }, [history])

    async function getHistory() {

        try {

            // Values 
            let cachedHistory = await AsyncStorage.getItem('@seen_accounts')
            let seenAccounts: AccountMainData[] = JSON.parse(cachedHistory)

            // Updates
            setSeenAccountsHistory(seenAccounts)
            dispatch(initializeHistory({ seenAccounts: seenAccounts }))

        } catch (error) {
            console.log(error)
        }

    }
    //
    //
    // ____________________________________________________________





    // Go back support for Android
    const [backHandler, setBackHandler]: [NativeEventSubscription, any] = useState()
    const [is_focus, setIsFocus] = useState(true)
    const navigationContext = React.useContext(NavigationContext)
    const handleFocus = navigationContext.addListener("focus", (e) => {
        setIsFocus(true)
    })
    const handleBlur = navigationContext.addListener("blur", (e) => {
        setIsFocus(false)
    })
    useEffect(() => {
        handleFocus()
        handleBlur()
    }, [])
    useEffect(() => {

        if (show && is_focus && Platform.OS === "android") {
            // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
            const handler = BackHandler.addEventListener("hardwareBackPress", () => {
                // Prepare for potential overwritte
                setShow(false)
                handler.remove()
                return true // Indicates that has overwritten the back action
            })
            setBackHandler(handler)
        } else if (backHandler !== undefined) { // STOP HANDLING COME BACK FROM THAT PAGE ONCE THE USER LOOKS AT THE ACCOUNT OR AS CLOSED THE PAGE
            backHandler?.remove()
        }

    }, [show, is_focus])




    if (show) {
        return (
            <SafeAreaProvider style={{ position: "absolute", backgroundColor: "red", width: "100%", height: "100%" }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />



                    {/* Search input */}
                    <View style={{ justifyContent: "flex-start", alignItems: "center", flexDirection: "row", backgroundColor: COLORS.whiteToGray2 }}>

                        <Pressable onPress={() => { setShow(false); resetSearch(); }} style={{ display: "flex", width: 48, height: 44.5, justifyContent: "center", alignItems: "center" }}>
                            <ArrowBackSymbol COLORS={COLORS} size={26} />
                        </Pressable>

                        <TextInput
                            autoFocus
                            value={searchQuery}
                            placeholder={localization.enter_a_place}
                            onChange={(e) => {

                                // handles search 
                                let newSearchQuery = e.nativeEvent.text
                                handleSearchQuery(newSearchQuery)

                            }}
                            placeholderTextColor={COLORS.smallGrayText}
                            autoComplete='off'
                            spellCheck={false}
                            style={[TEXT_STYLES.calloutMedium, {
                                flex: 1,
                                color: COLORS.black,
                                paddingVertical: 14,
                                fontSize: 16,
                            }]}
                        />

                        <Pressable onPress={() => { resetSearch() }} style={{ display: "flex", width: 48, height: 44.5, justifyContent: "center", alignItems: "center", opacity: searchQuery.length > 0 ? 1 : 0 }}>
                            <XMarkSymbol COLORS={COLORS} size={25} color={COLORS.smallGrayText} />
                        </Pressable>

                    </View>
                    <Divider COLORS={COLORS} />


                    {/* Results */}
                    {noConnection ?
                        < FlatList
                            data={[]}
                            keyExtractor={e => { return "none" }}
                            keyboardDismissMode={"on-drag"}
                            keyboardShouldPersistTaps={"always"}
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: insets.bottom }}
                            ListHeaderComponent={
                                <Pressable onPress={() => { Keyboard.dismiss() }} style={{ height: "100%", paddingTop: WINDOW.height * 0.1 }}>
                                    <NoConnectionUi
                                        TEXT_STYLES={TEXT_STYLES}
                                        COLORS={COLORS}
                                        onPress={() => {
                                            setNoConnection(false)
                                            setTimeout(() => {
                                                search(searchQuery)
                                            }, 550)
                                        }} />
                                </Pressable>
                            }
                            renderItem={({ item, index }) => (
                                null
                            )}
                        />
                        :
                        (searchQuery.length > 0 ?
                            // Search results
                            < FlatList
                                data={uniqueMatchingSearchResults}
                                keyExtractor={e => { return (e.object as AccountMainData).account_id }}
                                keyboardDismissMode={"on-drag"}
                                keyboardShouldPersistTaps={"always"}
                                contentContainerStyle={{ paddingBottom: insets.bottom + 10, paddingTop: 10, backgroundColor: COLORS.whiteToGray2 }}
                                ListHeaderComponent={
                                    ((uniqueMatchingSearchResults.length == 0) && searchHadResponse) &&
                                    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                                        <Text style={[TEXT_STYLES.callout, { color: COLORS.black }]}>{localization.place_not_on_atsight_for_the_moment}</Text>
                                    </View>
                                }
                                renderItem={({ item, index }) => (
                                    <SearchResultUi
                                        searchResult={item}
                                        onPress={() => {
                                            if (item.type === "accountMainData") {
                                                const accountMainData = (item.object) as AccountMainData
                                                const isUserAccount = accountMainData.account_id === uiStates.account_id && accountMainData.account_id !== ""
                                                dispatch(openAndLoadNewProfilePage(accountMainData.account_id, accountMainData.short_id, navigation, accountMainData.username, false, true, undefined, isUserAccount === false) as any)
                                            }
                                        }}
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                    />
                                )}
                            />
                            :
                            // History
                            <FlatList
                                data={seenAccountsHistory} // Only 4 firsts 
                                contentContainerStyle={listContainerStyle}
                                keyExtractor={e => e.account_id}
                                keyboardDismissMode={"on-drag"}
                                keyboardShouldPersistTaps={"always"}
                                renderItem={({ item, index }: { item: AccountMainData, index: any }) => (
                                    <SearchResultUi
                                        TEXT_STYLES={TEXT_STYLES}
                                        COLORS={COLORS}
                                        searchResult={SearchResultObj("", "accountMainData", item)}
                                        displayXMarkIcon
                                        onPress={() => {

                                            const isUserAccount = item.account_id === uiStates.account_id && item.account_id !== ""
                                            dispatch(openAndLoadNewProfilePage(item.account_id, item.short_id, navigation, item.username, false, true, undefined, isUserAccount === false) as any)

                                        }}
                                        onPressDelete={() => {
                                            LayoutAnimation.configureNext(layoutAnimation)

                                            dispatch(removeSeenAccountMainData({ account_id: item.account_id }))

                                        }}
                                    />
                                )}
                            />
                        )
                    }




                </SafeAreaView>
            </SafeAreaProvider>
        )
    }
    else {
        return null
    }
}






interface SearchResultUiInterface {
    searchResult: SearchResult
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    displayXMarkIcon?: boolean
    onPressDelete?: () => any
}
/**
 * Displays a the image, the name and the description of the search result.
 */
export function SearchResultUi({ searchResult, onPress, COLORS, TEXT_STYLES, displayXMarkIcon = false, onPressDelete = () => { } }: SearchResultUiInterface) {


    // Values 
    const isACity = searchResult.type === "city"
    const item_id = isACity ? "" : (searchResult.object as AccountMainData).account_id
    let text = isACity ? "Todo..." : (searchResult.object as AccountMainData).account_name
    let description = isACity ? "Todo here..." : (searchResult.object as AccountMainData).username
    let image_base_64 = isACity ? "Todo here..." : (searchResult.object as AccountMainData)?.image_data?.base64 ?? ""
    let geolocation = isACity ? undefined : (searchResult.object as AccountMainData)?.geolocation

    const address_description = ((geolocation !== undefined) && (geolocation?.city ?? "") !== "") ? getAddressDescription(geolocation) : undefined



    return (
        <Pressable
            onPress={() => { onPress() }}
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                height: 60,
                paddingHorizontal: 20
            }}>

            <View style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                flex: 1
            }}>
                {image_base_64 ?
                    <Image
                        style={{
                            resizeMode: 'cover',
                            width: 40,
                            height: 40,
                            backgroundColor: COLORS.lightGray,
                            borderRadius: 4
                        }}
                        source={{ uri: image_base_64, cache: "reload" }}
                    />
                    :
                    <View style={{ width: 40, height: 40, backgroundColor: COLORS.lightGray, borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: COLORS.black, fontWeight: "bold", fontSize: 17 * 40 / 38 }}>{capitalize(text.slice(0, 1))}</Text>
                    </View>
                }


                <View style={{ alignItems: "flex-start", paddingLeft: 20, flexShrink: 1, paddingRight: 10 }}>
                    <Text style={[TEXT_STYLES.calloutMedium, { color: COLORS.black }]}>{text}</Text>
                    <Text numberOfLines={1} style={[TEXT_STYLES.gray12Text, { marginTop: 2 }]}>{description}{address_description && ` - ${address_description}`}</Text>
                </View>
            </View>

            {displayXMarkIcon &&
                <Pressable onPress={onPressDelete}>
                    <XMarkSymbol COLORS={COLORS} size={18} color={COLORS.smallGrayText} />
                </Pressable>
            }

        </Pressable>
    )
}




