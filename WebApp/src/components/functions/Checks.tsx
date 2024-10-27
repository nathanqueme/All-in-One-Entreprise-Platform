//
//  Checks.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'
import localization from '../../utils/localizations'




export function isAnEmail(text: string) {
    var textCopy = ""
    textCopy = text.trim().toLowerCase()
    if (textCopy === "") { return false }



    console.log("-----------Checking email validity-----------")
    // First verification
    if (textCopy === null) { return false }
    if (!textCopy.includes("@")
        || (textCopy.match("@")?.length ?? 0) >= 2
        || !textCopy.includes(".")) { return false }



    console.log("text :", textCopy)
    if (!textCopy.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )) { return false }



    // Email's username________________________________________________________________________________________ 
    // Checks that the email has a username
    var username = textCopy.substring(0, textCopy.indexOf('@'))
    if (username === "") { return false }
    console.log("username :", username)



    // Gets the end of the email after the @, the part that contains the domain and the country code
    var end = ""
    end = textCopy.substring(textCopy.indexOf('@') + 1)
    if (end === "") { return false }



    // Email's domain___________________________________________________________________________________
    // Checks that the end of the email has a domain
    var domain = ""
    domain = end.substring(0, end.indexOf('.'))
    if (domain === "") { return false }
    console.log("domain :", domain)



    // Email's country code _____________________________________________________________________________
    // Checks that the end of the email has a country code with more than 2 characters
    var countryCode = ""
    countryCode = end.substring(end.indexOf('.') + 1)
    if (countryCode.length < 2) { return false }
    console.log("countryCode :", countryCode)



    console.log("-> Is an email")
    return true
}


export function checkUsernameValidity(currentText: string, newText: string, setUsername: (_: string) => any, setError: (_: string) => any) {

    if ((newText ?? "") === "") return setUsername(newText)

    if (!(/^[a-z0-9._]+$/.test(newText) && !newText.includes('..'))) {
        setError(localization.usernames_can_only)
    } else if (newText[0] === ".") {
        setError(localization.username_start_error)
    } else if (newText[newText.length - 1] === ".") {
        setError(localization.username_end_error)
    }
    else {
        setUsername(newText)
    }
}


export function checkPhoneValidity(currentText: string, newText: string, setUsername: (_: string) => any, setError: (_: string) => any) {

    if ((newText ?? "") === "") return setUsername(newText)

    if (!(/^[0-9 ]+$/.test(newText))) {
        setError(localization.enter_valid_phone_number)
    }
    else {
        setUsername(newText)
    }
}


/** 
 * Verifies that a link is reachable.
 */
export function checkLinkValidity(linkUrl: string) {
    return new Promise(async (resolve, reject) => {



        try {
            const response = await fetch(linkUrl)
            // See all status code at : https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
            switch (response.status) {
                case 400:
                case 404:
                case 410:
                case 451: reject('This link is invalid.'); return
                default: resolve('This link is valid.'); break // Valid url 
            }
        } catch (error) {
            setTimeout(() => {
                reject('Please provide a valid url or check that you have an internet connection.')
            }, 95) // Slows down a little.


            return
        }

    })
}


/**
 *  N.B. : elements need to be in the same order for instance ["menu", "contact"] is not equal to ["contact", "menu"]
*/
export function arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}




