//
//  ForContentEditors.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from "react"
import { detectMainLanguageLocale } from "../../aws/comprehend"
import { Geolocation, Link, LocalizedText, PhoneNumber, Timetables } from "../../Data"
import { updateUiStateValuePayload, updateUiStateValue } from './../../state/slices/uiStatesSlice'
import { arrayEquals } from "./Checks"





/**
 * 
 * Transforms a LocalizedText into a SimplifiedLocalizedText, something like : { "en": "In pursuit of the dream." }
 * 
 * @param descriptionWasChanged indicates wether or not the localized text was modified.
 * @param isNewItem indicated if the item is new. The item can be a post, a relatedItem, a postCategory,...
 * @param localizedText the localized text with the locale and language's name determined or not.
 * 
 * n.b. : the reason it has a promise is because if the "LocalizedText" is new or has been edited, it will determine its laguage's locale.
 * 
*/
export async function generateSimplifiedLocalizedText(descriptionWasChanged: boolean, localizedText: LocalizedText) {
    return new Promise(async (resolve, reject) => {

        let finalDescrtiption = {}
        let languageLocale = ""


        // The locale needs to be updated or generated for the first time
        if (descriptionWasChanged || (localizedText?.language_metadata.locale ?? "") === "") {
            try {
                languageLocale = await detectMainLanguageLocale(localizedText.text)
                console.log("Default language code : " + languageLocale)
            } catch (error) {
                reject(error)
            }
        }
        // The locale has already been determined and does not needs any update
        else {
            languageLocale = localizedText.language_metadata.locale
        }


        (finalDescrtiption as any)[languageLocale] = localizedText.text.trim()
        resolve(finalDescrtiption)

    })
}


// Changes checker
/** 
 * N.B. : If the item has an address but it was automatically generated, it behaves like if it did not have one.
*/
export function geolocationWasChangedChecker(geolocation?: Geolocation, originalGeolocation?: Geolocation) {

    let originalGeolocationToUse = (originalGeolocation?.auto_generated ?? false) ? undefined : originalGeolocation

    return (geolocation?.street ?? "") !== (originalGeolocationToUse?.street ?? "") ||
        (geolocation?.city ?? "") !== (originalGeolocationToUse?.city ?? "") ||
        (geolocation?.country ?? "") !== (originalGeolocationToUse?.country ?? "")
}


export function phoneNumberWasChangedChecker(phoneNumber?: PhoneNumber, originalPhoneNumber?: PhoneNumber) {
    return (phoneNumber?.number ?? "") !== (originalPhoneNumber?.number ?? "") ||
        (phoneNumber?.calling_code ?? "") !== (originalPhoneNumber?.calling_code ?? "") || 
        (phoneNumber?.country_code ?? "") !== (originalPhoneNumber?.country_code ?? "")
}


export function descriptionWasChangedChecker(description?: LocalizedText, originalDescription?: LocalizedText) {
    return (description?.language_metadata?.name ?? "") !== (originalDescription?.language_metadata?.name ?? "") ||
        (description?.language_metadata?.locale ?? "") !== (originalDescription?.language_metadata?.locale ?? "") ||
        (description?.text ?? "") !== (originalDescription?.text ?? "")
}


export function descriptionLocalizationWasChangedChecker(descriptionLocalization?: LocalizedText[], originalDescriptionLocalization?: LocalizedText[]) {
    let a = descriptionLocalization?.flatMap(e => { return e.language_metadata.locale + e.language_metadata.name + e.text })
    let b = originalDescriptionLocalization?.flatMap(e => { return e.language_metadata.locale + e.language_metadata.name + e.text })
    return !arrayEquals(a, b)
}


export function linkWasChangedChecker(link: Link, originalLink: Link) {
    return (link?.url ?? "") !== (originalLink?.url ?? "") ||
        (link?.name ?? "") !== (originalLink?.name ?? "")
}


export function timetablesWereChangedChecker(timetables: Timetables, originalTimetables: Timetables) {
    return (timetables?.type ?? 'opening_hours') !== (originalTimetables?.type ?? 'opening_hours') ||
        (timetables?.daily_timetables ?? []) !== (originalTimetables?.daily_timetables ?? []) ||
        (timetables?.subject ?? '') !== (originalTimetables?.subject ?? '') ||
        (timetables?.temporary_time ?? "") !== (originalTimetables?.temporary_time ?? "")
}



export function textHasEmojis(text: string): boolean {
    if (text.length === 0) return false

    // https://stackoverflow.com/a/69866962
    // e_r: Emoji regex
    const e_r = /((\ud83c[\udde6-\uddff]){2}|([\#\*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)/g
    // e_e: Extra emojis (Characters that should not be considered as emojis)
    const e_e = ["•", "‘", "’", "›", "‹", "‚", "€", "₽", "₩", "”", "“", "„"]
    const emojis = text.match(e_r)?.filter((e) => { return !e_e.includes(e) }) ?? []

    return emojis.length > 0
}


/**
 * Checks if the text has emojis.
 *  1 - if it does shows the uiState.emojisAlert
 *  2 - updates the text's variable
 */
export function handleTextAndPreventEmojis(text: string, setText: (_: string) => any, dispatch: any) {
    if (text.length === 0) { setText(""); return }

    // Avoid emojis
    if (textHasEmojis(text)) {
        let updateUiStateValuePayload: updateUiStateValuePayload = { attribute: "emojiAlert", value: true }
        dispatch(updateUiStateValue(updateUiStateValuePayload))
    } else {
        setText(text)
    }
}


