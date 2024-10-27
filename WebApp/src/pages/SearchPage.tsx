import React, { useState, useEffect } from 'react'
import '../styles/TextStyles.css'
import '../index.css'
import localization from '../utils/localizations'
import Colors from '../assets/Colors'
import Divider from '../components/Divider'
import NoConnectionUi from '../components/ui/NoConnectionUi'
import TextStyles from '../styles/TextStyles'
import { XMarkIcon, ArrowBackIcon } from '../components/Icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchResults, SeenAccountsHistory } from '../components/searchRelated'
import { AccountMainData, SearchResult, SearchResultObj } from '../Data'
import { stringInSearchQueryFormat } from '../components/functions'
import { ParentDivId } from '../Types'
import { getMatchingAccountsMainData } from '../aws/dynamodb'



// Global data 
import { useSelector } from 'react-redux'
import { selectHistory } from '../state/slices/historySlice'





/**
 * Lets the user search, by displaying a list of the results. 
 * Takes the full screen.
*/
export default function SearchPage({ }) {


    // States 
    const navigate = useNavigate()
    // const dispatch = useDispatch()
    const listContainerStyle = { paddingBottom: 10, paddingTop: 10, backgroundColor: Colors.whiteToGray2 }









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
    let uniqueMatchingSearchResults = matchingSearchResults.reduce((unique: any[], searchR) => {

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

    function onSearchResultClick(e: SearchResult) {
        if (e.type === "accountMainData") {
            const accountMainData = (e.object) as AccountMainData
            navigate(`/${accountMainData.username}/`)
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
    // Reset (small devices only)
    useEffect(() => {

        resetSearch()

    }, [])
    function resetSearch() {
        setSearchQuery(""); setSearchHadResponse(false); setNoConnection(false)
    }
    //
    //
    // ____________________________________________________________









    return (
        <div id={"SearchPageDiv" as ParentDivId} className='absolute top-0 bg-white w-screen h-screen z-20'>
            {/* Close button + Search field + Clear button */}
            <div className='sticky top-0 bg-white'>
                <div className='flex items-center'>
                    <div className='w-12 justify-center items-center flex' style={{ height: 44.5 }} onClick={() => {
                        navigate(-1) // Don't reset search here so there is no unwanted glitched during the transition
                    }}>
                        <ArrowBackIcon size='1.4em' />
                    </div>
                    <input
                        autoFocus
                        autoComplete='off'
                        spellCheck={false}
                        value={searchQuery}
                        onChange={e => {

                            // handles search 
                            let newSearchQuery = e.target.value
                            handleSearchQuery(newSearchQuery)

                        }}
                        className="flex-grow bg-transparent outline-none py-3"
                        type='text'
                        style={{ color: Colors.black }}
                        placeholder={localization.enter_a_place}
                    />
                    {searchQuery.length > 0 &&
                        <button className='w-12 justify-center items-center flex' style={{ opacity: "search".length === 0 ? 0 : 1, height: 44.5 }} onClick={() => { resetSearch() }}>
                            <XMarkIcon color={Colors.smallGrayText} size={"2em"} />
                        </button>
                    }
                </div>
                <Divider />
            </div>



            {/* Results */}
            <div>
                {noConnection ?
                    <div style={{ marginTop: window.innerHeight * 0.1 }}>
                        <NoConnectionUi onClick={() => {
                            setNoConnection(false)
                            setTimeout(() => {
                                search(searchQuery)
                            }, 550)
                        }} />
                    </div>
                    :
                    <div style={{ marginTop: 3, marginBottom: 3 }}>
                        {(searchQuery.length > 0 ?
                            /** Search results */
                            ((uniqueMatchingSearchResults.length == 0) && searchHadResponse) ?
                                /** No results */
                                < div style={{ marginLeft: 20, marginRight: 20, marginTop: 20 }}>
                                    <p className='self-center' style={Object.assign({}, TextStyles.callout, { color: Colors.black })}>{localization.place_not_on_atsight_for_the_moment}</p>
                                </div>
                                :
                                <SearchResults
                                    matchingSearchResults={uniqueMatchingSearchResults}
                                    onClick={(e) => { onSearchResultClick(e) }}
                                />
                            :

                            /** History */
                            <SeenAccountsHistory />
                        )}
                    </div>
                }
            </div>


        </div>
    )
}







