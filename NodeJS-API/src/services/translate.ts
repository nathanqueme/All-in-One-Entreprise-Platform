//
//  translate.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { translateClient } from '../configs/translate-client-config'
import { TranslateTextCommand } from '@aws-sdk/client-translate'


/** */
export function translateText(text: string, source_hl: string, hl: string) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            let commandInput = {
                Text: text,
                SourceLanguageCode: source_hl, 
                TargetLanguageCode: hl
            }
            
            if ((text ?? "") === "") reject("Translation error : empty input text")
            const result = await translateClient.send(
                new TranslateTextCommand(commandInput)
            )
            resolve(result?.TranslatedText ?? "")

        } catch (error) {
            reject(error)
        }
    })
}
