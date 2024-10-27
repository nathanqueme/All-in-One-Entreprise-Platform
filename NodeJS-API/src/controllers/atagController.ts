//
//  atagController.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/03/22
//

import CryptoJS from 'crypto-js'
import { Request, Response } from 'express'
import { decryptIpInfo, generateID, getIpAddress, IP_OBSCURIFICATION_KEY, isDeviceIdValid } from '../utils'
import { DeviceInfoObj, PlatformType } from '../analyticsData'
import { putDataItem } from '../services/dynamodb'


// DEVICE ID (WEB)
export async function registerDevice(req: Request, res: Response) {

    let _adid: string | undefined = req.cookies["_adid"];
    if (((_adid ?? "") === "") || (!isDeviceIdValid(_adid))) { // REGISTER DEVICE

        // DEVICE INFO
        const new_device_id = `${generateID(10, true)}.${new Date().valueOf()}` // Timestamp : https://stackoverflow.com/a/221297
        const registration_date = new Date().toISOString()
        const platform = req.query["platform"] as PlatformType
        const ip = getIpAddress(req)
        const user_agent = req.headers["user-agent"]
        const device_info = DeviceInfoObj(new_device_id, registration_date, platform, ip, undefined, undefined, undefined, user_agent)

        // WILL SET A FIRST PARTY HTTP COOKIE, CLIENT-SIDE
        res.json({ cookie_set: false, data: new_device_id })

        // SAVES INFO ON SERVER 
        putDataItem("userDevices", device_info).catch(e => { })

    } else { // DEVICE WAS ALREADY REGISTERED
        res.json({ cookie_set: true, data: _adid })
    }

}


// IP INFO (APP + WEB)
export async function getIpInfo(req: Request, res: Response) {

    const encrypted = req.query["encrypted"] ? (req.query["encrypted"] === "true") : true
    const current_ip = getIpAddress(req)
    const encrypted_ip_info = req.cookies["_eii"]
    const ip_info = ((encrypted_ip_info ?? "") !== "") ? decryptIpInfo(encrypted_ip_info) : undefined

    if ((ip_info?.ip ?? "") !== current_ip) {
        const new_ip_info = await fetch(`https://ipinfo.io/${current_ip}?token=${process.env.IP_INFO_KEY}`).then(e => e.json())
        const new_encrypted_ip_info = encrypted ?
            CryptoJS.AES.encrypt(JSON.stringify(new_ip_info), IP_OBSCURIFICATION_KEY).toString()
            :
            new_ip_info
        res.json({ cookie_set: false, data: new_encrypted_ip_info })
    } else {
        res.json({ cookie_set: true, data: encrypted_ip_info })
    }

}


export async function test(req: Request, res: Response) {

    let body = req.body
    let cookies = req.cookies
    console.log(`\n\nBODY: ${JSON.stringify(body["referrer"])}   ${JSON.stringify(cookies)}`)
    res.json("LAMBO")

}

// (THIRD PARTY COOKIE / TRACKING COOKIE) 
// THIS CODE IS JUST FOR TESTS AND LEARNING.
/**
 * Attach a "device_id" to the device via a cookie and refreshes it when it expired.
 */
/*
export async function registerDeviceTest(req: Request, res: Response) {

    // _adid : Atsight Device Id (The name is long so that it is not used by anyone else)
    let sameSite = req.query.same_site as any
    let _adid = req.cookies._adid

    // console.log(_adid)
    let user_agent = req.headers["user-agent"]

    //console.log(_adid)
    //res.json("OK")
    // return

    if (_adid) {
        res.json("ATAG ALREADY SETUP")
    } else {
        // N.B. : set "withCredentials" to true on FETCH (client-side) so that cookies are passed.
        // Timestamp : https://stackoverflow.com/a/221297
        const new_adid = `${generateID(8, true)}.${new Date().valueOf()}`
        // WARNING : doesn't work in Safari, even when Preferences > Privacy > Prevent cross-site tracking is disabled.
        res.cookie("_adid", new_adid, {
            maxAge: 15 * 1000, // (365 * 2) * 24 * 60 * 60 * 1000, // days * hours * minutes * sec * milliseconds
            path: "/",
            //httpOnly: true, 
            sameSite: "none", // doesn't work in Safari when Preferences > Privacy > Prevent cross-site tracking is enabled
            secure: true // P.S: is needed when "sameSite": "none"
        })
        res.json("ATAG SETUP")
    }
   

}
 */