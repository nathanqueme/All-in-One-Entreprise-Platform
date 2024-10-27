//
//  ConvertionsGenerationsObtentions.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'
import { PhoneNumber, PostCategory, ImageDataObj, GeolocationObj, PostObj, PostCategoryObj, PostCategoryMetadataObj, Post, RelatedItem, RelatedItemObj, TimetablesObj } from '../../Data'
import { WindowHeight } from '../WindowHeight'



const isMobile = isMobileHook()



// file name related
export type FileNameType = 'profile_photo' | 'search_photo' | 'post' | 'related_item' | 'pdf'
export function getFileName(type: FileNameType, short_id: string, item_id = "", isMenuPdf = true) {
  switch (type) {
    case 'profile_photo': return `p_p/${short_id}.jpeg`
    case 'search_photo': return `s_p/${short_id}.jpeg`
    case 'post': return `p/${short_id}/${item_id}.jpeg`
    case 'related_item': return `r_i/${short_id}/${item_id}.jpeg`
    case 'pdf': return `pdf/${short_id}/${isMenuPdf ? "menu" : "map"}.pdf`
  }
}


/**
 * @returns the description from a SimplifiedLocalizedText
 * 
 * { en : "In pursuit of the dream." } returns "In pursuit of the dream."
 * 
 * { } or { en : undefined} or undefined returns ""
 * 
 */
export function getLocalizedTextText(simplifiedLocalizedText: object) {

  if (simplifiedLocalizedText === undefined) return ""

  let keys = Object.keys(simplifiedLocalizedText)
  if (keys.length === 0) return ""

  let key = keys[0] // locale
  return (simplifiedLocalizedText as any)[key] ?? ""
}


/**
 * @returns the description from a SimplifiedLocalizedText
 * 
 * { en : "In pursuit of the dream." } returns "en"
 * 
 * { } or { en : undefined} or undefined returns ""
 * 
 */
export function getLocalizedTextLocale(simplifiedLocalizedText: object) {

  if (simplifiedLocalizedText === undefined) return ""

  let keys = Object.keys(simplifiedLocalizedText)
  if (keys.length === 0) return ""

  return keys[0]
}


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


export function getPhoneNumberDescription(phoneNumber: PhoneNumber) {
  return '+' + phoneNumber.calling_code + phoneNumber.number
}


/** 
  Capitalize the first letter 
*/
export function capitalize(text: string) {
  if (typeof text !== 'string') return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}


export function awaitXMilliSeconds(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved')
    }, milliseconds)
  })
}


// Dummy data during loading
/**
 * 
 * @returns 3 dummy post categories of 8 posts with a unique 'category_id' and 'post_id' so that the flatlist nicely has a unique key for each item to render.
 * --> Used for the profile page's postCategories loading apparance.
 *
 */
export function getDummyPostCategories(): PostCategory[] {

  let category_ids = ['1', '2', '3']
  let post_ids = ['1', '2', '3', '4', '5', '6', '7', '8']
  let postCategories: PostCategory[] = []

  category_ids.forEach(category_id => {

    // Posts
    let posts: Post[] = []
    post_ids.forEach(post_id => {
      let dummyPost = PostObj(post_id, category_id, "ABC", "2022-06-04T02:45:00.238Z", ImageDataObj(""), "Name", 0, 0, false, GeolocationObj("", "", "", "", "", ""), "u09t")
      posts.push(dummyPost)
    })


    // Category
    let dummypostCategory = PostCategoryObj(PostCategoryMetadataObj('account_id', category_id, 'locations_for_sports', 0.5, 12, 0, "2022-06-04T02:45:00.238Z", "2022-06-04T02:45:00.238Z"), false, posts)
    postCategories.push(dummypostCategory)

  })


  return postCategories
}


export function getDummyRelatedItems(): RelatedItem[] {


  let relatedItemsId = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']


  // Posts
  let relatedItems: RelatedItem[] = []
  relatedItemsId.forEach(relatedItemId => {
    let dummyRelatedItem = RelatedItemObj("m", relatedItemId, "Name", ImageDataObj("", 1), "", TimetablesObj("opening_hours", [], ""))
    relatedItems.push(dummyRelatedItem)
  })


  return relatedItems
}




export function getMainDivMinHeight() {
  return (isMobile ? window.innerHeight : WindowHeight()) - ((isMobile ? 44.5 : (42 + (18 * 2))) + 100) // header's height and 100 footer's minimum height
}


// TODO
/**
 * Removes all special characters except numbers and space in a string.
 * Used for sanitizing some of the SQL queries (AWS's PartiQL).
 */
export function sanitizeString(inputString: string) {
  return inputString
}


/**
 * Returns : "2022-10" for 2022 October.
 *           "2022-02" for February.
 */
export function getYearMonthDate(date?: Date) {
  const date_to_use = (date ? date : new Date()).toISOString()

  const year = date_to_use.split("-")[0]

  // Warning : months under 10 must have a 0 before them.
  // e.g. : "02" for Octobre
  const month = Number(date_to_use.split("-")[1] ?? "0")

  return `${year}-${(month < 10) ? ("0" + month) : month}`
}








// img's alt 
export function getPostPhotoAlt(created_date: string, post_name: string, account_name: string) {

  // Values 
  // August 26, 2022
  let post_created_date = new Date(created_date)
  let dateDescription = post_created_date.toLocaleString('en-US', {
    day: "numeric",
    month: "long",
    year: "numeric"
  })

  return `Photo by ${account_name} on ${dateDescription}. May be an image on ${post_name}.`
}


export function getProfilePhotoAlt(username: string) {
  return `${username}'s profile picture`
}


export function getRelatedItemPhotoAlt(created_date: string, account_name: string) {

  // Values 
  // August 26, 2022
  let item_created_date = new Date(created_date)
  let dateDescription = item_created_date.toLocaleString('en-US', {
    day: "numeric",
    month: "long",
    year: "numeric"
  })


  return `Photo by ${account_name} on ${dateDescription}. Image on ${account_name}'s indoor.`
}


export function getSearchPhotoAlt() {
  return `Photo` // `${username}'s profile picture`
}


export function getPdfAlt(pdf_type: "menu" | "map", account_name: string) {
  return `PDF by ${account_name}. PDF on ${account_name}'s ${pdf_type}.`
}


/**
 * WARNING : may not work, for instance if the user disbles all cookies for instance in Safari.
 */
export function setCookie(name: string, value: string, expires: number, domain: string) {
  // Adds the tag on production but not on localhost so that cookies can be set
  const secure_tag = process.env.NODE_ENV === 'production' ? "secure;" : ""
  document.cookie = `${name}=${value}; expires=${expires}; domain=${domain} ;path=/; ${secure_tag} `
}


/**
 * May not work if the user has disabled cookies for instance on Safari.
 */
export function getCookie(cookie_name: string) {
  let name = cookie_name + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length) ?? ""
    }
  }
  return "";
}


// NEW 
export function isMobileHook() {
  return window.screen.width < 500
}


export function containsOnlyNumbers(str: string) {
  return /^\d+$/.test(str);
}


export function isDeviceIdValid(device_id: string) {
  let parts = device_id.split(".")
  return (parts.length === 2) && (parts[0].length === 10) && (containsOnlyNumbers(parts[0])) && (containsOnlyNumbers(parts[1]))
}