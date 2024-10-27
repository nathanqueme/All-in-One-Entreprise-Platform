//
//  translateRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import { translateController } from '../controllers'
const router = express.Router()


/* GET the translation for the provided text in the specified language */
router.get('/translate_text', translateController.translate_text)

/* GET the text's language */
router.get('/detect_text_language', translateController.detect_text_language)


export default router