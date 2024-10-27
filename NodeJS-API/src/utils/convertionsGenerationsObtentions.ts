//
//  convertionsgenerationsObtentions.ts
//  atsight_apis
//
//  Created by Nathan Queme the 11/02/22
//

import CryptoJS from 'crypto-js'
import { Request } from 'express'
import { IpAddressInfo } from '../data'


export function generateID(length: number, onlyNumbers = false) {
  var result = ''
  var characters = onlyNumbers ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength))
  }

  return result
}


/**
 * Returns user's ip address.
 * n.b. : won't work when used via the localhost:3000
*/
export function getIpAddress(req: Request) {


  // req?.headers['x-forwarded-for'] = "ip.address.1, ip.address.2" or ["ip.address.1", "ip.address.2"]
  let x_forwarded_for = req?.headers['x-forwarded-for'] ?? null
  let ip =
    Array.isArray(x_forwarded_for) ? x_forwarded_for[0]
      :
      (x_forwarded_for ?? "") !== "" ?
        x_forwarded_for?.split(", ")[0] : null

  return ip ?? ""
}



export function containsOnlyNumbers(str: string) {
  return /^\d+$/.test(str);
}


export function isDeviceIdValid(device_id?: string) {
  if ((device_id === "") || (device_id === undefined)) return
  let parts = device_id.split(".")
  if (((parts?.length ?? 0) < 2) || (parts[0].length !== 10)) { return false }
  return (containsOnlyNumbers(parts[0])) && (containsOnlyNumbers(parts[1]))
}


export const IP_OBSCURIFICATION_KEY = 'ip info obscurification 2xBc7j' // <- voluntarily insecure

export function decryptIpInfo(_eii?: string) {
  try {
    var bytes = CryptoJS.AES.decrypt(_eii ?? "", IP_OBSCURIFICATION_KEY)
    var ip_info = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as IpAddressInfo
    return ip_info
  } catch (error) {
    return undefined
  }
}


/**
 * WARNING : may not work, for instance if the user disbles all cookies for instance in Safari.
 */
 export function setCookie(name: string, value: string, expires: number, domain: string) {
  // Adds the tag on production but not on localhost so that cookies can be set
  const secure_tag = process.env.NODE_ENV === 'production' ? "secure;" : ""
  document.cookie = `${name}=${value}; expires=${expires}; domain=${domain} ;path=/; ${secure_tag} `
}