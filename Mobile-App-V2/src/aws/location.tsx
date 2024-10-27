//
//  location.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { SearchForTextResult, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location"
import { locationClient } from './configs/location-client-config'



//  https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-location/interfaces/searchplaceindexfortextcommandinput.html
interface GeocodingResult {
    iso: string
    zip: string
    region: string
    longitude: number
    latitude: number
}
// Returns locations data from an address (street + city + country)
export function geocodeAddress(search: string): Promise<GeocodingResult> {
    return new Promise(async (resolve, reject) => {

        const params = {
            IndexName: "explore.place",
            Text: search,
            MaxResults: 1,
        }
        const command = new SearchPlaceIndexForTextCommand(params);



        try {
            const response = await locationClient.send(command)
            const firstResult = (response.Results?[0] : {}) as SearchForTextResult
            if (firstResult.Place === undefined) {
                resolve({ iso: "", zip: "", region: "", longitude: 0, latitude: 0 })
                return
            } else {
                const { Country, PostalCode, Region, Geometry } = firstResult.Place
                let point = Geometry?.Point ?? [0, 0]
                // 
                let lng = String(point[0])
                let lat = String(point[1])
                const longitude = Number(lng.slice(0, lng.indexOf('.') + 5)) // Fixes to 4 digits after decimals without rounding 1.2779519806047688 becomes 1.2779 and not 1.278
                const latitude = Number(lat.slice(0, lat.indexOf('.') + 5))
                // 
                resolve({ iso: Country ?? "", zip: PostalCode ?? "", region: Region ?? "", longitude: longitude, latitude: latitude })

            }

        } catch (error) {
            reject(error)
        }

    })
}