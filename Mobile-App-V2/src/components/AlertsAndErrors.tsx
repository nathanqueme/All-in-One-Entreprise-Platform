//
//  AlertsAndErrors.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { Alert } from 'react-native'
import localization from "../utils/localizations"



export function showNoInternetConnectionAlert() {
    Alert.alert(localization.no_connection_title, localization.no_connection_message)
}



export function getErrorDescription(error: Error) {
    if (error.message.includes("Network")) {
        return Error(localization.no_connection_message)
    } else return error
}