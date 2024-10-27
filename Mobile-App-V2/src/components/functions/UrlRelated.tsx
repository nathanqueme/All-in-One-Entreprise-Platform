//
//  UrlRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//


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
 * returns the "FR", "CH", "UK", "US", ...  
 */
export function getTopLevelDomain(url_string: string) {
    let url = new URL(url_string) // https://www.atsight.ch/policy/
    let hostname = url.hostname // www.atsight.ch 
    let last_dot_index = hostname.lastIndexOf(".")
    let top_level_domain = hostname.slice(last_dot_index + 1, hostname.length)

    return top_level_domain
}

