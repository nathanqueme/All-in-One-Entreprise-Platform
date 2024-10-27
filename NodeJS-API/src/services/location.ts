//
//  location.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { SearchForTextResult, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location"
import { locationClient } from '../configs/location-client-config'


// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-location/interfaces/searchplaceindexfortextcommandinput.html
interface GeocodingResult {
    iso: string
    zip: string
    region: string
    longitude: number
    latitude: number
}
// Returns locations data from an address (street + city + country)
export function geocodeAddress(text: string): Promise<GeocodingResult> {
    return new Promise(async (resolve, reject) => {

        const params = {
            IndexName: "explore.place",
            Text: text,
            MaxResults: 1,
        }
        const command = new SearchPlaceIndexForTextCommand(params);

        try {
            const response = await locationClient.send(command)
            const firstResult = (response.Results ? response.Results[0] : {}) as SearchForTextResult
            if (firstResult.Place === undefined) {
                resolve({ iso: "", zip: "", region: "", longitude: 0, latitude: 0 })
                return
            } else {
                const { Country, PostalCode, Region, Geometry } = firstResult.Place
                let point = Geometry?.Point ?? [0, 0]
                // 
                let lng = String(point[0])
                let lat = String(point[1])
                const longitude = Number(lng.slice(0, lng.indexOf('.') + 6)) // Fixes to 5 digits after decimals without rounding 1.2779519806047688 becomes 1.27779 and not 1.2778
                const latitude = Number(lat.slice(0, lat.indexOf('.') + 6))
                // 
                resolve({ iso: Country ?? "", zip: PostalCode ?? "", region: Region ?? "", longitude: longitude, latitude: latitude })

            }

        } catch (error) {
            reject(error)
        }
    })
}