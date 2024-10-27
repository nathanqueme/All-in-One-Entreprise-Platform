//
//  storageRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/09/22
//

import express from 'express'
import * as storageController from '../controllers/storageController'
const router = express.Router()

  
/* GET the specified content */
router.get('/', storageController.get_content)

/* POST the specified content */
router.post('/', storageController.put_content)

/* DELETE the specified content */
router.delete('/', storageController.delete_content)


export default router