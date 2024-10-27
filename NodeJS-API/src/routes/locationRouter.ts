//
//  locationRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import express from 'express'
import { locationController } from '../controllers'
const router = express.Router()


/* GEOCODE the specified address */
router.get('/geocode', locationController.geocode)


export default router