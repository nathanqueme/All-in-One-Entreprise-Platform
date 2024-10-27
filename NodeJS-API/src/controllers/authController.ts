//
//  authController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/10/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj } from '../data'
import { confirmSignUp, deleteUser, initiateChangingForgottenPassword, refreshUserSession, sendConfirmationCode, signInUser, signOutUser, signUpUser, updateForgottenPassword, updatePassword, updateUserPoolAttribute, UserAttribute, verifyAttribute } from '../services/cognito'
import { handleCognitoErrors } from '../utils'



interface signUpQueryInterface {
    username?: string
    enc_password?: string
    email?: string
    formatted_phone_mumber?: string
}
export async function sign_up(req: Request, res: Response, next: NextFunction) {
    try {

        const { username, enc_password, email, formatted_phone_mumber } = req.query as signUpQueryInterface
        if (username === undefined || enc_password === undefined || email === undefined || formatted_phone_mumber === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const password = enc_password // "TODO"
        let response = await signUpUser(username, password, email, formatted_phone_mumber)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface signUpConfirmationQueryInterface {
    username?: string
    code?: string
}
export async function sign_up_confirmation(req: Request, res: Response, next: NextFunction) {
    try {

        const { username, code } = req.query as signUpConfirmationQueryInterface
        if (username === undefined || code === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        let response = await confirmSignUp(username, code)
        res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface signInQueryInterface {
    username?: string
    enc_password?: string
}
export async function sign_in(req: Request, res: Response, next: NextFunction) {
    try {

        const { username, enc_password } = req.query as signInQueryInterface
        if (username === undefined || enc_password === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        const password = enc_password // "TODO"
        let response = await signInUser(username, password)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface refreshSessionQueryInterface {
    username?: string
    refresh_token?: string
}
export async function refresh_session(req: Request, res: Response, next: NextFunction) {
    try {

        const { username, refresh_token } = req.query as refreshSessionQueryInterface
        if (username === undefined || refresh_token === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await refreshUserSession(username, refresh_token)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface signOutQueryInterface {
    username?: string
}
export async function sign_out(req: Request, res: Response, next: NextFunction) {
    try {

        const { username } = req.query as signOutQueryInterface
        if (username === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await signOutUser(username)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface changePasswordQueryInterface {
    username?: string
    verification_code?: string
    enc_old_password?: string
    enc_new_password?: string
}
export async function change_password(req: Request, res: Response, next: NextFunction) {
    try {

        const { username, verification_code, enc_old_password, enc_new_password } = req.query as changePasswordQueryInterface
        if (username === undefined || enc_old_password === undefined || enc_new_password === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        const new_password = "TODO"
        const old_password = "TODO"

        let response
        if (verification_code) {
            response = await updateForgottenPassword(username, verification_code, new_password)
        } else if (old_password) {
            response = await updatePassword(old_password, new_password)
        } else {
            response = await initiateChangingForgottenPassword(username)
        }

        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface sendCodeQueryInterface {
    username?: string
}
export async function send_code(req: Request, res: Response, next: NextFunction) {
    try {

        const { username } = req.query as sendCodeQueryInterface
        if (username === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await sendConfirmationCode(username)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface checkUserInfoQueryInterface {
    user_attribute?: UserAttribute
    code?: string
}
export async function check_user_info(req: Request, res: Response, next: NextFunction) {
    try {

        const { user_attribute, code } = req.query as checkUserInfoQueryInterface
        if (user_attribute === undefined || code === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await verifyAttribute(user_attribute, code)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}


interface changeUserInfoQueryInterface {
    user_attribute?: UserAttribute
    code?: string
}
export async function change_user_info(req: Request, res: Response, next: NextFunction) {
    try {

        const { user_attribute, code } = req.query as changeUserInfoQueryInterface
        if (user_attribute === undefined || code === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await updateUserPoolAttribute(user_attribute, code)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}

// text: string 
export function encrypt(req: Request, res: Response, next: NextFunction) {
  return res.json("abc")
}


interface deleteUserInfoQueryInterface {
    username?: string
}
export async function delete_user(req: Request, res: Response, next: NextFunction) {
    try {

        const { username } = req.query as deleteUserInfoQueryInterface
        if (username === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        let response = await deleteUser(username)
        return res.json(response)

    } catch (err: any) {
        handleCognitoErrors(err, res, next)
    }
}

