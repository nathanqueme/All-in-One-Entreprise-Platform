//
//  analyticsController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/15/22
//

import { Request, Response, NextFunction } from 'express'
import { CoreErrorObj, IpAddressInfo } from '../data'
import { AccountView, DeviceInfo, Session } from '../analyticsData'
import { getAccountActivity, getAccountViews, putDataItem, updateAccountsActivity } from '../services/dynamodb'
import { decryptIpInfo, generateID, getIpAddress, handleWriteActionErrors, isDeviceIdValid } from '../utils'


// DEVICES
// (USED ON THE APP)
export async function save_user_device(req: Request, res: Response, next: NextFunction) {
    try {
        const d_body = req.body as DeviceInfo | undefined
        if (d_body === undefined) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        const device = Object.assign({}, d_body)
        if ((d_body?.device_id ?? "") === "") { // WEB VERSION
            let _adid = req.cookies["_adid"]
            let device_id = (((_adid ?? "") !== "") && isDeviceIdValid(_adid)) ? _adid : `f-${generateID(10, true)}.${new Date().valueOf()}` // <- fallback : "f-" (should not happen) 
            device.device_id = device_id
        }
        if ((d_body?.ip ?? "") === "") { // IP
            let ip = getIpAddress(req)
            device.ip = ip
        }

        await putDataItem("userDevices", device)
        res.json(device)
    } catch (err: any) {
        handleWriteActionErrors("userDevices", err, res, next)
    }
}


// SESSIONS
export async function save_session(req: Request, res: Response, next: NextFunction) {
    try {
        const s_body = req.body as Session | undefined
        if (s_body === undefined || (s_body?.id ?? "") === "") return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        const session = Object.assign({}, s_body)
        if ((s_body?.device_id ?? "") === "") { // WEB VERSION
            let _adid = req.cookies["_adid"]
            let device_id = (((_adid ?? "") !== "") && isDeviceIdValid(_adid)) ? _adid : `f-${generateID(10, true)}.${new Date().valueOf()}` // <- fallback : "f-" (should not happen) 
            session.device_id = device_id
        }
        if ((s_body?.ip ?? "") === "") { // IP
            let ip = getIpAddress(req)
            session.ip = ip
        }

        await putDataItem("sessions", session)
        res.json(s_body)
    } catch (err: any) {
        handleWriteActionErrors("sessions", err, res, next)
    }
}


/** Returns user's ip_address*/
export async function init(req: Request, res: Response, next: NextFunction) {
    try {

        // "ip.address.1, ip.address.2" or ["ip.address.1", "ip.address.2"]
        let x_forwarded_for = req?.headers['x-forwarded-for'] ?? null
        let x_forwarded_for_main_ip =
            Array.isArray(x_forwarded_for) ? x_forwarded_for[0]
                :
                (x_forwarded_for ?? "") !== "" ?
                    x_forwarded_for?.split(", ")[0] : null


        res.json({
            "x-forwarded-for": x_forwarded_for_main_ip,
        })

    } catch (err: any) {
        handleWriteActionErrors("sessions", err, res, next)
    }
}


// ACCOUNTS
interface getAccountActivityQueryInterface {
    account_id?: string
    year_month?: string
    part?: string
    jwt_token_enc?: string
}
export async function get_account_activity(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as getAccountActivityQueryInterface
        const { account_id, year_month, part } = query
        // const jwt_token_enc = query.jwt_token_enc ? JSON.parse(query.jwt_token_enc) as Hash : undefined

        if ((account_id === undefined) || (year_month === undefined) || (part === undefined) || (account_id === "") || (year_month === "") || (part === "")) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        // const jwt_token = decrypt(jwt_token_enc)

        let accountActivity = await getAccountActivity(account_id, year_month, part)
        if (accountActivity === undefined) return res.status(400).json(CoreErrorObj('notFound (404)', 'accountActivityNotFound', 'The account activity specified in the account_id parameter cannot be found.'))
        res.json(accountActivity)

    } catch (err: any) {
        handleWriteActionErrors("accountsActivity", err, res, next)
    }
}

