//
//  ipInfo.ts
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 11/06/22.
//



// TODO : import { setCookie, getMainDomain, getTopLevelDomain } from '../utils'

// TESTS

// @ts-ignore
let top_level_domain = getTopLevelDomain(window.location.href)
// @ts-ignore
let t_l_d = top_level_domain === "localhost" ? "ch" : top_level_domain

fetch(`https://apis.atsight.${t_l_d}/atag/iInfo`, { method: "GET", credentials: "include" }).then(async (e) => {

    var response = await e.json()
    if (!response.cookie_set) {
        let main_domain = getMainDomain(window.location.href)
        setCookie("_eii", response.data, (365 * 2) * 24 * 60 * 60 * 1000, `.${main_domain}`) // days * hours * minutes * sec * milliseconds
    }

}).catch(e => { console.log(`ERROR: on the iInfo.js script : ${JSON.stringify(e)}`) })
