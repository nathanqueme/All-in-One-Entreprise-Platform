import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { AccountMainData, SearchResultObj } from "../../Data"
import { selectHistory } from "../../state/slices/historySlice"
import { removeFromHistory } from "./CacheRelated"
import { SearchResultUi } from "./index"


interface SeenAccountsHistoryInterface {
    
}
/**
 * Displays a list of search results.
 */
export default function SeenAccountsHistory({ }: SeenAccountsHistoryInterface) {


    const dispatch = useDispatch()
    const navigate = useNavigate()

    const history = useSelector(selectHistory)


    return (
        <ul className='items-start'>
            {
                history.map((e, index) => {
                    return (
                        <SearchResultUi
                            key={e.account_id}
                            searchResult={SearchResultObj("_", "accountMainData", e)}
                            onClick={() => {

                                navigate(`/${e.username}/`)

                            }}
                            isHighlighted={false}
                            setIsMouseOver={(isMouseOver) => {
                            }}
                            displayXMarkIcon
                            onClickDelete={() => { dispatch(removeFromHistory(e) as any) }}
                        />
                    )
                })
            }
        </ul>
    )
}
