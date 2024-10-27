//
//  relatedItemsRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import * as relatedItemsController from '../controllers/relatedItemsController'
const router = express.Router()


/* GET the related items */
router.get('/', relatedItemsController.get)
  
/* POST the related item */
router.post('/', relatedItemsController.create)

/* DELETE the related item */
router.delete('/', relatedItemsController.remove)


export default router