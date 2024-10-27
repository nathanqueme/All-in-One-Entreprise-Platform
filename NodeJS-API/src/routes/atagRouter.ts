//
//  atagRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/03/22
//

import express from 'express'
import { atagController } from '../controllers'
const router = express.Router()


router.post('/', atagController.registerDevice)
router.get('/iInfo', atagController.getIpInfo)
// router.post('/test', atagController.test)

export default router