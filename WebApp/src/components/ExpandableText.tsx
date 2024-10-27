//
//  ExpandableText.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React, { useEffect, useState } from 'react'
import Colors from '../assets/Colors'
import localization from '../utils/localizations'
import { TextType } from '../Types'
import { getLocalizedTextLocale, getLocalizedTextText, isMobileHook } from './functions'
import { getUserPreferredLocale, getUserSpokenLanguage } from './../assets/LanguagesList'
import { TranslateTextButton } from '../components/Buttons'
import { getLocalizedText } from './../assets/LanguagesList'
import { translateText } from '../aws/translate'
import { SavedTranslation, SavedTranslationObj } from '../Data'


// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, saveUnclippedTextState, saveTranslationPayload, saveTranslation } from '../state/slices/uiStatesSlice'



const userLocale = getUserPreferredLocale()
const isMobile = isMobileHook()
type fontWeightPossibilities = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800"




interface TranslatableExpandableTextInterface {
  description: object
  description_localization?: object
  textType: TextType
  uniqueId: string // 'post_id' or 'category_id' or 'account_id' + 'item_id' or 'account_id'
  color?: string
  maximumLines?: number
  doNotClipAgainOnceUnclipped?: boolean
  marginTop?: number
  marginHorizontal?: number
  fontSize?: number
  fontWeight?: fontWeightPossibilities
}
/**
 * Displays a translatable and expandable text if needed. 
 * -> Manages all the aspects of the text localization : show "Translating..." when translating, locally and globally saving the translation and more.
 * 
 * "unique_id" guidelines : 
 
    - posts : "post_id"
    - category_descriptions: "category_id"
    - related_items_descriptions: "account_id"+"related_item_id" as "related_item_id" are not unique globally 
    - profile_descriptions: "account_id"

 */
