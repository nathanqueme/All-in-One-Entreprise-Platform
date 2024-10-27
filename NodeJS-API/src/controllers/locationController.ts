//
//  locationController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj } from '../data'
import { geocodeAddress } from '../services/location'


interface geocodeQueryInterface {
    text?: string
}
export async function geocode(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as geocodeQueryInterface
        const { text } = query
        if (text === undefined || (text ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await geocodeAddress(text)
        return res.json(response)

    } catch (err: any) {
        next(err)
    }
}