//
//  accountsMainDataController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { AccountMainData, CoreErrorObj } from '../data'
import { decrypt, Error400Obj, getJwtTokenHashFromHeader, handleWriteActionErrors } from '../utils'
import { TableName, deleteAccountMainData, getAccountMainData, getAccountMainDataByUsername, putItem, updateAccountMainData } from '../services/dynamodb'


const table_name : TableName = "accountsMainData"


/**
 * REQUIRED :
 * - part 
 * 
 * FILTERS : 
 * - account_id
 * - username
 * 
 * OPTIONAL PARAMETERS
 * ____
 * 
 */
interface getQueryInterface {
    part?: string
    account_id?: string
    username?: string
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {

        let accountMainData: AccountMainData | undefined
        const query = req.query as getQueryInterface
        const part = query["part"]

        if (part === undefined || part === "") return res.status(400).json(Error400Obj())
        const account_id = query["account_id"]

        if (account_id) {
            accountMainData = await getAccountMainData(account_id, part)
        } else {
            let username = query["username"]
            if (username === undefined) return res.status(400).json(Error400Obj())

            username = username.toLowerCase().replace(/\s+/g, '')
            accountMainData = await getAccountMainDataByUsername(username, part)
        }

        if (accountMainData === undefined) return res.status(400).json(CoreErrorObj('notFound (404)', 'accountMainDataNotFound', 'The accountMainData specified in the account_id parameter cannot be found.'))
        return res.json(accountMainData)

    } catch (err: any) {
        next(err)
    }
}


export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        const accountMainData = req.body as AccountMainData | undefined
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || accountMainData === undefined || (accountMainData?.account_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await putItem(table_name, accountMainData, jwt_token)
        res.json(accountMainData)

    } catch (err: any) {
        handleWriteActionErrors(table_name, err, res, next)
    }
}


interface updateQueryInterface {
    account_id?: string
    attribute?: keyof AccountMainData
    value?: any
}
export async function update(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as updateQueryInterface
        const { account_id, attribute, value } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || attribute === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)

        await updateAccountMainData(account_id, attribute, value, jwt_token)
        res.json(`The accountMainData's attribute ${attribute} has been successfully updated to ${value} .`)

    } catch (err: any) {
        handleWriteActionErrors(table_name, err, res, next)
    }
}


interface deleteQueryInterface {
    account_id?: string
}
export async function remove(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as deleteQueryInterface
        const { account_id } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await deleteAccountMainData(account_id, jwt_token)
        res.json("The account main data has been successfully deleted.")

    } catch (err: any) {
        handleWriteActionErrors(table_name, err, res, next)
    }
}