export function TranslatableExpandableText({
  description,
  description_localization,
  textType,
  uniqueId,
  maximumLines = 2,
  doNotClipAgainOnceUnclipped = true,
  marginTop = 0,
  marginHorizontal = 0,
  fontSize = 14,
  fontWeight = "400"
}: TranslatableExpandableTextInterface) {


  // States
  const [isInUserLocale, setIsInUserLocale]: [boolean | undefined, any] = useState(undefined)
  const [translation, setTranslation]: [string, any] = useState("")
  const [isTranslating, setIsTranslating]: [boolean, any] = useState(false)
  const [isTranslated, setIsTranslated]: [boolean, any] = useState(false)
  const [isShowingTranslation, setIsShowingTranslation]: [boolean, any] = useState(false)


  // Global data
  const dispatch = useDispatch()
  const translated_text = useSelector(selectUiStates).translated_text // An array of all the translate text
  const text = getLocalizedTextText(description)




  // Initialization
  useEffect(() => {
      if (isInUserLocale === undefined && description !== undefined) {

            // Description
            let textLocale = getLocalizedTextLocale(description).split("-")[0] // Gets the locale and shorten it.
            setIsInUserLocale(textLocale === userLocale.split("-")[0])


            // Localized text (use provided translation)
            if (description_localization === undefined) return
            const d_l_l = getUserSpokenLanguage().locale // can be long : "fr-CA" 
            const d_l_l_shortened = d_l_l.split("-")[0] // "fr"
            let localization
            // Also works if the user speaks "fr-CA" but the localization is only provided for "fr". (--> uses the "fr" localization as a fallback)
            localization = (description_localization as any)[`${d_l_l}`] ?? (description_localization as any)[`${d_l_l_shortened}`]

            if (localization !== undefined) {
                setTranslation(localization)
                setIsShowingTranslation(true)
                setIsTranslated(true)
            }

        }
  }, [])



  async function translateUnlocalizedText() {

    // Check if not already translated 
    let savedTranslationIndex
    let savedTranslation: SavedTranslation | undefined = undefined
    switch (textType) {
      case 'category_description':
        savedTranslationIndex = translated_text.category_descriptions.findIndex(e => { return e.unique_id === uniqueId })
        if (savedTranslationIndex !== -1) savedTranslation = translated_text.category_descriptions[savedTranslationIndex]
        break

      case 'post_description':
        savedTranslationIndex = translated_text.posts_descriptions.findIndex(e => { return e.unique_id === uniqueId })
        if (savedTranslationIndex !== -1) savedTranslation = translated_text.posts_descriptions[savedTranslationIndex]
        break

      case 'related_item_description':
        savedTranslationIndex = translated_text.related_items_descriptions.findIndex(e => { return e.unique_id === uniqueId })
        if (savedTranslationIndex !== -1) savedTranslation = translated_text.related_items_descriptions[savedTranslationIndex]
        break

      case 'profile_description':
        savedTranslationIndex = translated_text.profile_descriptions.findIndex(e => { return e.unique_id === uniqueId })
        if (savedTranslationIndex !== -1) savedTranslation = translated_text.profile_descriptions[savedTranslationIndex]
        break
    }
    // Uses the already generated translation if any.
    if (savedTranslation !== undefined) {
      setTranslation(savedTranslation.text)
      setIsShowingTranslation(true)
      setIsTranslated(true)
      return
    }



    // Preparation
    setIsTranslating(true)
    let descriptionLocalizedText = getLocalizedText(description ?? {})



    let result
    try {
      result = await translateText(descriptionLocalizedText.text, descriptionLocalizedText.language_metadata.locale, userLocale)
    } catch (error) {
      console.log("Translation error : " + error)
      setIsTranslating(false)
      return
    }


    // Updates
    let payload: saveTranslationPayload = { text_type: textType, savedTranslation: SavedTranslationObj(uniqueId, result) }
    dispatch(saveTranslation(payload)) // Saves the fact it has been unclipped 

    setTranslation(result)
    setIsTranslated(true)
    setIsTranslating(false)
    setIsShowingTranslation(true)


  }



  if (text !== "") {
    return (
      <div className='flex flex-col items-start justify-start' style={{ marginTop: marginTop, marginLeft: marginHorizontal, marginRight: marginHorizontal }}>
        {isShowingTranslation ?
          <ExpandableText
            key={"1"}
            text={translation}
            textType={textType}
            uniqueId={uniqueId}
            doNotClipAgainOnceUnclipped={doNotClipAgainOnceUnclipped}
            maximumLines={maximumLines}
            fontSize={fontSize}
            fontWeight={fontWeight}
          />
          :
          <ExpandableText
            key={"2"}
            text={text}
            textType={textType}
            uniqueId={uniqueId}
            doNotClipAgainOnceUnclipped={true}
            maximumLines={maximumLines}
            fontSize={fontSize}
            fontWeight={fontWeight}
          />
        }

        {!isInUserLocale &&
          <TranslateTextButton
            onPressTranslate={() => { translateUnlocalizedText() }}
            onPressShowTranslation={() => { setIsShowingTranslation(!isShowingTranslation) }}
            isTranslating={isTranslating}
            isTranslated={isTranslated}
            isDisplayingTranslation={isShowingTranslation}
          />
        }
      </div>
    )
  } else {
    return (null)
  }
}



