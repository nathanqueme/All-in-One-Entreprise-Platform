//
//  authRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/11/22
//

import express from 'express'
import { authController } from '../controllers'
const router = express.Router()


router.post('/sign_up', authController.sign_up)
  
router.post('/sign_up/confirmation', authController.sign_up_confirmation)

router.get('/sign_in', authController.sign_in)

router.get('/refresh_session', authController.refresh_session)

router.get('/sign_out', authController.sign_out)

router.post('/change_password', authController.change_password)

router.get('/send_code', authController.send_code)

router.get('/info/check', authController.check_user_info)

router.post('/info/change', authController.change_user_info)

router.post('/encrypt', authController.encrypt)

router.delete('/delete', authController.delete_user)


export default router