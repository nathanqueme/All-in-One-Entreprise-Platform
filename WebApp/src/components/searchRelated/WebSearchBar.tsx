import React, { useState, useEffect } from 'react'
import Colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import Divider from '../Divider'
import TextStyles from '../../styles/TextStyles'
import { AccountMainData, SearchResult, SearchResultObj } from '../../Data'
import { SearchIcon, XMarkIcon } from '../Icons'
import { SearchResults } from './index'
import { stringInSearchQueryFormat } from '../functions'
import { getMatchingAccountsMainData } from '../../aws/dynamodb'
import { useNavigate } from 'react-router-dom'
import { WindowWidth } from '../WindowWidth'
import { useSelector } from 'react-redux'
import { selectHistory } from '../../state/slices/historySlice'



interface WebSearchBarInterface {
    smallAppearance?: boolean
    headerAppearance?: boolean
    setSmallAppearance?: (_: boolean) => any
}
/**
 * The search bar used on desktops. With hover effect and selection with arrow up /down.
*/
export default function WebSearchBar({ smallAppearance, setSmallAppearance = () => { }, headerAppearance = false }: WebSearchBarInterface) {


    let id = "WebSearchBar"
    let input_id = "search_input"


    // SEARCH _____________________________________________________
    // 
    //let urlParams = getParamsFromUrl(new URL(window.location.href))
    const [searchQuery, setSearchQuery] = useState("") // useState((urlParams as any)["q"] ?? "")
    const [searchResults, setSearchResults] = useState([] as SearchResult[])
    const [searchHadResponse, setSearchHadResponse] = useState(false)
    const [noConnection, setNoConnection] = useState(false)
    const history = useSelector(selectHistory)
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
    let uniqueMatchingSearchResults = matchingSearchResults.reduce((unique: any[], searchR) => {

        if (!unique.some(item => (item.object as AccountMainData).account_id === (searchR.object as AccountMainData).account_id)) {
            unique.push(searchR)
        }

        return unique
    }, []) as SearchResult[]
    let uniqueHistorySearchResults = history?.map(e => SearchResultObj("", "accountMainData", e)) ?? []

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
        setSelectedSearchQuery("")

    }
    /**
     * Executes the search.
    */
    async function search(searchQuery: string) {

        try {

            let results: AccountMainData[] = []
            // Waits until the two querries are done. (These are done simultaneously).
            await Promise.all([true, false].map(async (searchWithUsername) => {

                const ouptput = await getMatchingAccountsMainData(searchQuery, searchWithUsername)
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

    // NEW
    function resignFocus() {
        // Remove focus 
        setSearchInputIsFocus(false)
        let search_input_div = document.getElementById(input_id)
        if (search_input_div) search_input_div.blur()
    }

    // NEW
    function handleSearchResultClick(e: SearchResult) {
        if (e.type === "accountMainData") {
            const accountMainData = (e.object) as AccountMainData
            navigate(`/${accountMainData.username}/`) // navigate(`/${accountMainData.username}${queryToDisplay.replace(/\s+/g, '') !== "" ? `?q=${queryToDisplay}` : ""}/`)
            setSearchQuery(accountMainData.account_name)
            resignFocus()
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
        setSearchQuery(""); setSelectedSearchQuery(""); setSearchHadResponse(false); setNoConnection(false)
    }
    //
    //
    // ____________________________________________________________








    // UI (wide devices only)___________________________________
    // 
    const [selectedSearchQuery, setSelectedSearchQuery] = useState("")
    const [searchInputIsOnHover, setSearchInputIsOnHover] = useState(false)
    const [searchInputIsFocus, setSearchInputIsFocus] = useState(false)
    const [highlightedSearchResult, setHighlightedSearchResult]: [number, React.Dispatch<React.SetStateAction<number>>] = useState(undefined as any) // index of the highlighted search result (Desktops only)

    const navigate = useNavigate()
    const WINDOW_WIDTH = WindowWidth()

    // shadow is on hover or displaying results
    let displayResults = ((uniqueMatchingSearchResults.length > 0) && searchInputIsFocus)
    let displayHistory = searchInputIsFocus && ((history?.length ?? 0) > 0) && searchQuery.length === 0
    let displayNoResultsText = ((uniqueMatchingSearchResults.length == 0) && searchHadResponse)
    let queryToDisplay = selectedSearchQuery !== "" ? selectedSearchQuery : searchQuery

    // Web version only 
    function handleArrowUpArrowDownSelection(e: React.KeyboardEvent<HTMLDivElement>) {

        let searchResultsToUse = displayHistory ? uniqueHistorySearchResults : uniqueMatchingSearchResults


        // 
        let value
        switch (e.code) {
            case "ArrowUp": value = -1
                // Avoids putting the cursor at the left when the user clicks on the arow up button
                e.preventDefault()
                    ; break
            case "ArrowDown": value = 1; break
            default: return
        }



        // highlight / unhighlight
        let index
        if (highlightedSearchResult === undefined) {
            if (value === 1) {
                index = 0
            } else {
                index = searchResultsToUse?.length - 1
            }
        } else if ((highlightedSearchResult === 0 && value === -1) || (highlightedSearchResult === (searchResultsToUse?.length - 1) && value === 1)) {
            index = undefined // Reset
        } else {
            index = highlightedSearchResult + value
        }



        // 
        setHighlightedSearchResult(index as any)
        if (index !== undefined) {
            const accountMainData = searchResultsToUse[index].object as AccountMainData
            setSelectedSearchQuery(accountMainData.account_name)
        } else {
            setSelectedSearchQuery("")
        }



    }
    function handleSearchWhenEnterClicked(e: React.KeyboardEvent<HTMLDivElement>) {
        if ((e.code === "Enter") && (highlightedSearchResult !== undefined)) {

            let searchResultsToUse = displayHistory ? uniqueHistorySearchResults : uniqueMatchingSearchResults

            let searchResult = searchResultsToUse[highlightedSearchResult]
            const username = searchResult.type === "city" ? "" : (searchResult.object as AccountMainData).username
            const account_name = searchResult.type === "city" ? "" : (searchResult.object as AccountMainData).account_name
            // Select it 
            setSearchQuery(account_name)
            navigate(`/${username}/`) // navigate(`/${username}?q=${account_name}/`)
            resignFocus()

        }
    }

    // Initialization
    useEffect(() => {
        if (searchInputIsFocus) {
            window.onclick = handleOuterClick
        } else {
            window.onclick = null
        }
    }, [searchInputIsFocus])
    function handleOuterClick(e: MouseEvent) {
        let el = document.getElementById(id)
        if (el === null) return
        if (!el.contains(e.target as any)) {
            setSearchInputIsFocus(false)
        }
    }
    useEffect(() => {
        if (smallAppearance === true) {
            blurSearchInput()
        } 
    }, [smallAppearance])
    // 
    // 
    //____________________________________________________________




    function focusSearchInput() {
        let search_input_div = document.getElementById(input_id)
        search_input_div?.focus()
    }
    function blurSearchInput() {
        let search_input_div = document.getElementById(input_id)
        search_input_div?.blur()
    }



    // UI _____________
    let spacerUi = <div style={{ height: headerAppearance ? 18 : 26 }}/>
    let resultsUi =
        <>
            {headerAppearance ? spacerUi : <Divider />}
            <></>
            <SearchResults
                matchingSearchResults={uniqueMatchingSearchResults}
                highlightedSearchResult={highlightedSearchResult}
                setHighlightedSearchResult={setHighlightedSearchResult}
                onClick={(e) => { handleSearchResultClick(e) }}
            />
            {spacerUi}
        </>

    let historyUi = <>
        {headerAppearance ? spacerUi : <Divider />}
        {/* TODO : prevent unwanted behavior -> when the user click to remove an item from history it closes the web search bar */}
        <SearchResults
            matchingSearchResults={uniqueHistorySearchResults}
            highlightedSearchResult={highlightedSearchResult}
            setHighlightedSearchResult={setHighlightedSearchResult}
            onClick={(e) => { handleSearchResultClick(e) }}
            isHistory
        />
        {spacerUi}
    </>

    let noResultUi =
        <div>
            {!headerAppearance && <Divider />}
            <div className='flex items-center justify-start' style={{ height: 60 }}>
                <p className='self-center' style={Object.assign({}, TextStyles.callout, { color: Colors.black, marginLeft: 20, marginRight: 20 })}>{localization.place_not_on_atsight_for_the_moment}</p>
            </div>
        </div>
    // ________________





    // SMALL/LARGE APPEARANCE_____________________
    function determineAppearance() {
        if (!headerAppearance) return
        // h_l_div : header_logo_div, l_g : logo_dimensions
        // s_b_div : search_bar_div, d : dimensions
       // let h_l_div = document.getElementById("header_logo"); if (!h_l_div) return
        let s_b_div = document.getElementById("WebSearchBar"); if (!s_b_div) return
        let d = s_b_div.getBoundingClientRect()
        // Checks if the logo almost touches the searchBar with a margin of 35 -> will trigger when there is only 35 of space left
       // let l_d = h_l_div.getBoundingClientRect()
       if (d.x <= 220) { // if ((d.x - l_d.width) <= 35) {
            setSmallAppearance(true)
        } else setSmallAppearance(false)
    }
    useEffect(() => {
        determineAppearance()
    }, [WINDOW_WIDTH])
    useEffect(() => {
        determineAppearance()
    }, [])
    //__________________________________________________


    if (headerAppearance) {

        //
        const dynamic_border_color = searchInputIsFocus ? "border-gray-200" : "border-gray-100"
        const hidden_search_icon = <div className='pl-3 opacity-0'> <SearchIcon /></div>
        const border_radius = 20


        return (
            <div
                id={id}
                className={`mx-5  flex flex-col items-center justify-start pointer-events-auto ${dynamic_border_color}`}
                style={{ height: 40, borderRadius: 26 }}
                onMouseOver={() => { setSearchInputIsOnHover(true) }}
                onMouseLeave={() => { setSearchInputIsOnHover(false) }}
                // Handle arrow up/down selection (on desktops)
                onKeyDown={(e) => {

                    handleArrowUpArrowDownSelection(e)
                    handleSearchWhenEnterClicked(e)

                }}
            >


                {/* Search bar */}
                <div className={`flex items-center justify-start`}>
                    <div className={`flex items-center justify-start`} style={{ width: WINDOW_WIDTH * 0.38 }}>
                        {/* Compensates the right SearchIcon to make the search bar aligned */}
                        {!searchInputIsFocus && hidden_search_icon}
                        {/* Input + Results */}
                        <div className={`flex relative w-full bg-white items-center ${dynamic_border_color} border-2 border-r-0 `} style={{ height: 38, borderTopLeftRadius: border_radius, borderBottomLeftRadius: border_radius }}>
                            {searchInputIsFocus &&
                                <div className='pl-3'>
                                    <SearchIcon />
                                </div>
                            }

                            <input
                                id={input_id}
                                className={`flex-grow pl-3 bg-transparent outline-none`}
                                autoComplete='off'
                                spellCheck={false}
                                style={{ color: Colors.black }}
                                type='text'
                                placeholder={localization.enter_a_place}
                                value={queryToDisplay}
                                onChange={e => {

                                    // handles search 
                                    let newSearchQuery = e.target.value
                                    handleSearchQuery(newSearchQuery)

                                }}
                                onFocus={() => { setSearchInputIsFocus(true) }}
                            />
                            {searchQuery.length > 0 &&
                                <button className='px-3' style={{ opacity: searchQuery.length === 0 ? 0 : 1 }} onClick={() => { resetSearch() }}>
                                    <XMarkIcon color={Colors.smallGrayText} size={"2em"} />
                                </button>
                            }

                            {/* Results Sheet */}
                            {(displayResults || displayHistory || displayNoResultsText) &&
                                <div className='flex flex-col absolute z-50 w-full mt-1 shadow-lg border bg-white' style={{ top: (38 - 2), marginTop: 6, borderRadius: border_radius }}>

                                    {/* Results */}
                                    {displayResults &&
                                        resultsUi
                                    }

                                    {/* History */}
                                    {displayHistory &&
                                        historyUi
                                    }

                                    {/* No results */}
                                    {displayNoResultsText &&
                                        noResultUi
                                    }

                                </div>
                            }
                        </div>
                    </div>

                    {/* Search button */}
                    <button onClick={() => { if (!searchInputIsFocus) focusSearchInput() }} className={`flex items-center justify-center px-5 ${dynamic_border_color} border-2 ${searchInputIsFocus ? "" : "hover:brightness-95"}`} style={{ backgroundColor: Colors.lightGray, height: 38, borderTopRightRadius: 26, borderBottomRightRadius: 26 }}>
                        <SearchIcon color={searchInputIsFocus ? Colors.clear : Colors.black} />
                    </button>

                    {/* Compensates the left SearchIcon to make the search bar aligned */}
                    <div onClick={() => { setSearchInputIsFocus(false) }}>{hidden_search_icon}</div>

                </div>

                {/* Bottom */}
            </div>
        )
    } else {
        return (
            <div className="flex items-center justify-center pointer-events-auto">
                <div
                    id={id}
                    className={`flex-auto border-2 mx-5 max-w-2xl bg-white z-10 ${(displayResults || searchInputIsOnHover) && "shadow-lg"}`}
                    style={{ borderRadius: 26 }}
                    onMouseOver={() => { setSearchInputIsOnHover(true) }}
                    onMouseLeave={() => { setSearchInputIsOnHover(false) }}
                    // Handle arrow up/down selection (on desktops)
                    onKeyDown={(e) => {

                        handleArrowUpArrowDownSelection(e)
                        handleSearchWhenEnterClicked(e)

                    }}
                >
                    {/* Search Icon + Input + Clear icon */}
                    <div className='flex items-center'>
                        <div className='px-3'>
                            <SearchIcon />
                        </div>
                        <input
                            id={input_id}
                            className={`flex-grow bg-transparent outline-none py-3`}
                            autoComplete='off'
                            spellCheck={false}
                            style={{ color: Colors.black }}
                            type='text'
                            placeholder={localization.enter_a_place}
                            value={queryToDisplay}
                            onChange={e => {

                                // handles search 
                                let newSearchQuery = e.target.value
                                handleSearchQuery(newSearchQuery)

                            }}
                            onFocus={() => { setSearchInputIsFocus(true) }}
                        />
                        {searchQuery.length > 0 &&
                            <button className='px-3' style={{ opacity: searchQuery.length === 0 ? 0 : 1 }} onClick={() => { resetSearch() }}>
                                <XMarkIcon color={Colors.smallGrayText} size={"2em"} />
                            </button>
                        }
                    </div>


                    {/* Results */}
                    {displayResults &&
                        resultsUi
                    }

                    {/** History  */}
                    {displayHistory &&
                        historyUi
                    }

                    {/** No results */}
                    {displayNoResultsText &&
                        noResultUi
                    }

                </div>
            </div>
        )
    }
}

