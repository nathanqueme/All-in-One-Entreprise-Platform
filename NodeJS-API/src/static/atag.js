//
//  atag.js
//  AtSight version 1.0.0
//
//  Created on 11/06/22.
//


// TODO : import { setCookie, getMainDomain, getTopLevelDomain } from '../utils'


// TESTS


// @ts-ignore
let top_level_domain = getTopLevelDomain(window.location.href)
// @ts-ignore
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

}).catch(e => { console.log(`ERROR: on the init.js script : ${JSON.stringify(e)}`) })
