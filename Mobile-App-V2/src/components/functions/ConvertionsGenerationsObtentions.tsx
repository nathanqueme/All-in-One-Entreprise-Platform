//
//  ConvertionsGenerationsObtentions.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

import React, { useState } from 'react'
import { Animated } from 'react-native'
import { PhoneNumber, PostCategory, ImageDataObj, GeolocationObj, PostObj, PostCategoryObj, PostCategoryMetadataObj, Post, RelatedItem, RelatedItemObj, TimetablesObj } from '../../Data'
import { easing } from './../animations'






// file name related
export type FileNameType =
  'profile_photo' |
  'search_photo' |
  'post' |
  'related_item' |
  'pdf'
/**
   - 'profile_photo' : `p_p/${short_id}.jpeg`
   - 'search_photo' : `s_p/${short_id}.jpeg`
   - 'post' : `p/${short_id}/${item_id}.jpeg`
   - 'related_item' : `r_i/${short_id}/${item_id}.jpeg`
   - 'pdf' : `pdf/${short_id}/${isMenuPdf ? "menu" : "map"}.pdf`
*/
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

  return simplifiedLocalizedText[keys[0]] ?? ""
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


/**
  Animates a normal const by passing an animatable const
*/
export function animateNonAnimatableValue(stateToAnimate: any, setValue: any, newValue: any, duration = 230) {
  Animated.timing(stateToAnimate, {
    toValue: 0,
    duration: duration,
    useNativeDriver: false,
  }).start(() => { setValue(newValue) })
}


/** 
  Animates an animatable constant.
*/
export function animateAnimatableValue(value: any, newValue: any, duration = 230) {
  Animated.timing(value, {
    toValue: newValue,
    useNativeDriver: true,
    duration: duration,
    easing: easing
  }).start()
}


export function awaitXMilliSeconds(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved')
    }, milliseconds)
  });
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
    let dummypostCategory = PostCategoryObj(PostCategoryMetadataObj('account_id', category_id, 'art_installations', 0.5, 12, 0, "2022-06-04T02:45:00.238Z", "2022-06-04T02:45:00.238Z"), false, posts)
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


// TODO
/**
 * Removes all special characters except numbers and space in a string.
 * Used for sanitizing some of the SQL queries (AWS's PartiQL).
 */
export function sanitizeString(inputString: string) {
  //let withSpace = inputString.replace(/[^a-z\d\s]+/gi, "")
  //let withoutSpace = withSpace.replace(/\s+/g, '')
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

