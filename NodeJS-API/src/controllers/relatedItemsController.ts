//
//  relatedItemsController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj, RelatedItem } from '../data'
import { deleteRelatedItem, putItem, queryRelatedItemByItemId, queryRelatedItems } from '../services/dynamodb'
import { decrypt, getJwtTokenHashFromHeader, handleWriteActionErrors } from '../utils'

interface getQueryInterface {
    account_id?: string
    part?: string
    max_results?: string
    load_before_created_date?: string
    item_id?: string
    hl?: string
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {

        const query: getQueryInterface = req.query
        const { account_id, part, load_before_created_date, item_id, hl } = query
        const max_results = query.max_results ? parseInt(query.max_results) : undefined

        if (account_id === undefined || part === undefined) return res.status(400).json(CoreErrorObj('badRequest (400)', 'missingRequiredParameter', "The request is missing a required parameter."))
        if (item_id) {
            let item = await queryRelatedItemByItemId(account_id, item_id, part, hl)
            if (item === undefined) return res.status(400).json(CoreErrorObj('badRequest (400)', 'relatedItemNotFound', "The related item specified with the item_id parameter cannot be found."))
            return res.json(item)
        } else {
            let items = await queryRelatedItems(account_id, part, max_results, load_before_created_date, hl)
            return res.json(items ?? [])
        }

    } catch (err: any) {
        console.error(`Error while getting relatedItems`, err.message);
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        const relatedItem = req.body as RelatedItem | undefined
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || relatedItem === undefined || (relatedItem?.account_id ?? "") === "" || (relatedItem?.item_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await putItem("relatedItems", relatedItem, jwt_token)
        res.json(relatedItem)

    } catch (err: any) {
        handleWriteActionErrors("relatedItems", err, res, next)
    }
}

interface deleteQueryInterface {
    account_id?: string
    created_date?: string
}
export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as deleteQueryInterface
        const { account_id, created_date } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || created_date === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await deleteRelatedItem(account_id, created_date, jwt_token)
        res.json("The related item has been successfully deleted.")

    } catch (err: any) {
        handleWriteActionErrors("relatedItems", err, res, next)
    }
}