interface ExpandableTextInterface {
  text: string
  textType: TextType
  uniqueId: string // 'post_id' or 'category_id'
  color?: string
  maximumLines?: number
  doNotClipAgainOnceUnclipped?: boolean
  fontSize?: number
  fontWeight?: fontWeightPossibilities
}
/** 
 * A text that clips itself when exceeding the provided line limit.
 * Once the text is unclipped, it never gets clipped again.
 * 
 * e.g. : a user opens a page with a post and unclips its description. Then he closes the page and re-opens it : the post's description will still be unclipped.
*/
export function ExpandableText({
  text,
  textType,
  uniqueId,
  maximumLines = 2,
  doNotClipAgainOnceUnclipped = true,
  fontSize = 14,
  fontWeight = "400"
}: ExpandableTextInterface) {


  // States 
  const [clippedText, setClippedText] = useState("")
  const [initialized, setInitialized] = useState(false)


  // Global data
  const dispatch = useDispatch()
  const unclipped_text = useSelector(selectUiStates).unclipped_text


  /**
  * 
  * Explanation
  * 1 - Get percent of visible text.
  * 2 - Use percent of visible text to approximately get the visible text and remove its last word properly so that the last word is never halfly cropped
  * (3 / Deprecated) - Obtain the hidden text. (The text that will be displayed when the user clicks on "see more")
  *
  * 
  * Outputs 
  * @output isClamped : boolean
  * @output visibleText : string
  * @ouput hiddenText : string
  * 
  * 
  * Exemple
  * with the text : "This is the description of a really long post which indicates a lot of information."
  * 
  * If the Ui only display the two first lines : "This is the description of a really long pos..."
  * The output will be for : 
  *    - b : "This is the description of a really"
  *    - h_t : "long post which indicates a lot of information."
 */
  function clipIfNeeded() {

    if (initialized) return
    var el = document.getElementById(uniqueId)
    if (el === null) { setInitialized(true); return }
    var txt = (el.innerText || el.textContent || el.innerHTML) ?? ""



    // 1
    // textArea.scrollHeight : total text's height
    // textArea.clientHeight : visible text's height
    let percentOfVisibleText = (el.clientHeight / el.scrollHeight)
    let wasUnclipped // (Globally)
    switch (textType) {
      case 'category_description':
        wasUnclipped = unclipped_text.category_descriptions.includes(uniqueId)
        break

      case 'post_description':
        wasUnclipped = unclipped_text.posts_descriptions.includes(uniqueId)
        break

      case 'related_item_description':
        wasUnclipped = unclipped_text.related_items_descriptions.includes(uniqueId)
        break

      case 'profile_description':
        wasUnclipped = unclipped_text.profile_descriptions.includes(uniqueId)
        break
    }
    if ((percentOfVisibleText === 1) || wasUnclipped) {
      setInitialized(true)
      return
    }



    // 2
    // l_c_i : last character index
    // b : begining of the text (with potentialy cropped last word like "Hello wor" rahter than "Hello world") 
    // v_t : visible text.
    let l_c_i = Number((txt.length * percentOfVisibleText).toFixed())
    let b = txt.substring(0, l_c_i)
    const v_t = removeLastWord(b)


    // 3
    // f_l_c_i : final last character index 
    // h_t : hidden text
    // let f_l_c_i = v_t.length
    // const h_t = text.substring(f_l_c_i)


    // alert(v_t + "     " + h_t)
    setClippedText(v_t)
    setInitialized(true)


  }


  useEffect(() => {
    clipIfNeeded()
  }, [])


  function unClipp() {
    if (clippedText === "") return

    setClippedText('')
    if (doNotClipAgainOnceUnclipped) {
      dispatch(saveUnclippedTextState({ text_type: textType, unique_id: uniqueId })) // Saves the fact it has been unclipped 
    }
  }


  let seeMoreTextUi = <span>... <span
    role={"button"}
    onClick={() => { unClipp() }}
    className={isMobile ? `hover:opacity-70` : `active:opacity-70`}
    style={{ fontSize: fontSize, lineHeight: 1.5, color: Colors.smallGrayText }}
  >{localization.see_more}</span></span>


  function getMaximumLines() {
    switch (maximumLines) {
      case 1 :  return "line-clamp-1"
      case 3 :  return "line-clamp-3"
      case 4 :  return "line-clamp-4"
      case 5 :  return "line-clamp-5"
      case 6 : return "line-clamp-6"
      default : return "line-clamp-2"
    }
  }

  return (
    <p
      id={uniqueId}
      onClick={() => { if (isMobile) unClipp() }}
      className={`text-left  ${initialized ? "" : getMaximumLines()} ${isMobile && clippedText !== "" ? "hover:opacity-90" : ""}`}
      style={{
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: Colors.black,
        lineHeight: 1.5
      }}
    >{clippedText !== '' ? clippedText : text}{clippedText !== "" && seeMoreTextUi}</p>
  )
}



function removeLastWord(text: string): string {
  var lastIndex = text.lastIndexOf(" ")

  return lastIndex !== -1 ? text.substring(0, lastIndex) : text
}

