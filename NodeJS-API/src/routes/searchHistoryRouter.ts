//
//  searchHistoryRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import * as searchHistoryController from '../controllers/searchHistoryController'
const router = express.Router()


/* GET the search history */
router.get('/', searchHistoryController.get)
  
/* POST the search history */
router.post('/', searchHistoryController.create)

/* DELETE the search history */
router.delete('/', searchHistoryController.remove)


export default router