//
//  postsController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj, Post } from '../data'
import { deletePost, putItem, queryPosts } from '../services/dynamodb'
import { decrypt, getJwtTokenHashFromHeader, handleWriteActionErrors } from '../utils'



interface getQueryInterface {
    category_id?: string
    part?: string
    max_results?: string
    load_before_created_date?: string
    hl?: string
}
export async function get(req: Request, res: Response, next: NextFunction) {
    try {

        let posts: Post[]
        const query = req.query as getQueryInterface
        const { category_id, part, load_before_created_date, hl } = query
        const max_results = query["max_results"] ? parseInt(query.max_results ?? 0) : undefined

        if (category_id === undefined || part === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        posts = await queryPosts(category_id, part, max_results, load_before_created_date, hl)
        res.json(posts)

    } catch (err: any) {
        console.error(`Error while getting posts`, err.message);
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {

        const post = req.body as Post | undefined
        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || post === undefined || (post?.account_id ?? "") === "" || (post?.post_id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)
        await putItem("posts", post, jwt_token)
        res.json(post)

    } catch (err: any) {
        handleWriteActionErrors("posts", err, res, next)
    }
}

interface deleteQueryInterface {
    account_id?: string
    post_id?: string 
}
export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as deleteQueryInterface
        const { account_id, post_id } = query

        const jwt_token_hash = await getJwtTokenHashFromHeader(req.headers.authorization ?? "")
        if (jwt_token_hash === undefined || jwt_token_hash.iv === "" || jwt_token_hash.content === "" || account_id === undefined || post_id === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const jwt_token = decrypt(jwt_token_hash)

        await deletePost(account_id, post_id, jwt_token)
        res.json("The post has been successfully deleted.")

    } catch (err: any) {
        handleWriteActionErrors("posts", err, res, next)
    }
}