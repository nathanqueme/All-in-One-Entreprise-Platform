//
//  atag.js
//  AtSight version 1.0.0
//
//  Created on 11/06/22.
//
//  @ts-check

// TODO : import { setCookie, getMainDomain, getTopLevelDomain } from '../utils'


// _____________________________________________________
/**
 * 
 * WARNING : may not work, for instance if the user disbles all cookies for instance in Safari.
 * 
 * @param {string} name 
 * @param {string} value 
 * @param {number} expires 
 * @param {string} domain 
 */
 function setCookie(name, value, expires, domain) {
    document.cookie = `${name}=${value}; expires=${expires}; domain=${domain} ;path=/;`
  }

/**
 * 
 * Returns url's top level domain.
 * e.g.: 
 * - "https://atsight.ch" returns "ch"
 * - "https://atsight.fr" returns "fr"
 * 
 * @param {string} url_string
 * 
 */
function getTopLevelDomain(url_string) {
    let url = new URL(url_string) // https://www.atsight.ch/policy/
    let hostname = url.hostname // www.atsight.ch 
    let last_dot_index = hostname.lastIndexOf(".")
    let top_level_domain = hostname.slice(last_dot_index + 1, hostname.length)

    return top_level_domain
}

/**
 * 
 * Returns the main domain from the url.
 * e.g. : 
 * - "https://app.about.atsight.ch" returns "atsight.ch"
 * - "https://www.atsight.fr" returns "atsight.fr"
 * 
 * @param {string} url_string
 * 
*/
function getMainDomain(url_string) {
    let url = new URL(url_string)               // https://www.atsight.ch
    let parts = url.hostname.split(".")         // ["www", "atsight", "ch"]
    let main_domain = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
    return main_domain
}
// _____________________________________________________


let top_level_domain = getTopLevelDomain(window.location.href)
let t_l_d = top_level_domain === "localhost" ? "ch" : top_level_domain


/**
 * Asigns a device_id to the device if not already via a first party HTTP cookie and saves the device info on server. 
*/
fetch(`https://apis.atsight.${t_l_d}/atag?platform=web`, { method: "POST", credentials: "include" }).then(async (e) => {

    var response = await e.json()
    if (response.cookie_set == false) {
        let main_domain = getMainDomain(window.location.href)
        setCookie("_adid", response.data, (365 * 2) * 24 * 60 * 60 * 1000, `.${main_domain}`) // days * hours * minutes * sec * milliseconds
    }

}).catch(e => { console.log(`ERROR: on the atag.js script : ${JSON.stringify(e)}`) })
