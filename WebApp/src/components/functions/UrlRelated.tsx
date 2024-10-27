//
//  UrlRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//
// @ts-check

import React from 'react'


export function getSegmentsFromUrl(url: URL): string[] {
    let pages = url.pathname.trim().split("/")
    return pages.filter(e => e !== "")
}


/**
 * @returns an object with all the params of the current url search.
 * e.g. : https://www.atsight.ch/george6paris/posts?category=123&post=abc/ 
 * @returns -> { "category": 123, "post": "abc" }
 * 
 * (Should work, even on internet explorer)
 */
export function getParamsFromUrl(url: URL): object {

    let params: any = {}

    let href = url.href
    let paramIndex = href.indexOf("?")
    if (paramIndex === -1) return params
    let search = href.slice(paramIndex, href.length)
    // gets an array like : [ "category=123", "post=abc" ] from a string like "?category=123&post=abc/"
    const paramsWithEqualSign = search.replace("?", "").replace("/", "").split("&")

    // Converts "category=123" into { category: 123 }
    paramsWithEqualSign.forEach(e => {
        let paramNameAndValue = e.split("=")
        let name = paramNameAndValue[0]
        let value = paramNameAndValue[1]
        params[name] = value
    })


    return params
}


/**
 * Returns url's top level domain.
 * e.g.: 
 * - "https://atsight.ch" returns "ch"
 * - "https://atsight.fr" returns "fr"
 */
export function getTopLevelDomain(url_string: string) {
    let url = new URL(url_string) // https://www.atsight.ch/policy/
    let hostname = url.hostname // www.atsight.ch 
    let last_dot_index = hostname.lastIndexOf(".")
    let top_level_domain = hostname.slice(last_dot_index + 1, hostname.length)

    return top_level_domain
}


/**
 * Returns url's subdomain.
 * e.g.: 
 * - "https://about.atsight.ch" returns "about" 
 * - "https://apis.atsight.ch" returns "apis"
*/
export function getSubdomain(url_string: string) {

    let url = new URL(url_string) // https://about.atsight.ch/
    let hostname = url.hostname // about.atsight.ch
    let first_dot_index = hostname.indexOf(".")
    let subdomain = hostname.slice(0, first_dot_index).split(".")[0]

    return subdomain
}


/**
 * Returns the main domain from the url.
 * e.g. : 
 * - "https://app.about.atsight.ch" returns "atsight.ch"
 * - "https://www.atsight.fr" returns "atsight.fr"
*/
export function getMainDomain(url_string: string) {
    let url = new URL(url_string)               // https://www.atsight.ch
    let parts = url.hostname.split(".")         // ["www", "atsight", "ch"]
    let main_domain = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
    return main_domain
}
