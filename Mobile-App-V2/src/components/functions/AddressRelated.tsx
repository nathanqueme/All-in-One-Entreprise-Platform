//
//  AddressRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

import * as geokit from 'geokit'
import Clipboard from '@react-native-clipboard/clipboard'
import Share from "react-native-share"
import { Geolocation } from '../../Data'
import { Linking, Platform } from 'react-native'
import { AnyAction, Dispatch } from '@reduxjs/toolkit'

// Global data 
import { updateUiStateValue } from '../../state/slices/uiStatesSlice'



export async function openAddressInMaps(geolocation: Geolocation) {


    // Android
    if (Platform.OS !== "ios") {
        let urlForGoogleMaps = getGoogleMapsAddressUrl(geolocation)
        Linking.openURL(urlForGoogleMaps)
    }
    // Apple
    else {
        let urlForAppleMaps = getAppleMapsAddressUrl(geolocation)
        let urlForAppleMapsApplication = getAppleMapsAddressUrl(geolocation, true)
        let appleMapsApplicationIsInstalled = await Linking.canOpenURL(urlForAppleMapsApplication)

        Linking.openURL(appleMapsApplicationIsInstalled ? urlForAppleMapsApplication : urlForAppleMaps)

    }


}


export async function copyString(value: string, dispatch: Dispatch<AnyAction>) {

    Clipboard.setString(value)
    dispatch(updateUiStateValue({ attribute: "slidingAlertType", value: "copied_alert" }))

}


export async function shareAddress(geolocation: Geolocation) {

    try {
        let shareResponse = await Share.open({
            title: getAddressDescription(geolocation),
            url: Platform.OS === "ios" ? getAppleMapsAddressUrl(geolocation) : getGoogleMapsAddressUrl(geolocation),
        })

    } catch (error) {
        // alert(error.message);
    }

}


/** Returns the full description of an address (Avenue Foch, Paris, France)
*/
export function getAddressDescription(geolocation?: Geolocation) {
    let street = geolocation?.street ?? ''
    let city = geolocation?.city ?? ''
    let country = geolocation?.country ?? ''


    let streetNotEmpty = street !== ''
    let cityNotEmpty = city !== ''
    let countryNotEmpty = country !== ''


    // 3 values
    if (streetNotEmpty && cityNotEmpty && countryNotEmpty) {
        return street + ', ' + city + ', ' + country
    }


    // 2 values 
    else if (streetNotEmpty && cityNotEmpty) {
        return street + ', ' + city
    }
    else if (street !== '' && countryNotEmpty) {
        return street + ', ' + country
    }
    else if (cityNotEmpty && countryNotEmpty) {
        return city + ', ' + country
    }


    // 1 value
    else if (street !== '') {
        return street
    }
    else if (cityNotEmpty) {
        return city
    }
    else if (countryNotEmpty) {
        return country
    }


    // No value
    else return ''
}


/** Returns a simplified description of an address (Avenue Foch, Paris) -> Only the street and the city are mentioned
*/
export function simpleAddressDescription(geolocation: Geolocation) {
    if (geolocation.street !== "") {
        return geolocation.street + ', ' + geolocation.city
    }

    return geolocation.city

}


/**
  lat: 13.3769, lng: 52.5161 returns 'u33db2' (6 digits long geohash by default).
*/
export function getGeohash(latitude: number, longitude: number, geohashLenght: number = 6) {
    const coordinates = { lat: latitude, lng: longitude };

    return geokit.hash(coordinates).slice(0, geohashLenght)
}


export function getGoogleMapsAddressUrl(geolocation: Geolocation) {

    const utf8_address = convertAddressToUtf8(geolocation)
    return `https://www.google.com/maps/search/?api=1&query=${utf8_address}`

}


export function getAppleMapsAddressUrl(geolocation: Geolocation, applicationVersion = false) {

    const utf8_address = convertAddressToUtf8(geolocation)
    return applicationVersion ? `maps:?q=${utf8_address}` : `https://maps.apple.com/?q=${utf8_address}`

}


export function convertAddressToUtf8(geolocation: Geolocation) {

    const utf8_address = encodeURIComponent(`${geolocation.street}+${geolocation.city}+${geolocation.country}`)
    return utf8_address

}






