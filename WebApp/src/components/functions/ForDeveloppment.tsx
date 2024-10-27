//
//  ForDeveloppment.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from "react"
import { translateText } from '../../aws/translate'
import { capitalize, getBase64 } from '.'
import { AccountMainDataObj, GeolocationObj, ImageDataObj, LinkObj, PhoneNumberObj, ProfileObj, TimetablesObj } from "../../Data"
import { generateDefaultDailyTimetables } from "./TimeRelated"




// These functions are only designed for developpment purposes.



/**
 *  logs the translation of each provided string 
*/
export async function logBatchTranslationInDevelopment(arrayOfObjectsKeysOrText: any[]) {



    /*
    let translations = arrayOfKeysOrText
    let translatedAmount = 0
    Object.keys(arrayOfKeysOrText).forEach(async (key: string) => {

        let textToTranslate = arrayOfKeysOrText[key]


        let translation = await translateText(textToTranslate, "en", "fr")
        

        // Translate items by preserving their order
        arrayOfKeysOrText
        translations[key] = translation
        translatedAmount += 1

        if (translatedAmount === Object.keys(arrayOfKeysOrText).length) {
            Object.keys(translations).forEach(key => {
                console.log(`${key} : "${translations[key]}",`)
            })
        }

    })
    */




    let translations = arrayOfObjectsKeysOrText
    let translatedAmount = 0
    arrayOfObjectsKeysOrText.forEach(async (e, index) => {
        let textToTranslate = e.name
        let translation = await translateText(textToTranslate, "en", "it")
        translations[index].name = translation


        translatedAmount += 1
        if (translatedAmount === arrayOfObjectsKeysOrText.length) {
            arrayOfObjectsKeysOrText.forEach(e => {
                console.log(`{name: "${capitalize(e.name)}", locale: "${e.locale}" },`)
            })
        }

    })


















    // let translationRepsonse = {}
    // arrayOfKeysOrText.forEach(async (element) => {

    // Elements may be types like : 'biking_tracks'
    // ---> transform them into 'Biking tracks'
    // let textToTranslate = element.slice()
    // textToTranslate = textToTranslate.replace(/_/g, " ")
    // textToTranslate = capitalize(textToTranslate)


    // let translation = await translateText(textToTranslate, "en", "en")


    // translationRepsonse[element] = translation


    // console.log(`"${element}" : "${translation}",`)
    // })

}


/**
 * 
 * Upload a photo on firbase storage and pass its url here to get its base64.
 * 
 */
export async function logStaticImageBase64(image_url_on_server: string) {
    let blob = new Blob()

    try {
        let response = await fetch(image_url_on_server)
        blob = await response.blob()
    } catch (error) {
        alert(error)
    }


    try {
        let base64 = await getBase64(blob)
        console.log(base64)
    } catch (error) {
        alert(error)
    }



}





export function getDummyProfile() {
    let dailyTimetables = generateDefaultDailyTimetables()
    return ProfileObj("", ["map", "menu"], ["map", "menu"], 0, "george6paris@gmail.com", [LinkObj("Website", "https://www.fourseasons.com/paris/")], PhoneNumberObj("0671826060", "FR", "33"), [], 0, 0, 0, TimetablesObj("opening_hours", dailyTimetables), { "en": "Description here..." }, { "fr": "Description ici ..." })
}


export function getDummyAccountMainData() {
    return AccountMainDataObj("", "", "George 6 Paris", "george6paris", "george6paris", "hotel", false, false, GeolocationObj("Paris", "France", "FR", "Ile de france", "31 Avenue Georges 6", "78000", 31.000, 1.222), ImageDataObj("", 1))
}


