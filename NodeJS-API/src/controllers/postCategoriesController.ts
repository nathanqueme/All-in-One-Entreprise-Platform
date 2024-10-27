//
//  postCategoriesController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj, PostCategoryMetadata } from '../data'
import { deletePostCategoryMetadata, putItem, queryPostCategories, updatePostCategoryIndex, updatePostCategoryPostCount, updatePostCategoryUpdatedDate } from '../services/dynamodb'
import { decrypt, getJwtTokenHashFromHeader, handleWriteActionErrors } from '../utils'



interface getQueryInterface {
    account_id?: string
    part?: string
    max_results?: string
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {

        let postCategories: PostCategoryMetadata[]
        const query = req.query as getQueryInterface
        const { account_id, part } = query
        const max_results = query["max_results"] ? parseInt(query.max_results ?? 0) : undefined


        if (part === undefined || account_id === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        postCategories = await queryPostCategories(account_id, part, max_results)
        return res.json(postCategories)

    } catch (err: any) {
        console.error(`Error while getting postCategories`, err.message);
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        const postCategoryMetadata = req.body as PostCategoryMetadata | undefined
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || postCategoryMetadata === undefined || (postCategoryMetadata?.account_id ?? "") === "" || (postCategoryMetadata?.category_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await putItem("postCategories", postCategoryMetadata, jwt_token)
        res.json(postCategoryMetadata)

    } catch (err: any) {
        handleWriteActionErrors("postCategories", err, res, next)
    }
}


interface updateQueryInterface {
    account_id?: string
    category_id?: string
    operation?: string
    value?: string
    update_date?: string
    c_index?: string
}
export async function update(req: Request, res: Response, next: NextFunction) {
    try {

        let missingParamError = CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter.")

        const query = req.query as updateQueryInterface
        const { account_id, category_id, operation, value, update_date, c_index } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || category_id === undefined) return res.status(400).json(missingParamError)
        const jwt_token = decrypt(jwt_token_hash)

        if (c_index) {
            await updatePostCategoryIndex(account_id, category_id, parseInt(c_index), jwt_token)
        } else if (operation) {
            if (update_date === undefined) return res.status(400).json(missingParamError)
            await updatePostCategoryPostCount(account_id, category_id, operation as any, parseInt(value ?? "0"), update_date, jwt_token)
        } else {
            if (update_date === undefined) return res.status(400).json(missingParamError)
            updatePostCategoryUpdatedDate(account_id, category_id, update_date, jwt_token)
        }
        res.json(`The post category has been successfully updated.`)

    } catch (err: any) {
        handleWriteActionErrors("postCategories", err, res, next)
    }
}

interface deleteQueryInterface {
    account_id?: string
    category_id?: string 
}
export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as deleteQueryInterface
        const { account_id, category_id } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || category_id === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)

        await deletePostCategoryMetadata(account_id, category_id, jwt_token)
        res.json("The post category has been successfully deleted.")

    } catch (err: any) {
        handleWriteActionErrors("postCategories", err, res, next)
    }
}