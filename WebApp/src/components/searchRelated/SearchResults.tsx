import React from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { AccountMainData, SearchResult } from "../../Data"
import { removeFromHistory } from "./CacheRelated"
import { SearchResultUi } from "./index"






interface SearchResultsInterface {
    matchingSearchResults: SearchResult[]
    highlightedSearchResult?: number
    setHighlightedSearchResult?: (_: number) => any
    onClick: (e: SearchResult) => any
    isHistory?: boolean
}
/**
 * Displays a list of search results.
 */
export default function SearchResults({ matchingSearchResults, highlightedSearchResult = -1, setHighlightedSearchResult, onClick, isHistory = false }: SearchResultsInterface) {


    const dispatch = useDispatch()


    return (
        <ul className='items-start'>
            {
                matchingSearchResults.map((e, index) => {
                    return (
                        <SearchResultUi
                            key={(e.object as AccountMainData).account_id}
                            searchResult={e}
                            onClick={() => onClick(e)}
                            isHighlighted={highlightedSearchResult === index}
                            setIsMouseOver={(isMouseOver) => {

                                // Desktops only
                                if (setHighlightedSearchResult === undefined) return
                                if (isMouseOver) { setHighlightedSearchResult(index) }
                                else if (highlightedSearchResult === index) {
                                    setHighlightedSearchResult(undefined as any) // Reset
                                }

                            }}
                            displayXMarkIcon={isHistory}
                            onClickDelete={() => { 
                                // TODO
                                // CAUSES THE WEBSEARCH BAR TO HIDE --> triggers outer click function
                                dispatch(removeFromHistory(e.object as AccountMainData) as any)
                             }}
                        />
                    )
                })
            }
        </ul>
    )
}




