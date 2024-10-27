//
//  accountsMainDataRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import { accountsMainDataController } from '../controllers'
const router = express.Router()


/* GET the accountMainData */
router.get('/', accountsMainDataController.get)
  
/* POST the accountMainData */
router.post('/', accountsMainDataController.create)

/* PUT the accountMainData */
router.put('/', accountsMainDataController.update)

/* DELETE the accountMainData */
router.delete('/', accountsMainDataController.remove)


export default router