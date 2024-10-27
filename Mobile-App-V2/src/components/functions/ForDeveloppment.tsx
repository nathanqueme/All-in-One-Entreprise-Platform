//
//  ForDeveloppment.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

import { translateText } from '../../aws/translate'
import { capitalize, getBase64 } from './../functions'


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
    let blob: Blob = undefined

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



