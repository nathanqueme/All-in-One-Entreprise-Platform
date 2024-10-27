//
//  comprehend.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { comprehendClient } from '../configs/comprehend-client-config'
import { DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend'


/** 
 * Detects the language the provided text is written. 
 * If multiple languages are detected the one with the highest score is used.
 * 
 * @returns the language's code e.g. : 'fr' for French.
 *  
 */
export function detectMainLanguageLocale(text: string) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await comprehendClient.send(
                new DetectDominantLanguageCommand({
                    Text: text
                })
            )
 
            let mainLanguageLocale = (result?.Languages ?? [])[0].LanguageCode ?? ""
            resolve(mainLanguageLocale)

        } catch (error) {
            reject(error)
        }
    })
}
