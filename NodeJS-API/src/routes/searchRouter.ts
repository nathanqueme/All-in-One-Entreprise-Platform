//
//  searchRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/05/22
//

import express from 'express'
import { searchRouter } from '../controllers'
const router = express.Router()


/* Search AccountsMainData and Cities in the future */
router.get('/', searchRouter.get)


export default router