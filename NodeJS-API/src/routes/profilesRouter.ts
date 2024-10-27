//
//  profilesRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import * as profilesController from '../controllers/profilesController'
const router = express.Router()


/* GET the profile */
router.get('/', profilesController.get)
  
/* POST the profile */
router.post('/', profilesController.create)

/* PUT the profile */
router.put('/', profilesController.update)

/* DELETE the profile */
router.delete('/', profilesController.remove)


export default router