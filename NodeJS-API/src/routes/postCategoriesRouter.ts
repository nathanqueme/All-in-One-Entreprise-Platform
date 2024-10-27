//
//  postCategoriesRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import * as postCategoriesController from '../controllers/postCategoriesController'
const router = express.Router()


/* GET the post categories */
router.get('/', postCategoriesController.get)
  
/* POST the post category */
router.post('/', postCategoriesController.create)

/* PUT the post category */
router.put('/', postCategoriesController.update)

/* DELETE the post category */
router.delete('/', postCategoriesController.remove)


export default router