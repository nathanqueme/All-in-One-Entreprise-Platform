//
//  UrlRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//
// @ts-check


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
