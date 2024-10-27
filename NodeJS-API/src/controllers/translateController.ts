//
//  translateController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/08/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj } from '../data'
import { detectMainLanguageLocale } from '../services/comprehend'
import { translateText } from '../services/translate'


interface detectTextLanguageQueryInterface {
    text?: string
    source_hl?: string
    hl?: string
}
export async function translate_text(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as detectTextLanguageQueryInterface
        const { text, source_hl, hl } = query
        if (text === undefined || source_hl === undefined || hl === undefined || (text ?? "") === "" || (source_hl ?? "") === "" || (hl ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let translated_text = await translateText(text, source_hl, hl)
        res.json(translated_text)
    } catch (err: any) {
        // Responseconsole.log(err)
        next(err)
    }
}


interface detectTextLanguageQueryInterface {
    text?: string
}
export async function detect_text_language(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as detectTextLanguageQueryInterface
        const { text } = query
        if (text === undefined || (text ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let hl = await detectMainLanguageLocale(text)
        res.json(hl)
    } catch (err: any) {
        next(err)
    }
}

