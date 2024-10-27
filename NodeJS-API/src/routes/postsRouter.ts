//
//  postsRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import * as postsController from '../controllers/postsController'
const router = express.Router()


/* GET the posts */
router.get('/', postsController.get)
  
/* POST the post */
router.post('/', postsController.create)

/* DELETE the post */
router.delete('/', postsController.remove)


export default router