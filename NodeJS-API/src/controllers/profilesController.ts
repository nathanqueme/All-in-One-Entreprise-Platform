//
//  profilesController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj, Profile } from '../data'
import { MathematicalOperation } from '../types'
import { deleteProfile, getProfile, putItem, queryProfileByEmail, updateProfile, updateProfileWithOperation } from '../services/dynamodb'
import { decrypt, getJwtTokenHashFromHeader, handleWriteActionErrors } from '../utils'


interface getQueryInterface {
    account_id?: string
    part?: string
    email?: string
    hl?: string
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {

        let profile: Profile | undefined
        const query: getQueryInterface = req.query
        const { account_id, part, email, hl } = query

        if (part === undefined) return res.status(400).json(CoreErrorObj('badRequest (400)', 'missingRequiredParameter', "The request is missing a required parameter."))
        if (email !== undefined && email !== "") {
            profile = await queryProfileByEmail(email, part, hl)
        } else if (account_id !== undefined) {
            profile = await getProfile(account_id, part, hl)
        }

        if (profile === undefined) return res.status(400).json(CoreErrorObj('notFound (404)', 'profileNotFound', 'The profile specified in the account_id parameter cannot be found.'))
        return res.json(profile)

    } catch (err: any) {
        console.error(`Error while getting profiles`, err.message)
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        const profile = req.body as Profile | undefined
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || profile === undefined || (profile.account_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await putItem("profiles", profile, jwt_token)
        res.json(profile)

    } catch (err: any) {
        handleWriteActionErrors("profiles", err, res, next)
    }
}

interface updateQueryInterface {
    account_id?: string
    attribute?: keyof Profile
    value?: any
    operation?: string
}
export async function update(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as updateQueryInterface
        const { account_id, attribute, operation } = query
        let value

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || attribute === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)

        if (operation) {
            value = parseInt(query?.value ?? "0")
            await updateProfileWithOperation(account_id, attribute, operation as MathematicalOperation, value, jwt_token)
        } else {
            value = query?.value
            await updateProfile(account_id, attribute, value, jwt_token)
        }
        res.json(`The profile's attribute ${attribute} has been successfully updated ${operation ? "by" : "to"} ${value} .`)

    } catch (err: any) {
        handleWriteActionErrors("profiles", err, res, next)
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
        await deleteProfile(account_id, jwt_token)
        res.json("The profile has been successfully deleted.")

    } catch (err: any) {
        handleWriteActionErrors("profiles", err, res, next)
    }
}