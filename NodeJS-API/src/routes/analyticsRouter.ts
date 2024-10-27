//
//  analyticsRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/15/22
//

import express from 'express'
import { analyticsController } from '../controllers'
const router = express.Router()


router.post('/user', analyticsController.save_user_device)

router.post('/sessions', analyticsController.save_session)

// GLOBAL 
router.post('/init', analyticsController.init) // IP ADDDRESS INFO 

router.get('/accountsActivity', analyticsController.get_account_activity)
router.put('/accountsActivity', analyticsController.update_account_activity)

router.get('/accountsViews', analyticsController.get_account_views)
router.post('/accountsViews', analyticsController.save_account_views)


export default router