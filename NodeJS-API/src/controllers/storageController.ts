// 
// storageController.ts
// atsight_apis
//
//  Created by Nathan Queme the 10/09/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj } from '../data'
import { deleteContent, getContent, putContent } from '../services/s3'
import { ResourceType } from '../types'
import { decrypt, getJwtTokenHashFromHeader, handleS3Errors } from '../utils'


interface getContentQueryInterface {
    resource_type?: ResourceType
    short_id?: string
    item_id?: string
    is_menu_pdf?: string
}
export async function get_content(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as getContentQueryInterface
        const { resource_type, short_id, item_id } = query
        const isMenuPdf = query.is_menu_pdf === "true"
        if (resource_type === undefined || short_id === undefined || (short_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await getContent(resource_type, short_id, item_id, isMenuPdf)
        res.json(response)

    } catch (err: any) {
        handleS3Errors(err, res, next)
    }
}


interface putContentQueryInterface {
    resource_type?: ResourceType
    short_id?: string
    item_id?: string
    is_menu_pdf?: string
}
export async function put_content(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as putContentQueryInterface
        const { resource_type, short_id, item_id } = query
        const is_menu_pdf = query.is_menu_pdf === "true"
        const base64 = req.body.base64 // body: JSON.stringify({ "base64": "..." })
   
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (resource_type === undefined || short_id === undefined || base64 === undefined || jwt_token_hash === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)

        await putContent(jwt_token, base64, resource_type, short_id, item_id, is_menu_pdf)
        res.json("Content successfully uploaded")

    } catch (err: any) {
        handleS3Errors(err, res, next)
    }
}


interface deleteContentQueryInterface {
    file_name?: string
}
export async function delete_content(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as deleteContentQueryInterface
        const { file_name } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || file_name === undefined || file_name === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        
        await deleteContent(jwt_token, file_name)
        res.json("Content successfully deleted")

    } catch (err: any) {
        handleS3Errors(err, res, next)
    }
}