interface updateAccountActivityQueryInterface {
    account_id?: string
    year_month?: string
    v?: number
}
export async function update_account_activity(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as updateAccountActivityQueryInterface
        const { account_id, year_month } = query
        const v = Number(query.v ?? "1")

        if ((account_id === undefined) || (year_month === undefined) || (v === undefined) || (account_id === "") || (year_month === "")) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        await updateAccountsActivity(account_id, year_month, v)
        res.json("Successfully updated account's activity.")

    } catch (err: any) {
        handleWriteActionErrors("accountsActivity", err, res, next)
    }
}


interface getAccountViewsQueryInterface {
    account_id?: string
    year_month?: string
    part?: string
    jwt_token_enc?: string
    max_results?: string
}
export async function get_account_views(req: Request, res: Response, next: NextFunction) {
    try {

        const query = req.query as getAccountViewsQueryInterface
        const { account_id, year_month, part } = query
        // const jwt_token_enc = query.jwt_token_enc ? JSON.parse(query.jwt_token_enc) as Hash : undefined
        const max_results = query["max_results"] ? parseInt(query.max_results ?? 0) : undefined

        if ((account_id === undefined) || (year_month === undefined) || (part === undefined) || (account_id === "") || (year_month === "") || (part === "")) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))
        // const jwt_token = decrypt(jwt_token_enc) || (jwt_token_enc === undefined)

        let accountViews = await getAccountViews(account_id, year_month, part, max_results)
        res.json(accountViews)

    } catch (err: any) {
        handleWriteActionErrors("accountsViews", err, res, next)
    }
}
export async function save_account_views(req: Request, res: Response, next: NextFunction) {
    try {

        const a_v_body = req.body as AccountView | undefined
        let _eii = req.cookies["_eii"]
        let ip = getIpAddress(req)
        if (a_v_body === undefined || ((a_v_body?.account_id ?? "") === "") || ((a_v_body?.viewing_date ?? "") === "")) return res.status(400).json(CoreErrorObj("badRequest (400)", "missingRequiredParameter", "The request is missing a required parameter."))

        const accountView = Object.assign({}, a_v_body)

        // DEVICE ID (WEB)
        if ((a_v_body?.device_id ?? "") === "") {
            let _adid = req.cookies["_adid"]
            let device_id = (((_adid ?? "") !== "") && isDeviceIdValid(_adid)) ? _adid : `f-${generateID(10, true)}.${new Date().valueOf()}` // <- fallback : "f-" (should not happen) 
            accountView.device_id = device_id
        }
        // IP (WEB + APP)
        if ((a_v_body?.ip ?? "") === "") {
            accountView.ip = ip
        }
        // IP INFO
        if (((accountView.country ?? "") === "") || ((accountView.city ?? "") === "")) {

            // cookie (WEB)
            let ip_info: undefined | IpAddressInfo
            if ((_eii ?? "") !== "") {
                ip_info = decryptIpInfo(_eii)
            } else { // IP FALLBACK (WEB, when profile page open from scratch -> no cookies where set yet)
                ip_info = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IP_INFO_KEY}`).then(e => e.json())
            }
            if (ip_info !== undefined) {
                const country = (ip_info.country ?? "").toLowerCase()
                const city = (ip_info.city ?? "").toLowerCase()
                const coordinates = (ip_info.loc ?? "").split(",").map(e => { return Number(e) })
                // 
                accountView.country = country
                accountView.city = city
                accountView.coordinates = coordinates
            }

        }
        // APP EARLY VERSIONS (~ v1.0.10)
        if ((a_v_body.id ?? "") === "") {
            let id = generateID(6)
            accountView.id = id
        }

        await putDataItem("accountsViews", accountView)
        res.json(a_v_body)

    } catch (err: any) {
        handleWriteActionErrors("accountsViews", err, res, next)
    }
}