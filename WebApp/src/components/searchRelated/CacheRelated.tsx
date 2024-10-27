import { AccountMainData } from "../../Data"
import { removeSeenAccountMainData } from "../../state/slices/historySlice"


/* Redux related : use it with dispatch(...) */
export function removeFromHistory(account_main_data: AccountMainData) {
    return async (dispatch: any, getState: any) => {

        let history = JSON.parse(localStorage.getItem("h") ?? "[]") as AccountMainData[]
        let index = history.findIndex(e => { return e.account_id === account_main_data.account_id })
        if (index !== -1) {
            history.splice(index, 1)
        }
        localStorage.setItem("h", JSON.stringify(history))

        // ISSUE FOR NON MOBILE DEVICES 
        // the following function is not called because otherwise on non mobile devices the search bar outer click detector consider this click has an outer click.
        dispatch(removeSeenAccountMainData({ account_id: account_main_data.account_id }))

    }
}