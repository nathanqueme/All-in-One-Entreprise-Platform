//
//  errors.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/05/22
//

import { NextFunction, Response } from "express";
import { CoreError, CoreErrorObj } from "../data";
import { TableName } from "../services/dynamodb";
import { ErrorDetail } from "../types";


export function Error400Obj(): CoreError {
    return CoreErrorObj("badRequest (400)", "invalidFilters", "Malformed request syntax")
}

function getInvalidItemIdDetail(table_name: TableName): ErrorDetail {
    switch (table_name) {
        case 'accountsMainData': return "invalidAccountId"
        case 'postCategories': return "invalidCategoryId"
        case 'posts': return "invalidPostId"
        case 'profiles': return "invalidAccountId"
        case 'relatedItems': return "invalidCreatedDate"
        case 'sessions': return "invalidSessionId"
        case 'userDevices': return "invalidDeviceId"
        case 'accountsViews': return "invalidViewId"
        default: return "missingRequiredParameter"
    }
}

function getInvalidItemIdMessage(table_name: TableName) {
    switch (table_name) {
        case 'accountsMainData': return "The specified account_id is already used for an other account."
        case 'postCategories': return "The specified category_id is already used for an other post category."
        case 'posts': return "The specified post_id is already used for an other post."
        case 'profiles': return "The specified account_id is already used for an other profile."
        case 'relatedItems': return "The specified created_date is already used for an other related item."
        case 'sessions': return "The specified session id is already used for an other session."
        case 'userDevices': return "The specified device_id is already used for an other device."
        case 'accountsViews': return "The specified id is already used for an other account view."
        default: return undefined
    }
}

export function handleWriteActionErrors(table_name: TableName, error: any, res: Response, next: NextFunction) {
    if (error.name === "ConditionalCheckFailedException") {
        return res.status(400).json(CoreErrorObj("badRequest (400)", getInvalidItemIdDetail(table_name), getInvalidItemIdMessage(table_name)))
    } else if (error.name === "AccessDeniedException" || error.name === "NotAuthorizedException") {
        return res.status(403).json(CoreErrorObj("forbidden (403)", "forbidden"))
    }
    else {
        return res.status(403).json(CoreErrorObj("unexpectedCondition (500)", "unexpectedCondition", `The server has encountered a situation it does not know how to handle. (${error})`))
    }
}

export function handleS3Errors(error: any, res: Response, next: NextFunction) {
    if (error.Code === "AccessDenied" || error.Code === "NotAuthorizedException") {
        return res.status(403).json(CoreErrorObj("forbidden (403)", "forbidden"))
    } else {
        // console.log(error)
        next(error)
    }
}

export function handleCognitoErrors(error: any, res: Response, next: NextFunction) {
    if (error.code === "NotAuthorizedException") {
        return res.status(403).json(CoreErrorObj("badRequest (400)", "invalidAuthDetails", "The username or password is incorrect."))
    } else {
        // console.log(error.code)
        next(error)
    }
}