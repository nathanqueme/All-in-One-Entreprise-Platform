//
//  searchRouter.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { searchAccountsMainData } from '../services/dynamodb'
import { Error400Obj } from '../utils'

interface getQueryInterface {
    q?: string 
    with_username?: string  
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as getQueryInterface
        const q = query["q"]
        const with_username = query["with_username"] ? query["with_username"] === "true" : undefined

        if (q === undefined) return res.status(400).json(Error400Obj())

        const searchResults = await searchAccountsMainData(q, with_username)
        return res.json(searchResults)
    } catch (err: any) {
        console.error(`Error while getting searchHistory`, err.message);
        next(err)
    }
}