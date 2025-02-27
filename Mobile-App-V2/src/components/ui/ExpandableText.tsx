//
//  ExpandableText.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useEffect, useState } from 'react'
import localization from '../../utils/localizations'
import { ColorsInterface } from './../../assets/Colors'
import { TouchableOpacity, Text, View, TextStyle, NativeSyntheticEvent, TextLayoutEventData } from 'react-native'
import { TextType } from '../../Types'
import { getLocalizedTextLocale, getLocalizedTextText } from '../functions'
import { getUserPreferredLocale, getUserSpokenLanguage } from './../../assets/LanguagesList'
import { TranslateTextButton } from '../Buttons'
import { getLocalizedText } from './../../assets/LanguagesList'
import { translateText } from '../../aws/translate'
import { SavedTranslation, SavedTranslationObj } from '../../Data'

// Global data 
import { useSelector, useDispatch } from 'react-redux'
import { selectUiStates, saveUnclippedTextState, saveTranslationPayload, saveTranslation } from '../../state/slices/uiStatesSlice'



const user_locale = getUserPreferredLocale()
const see_more_text_placeholder = localization.see_more



// TODO : do sort of that it remembers that the text was already translated and display the text "Show translation" rather than "Translate"
interface TranslatableExpandableTextInterface {
    description: object
    description_localization?: object
    textType: TextType
    uniqueId: string // 'post_id' or 'category_id' or 'account_id' + 'item_id' or 'account_id'
    COLORS: ColorsInterface
    color?: string
    maximumLines?: number
    doNotClipAgainOnceUnclipped?: boolean
    marginTop?: number
    marginHorizontal?: number
    fontSize?: number
    fontWeight?: TextStyle["fontWeight"]
    locale?: string
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
    COLORS,
    maximumLines = 2,
    doNotClipAgainOnceUnclipped = true,
    marginTop = 0,
    marginHorizontal = 0,
    fontSize = 14,
    fontWeight = "400",
    locale = user_locale,
}: TranslatableExpandableTextInterface) {


    // States
    const [isInUserLocale, setIsInUserLocale]: [boolean, any] = useState()
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
            setIsInUserLocale(textLocale === locale.split("-")[0])


            // Localized text (use provided translation)
            if (description_localization === undefined) return
            const d_l_l = getUserSpokenLanguage().locale // can be long : "fr-CA" 
            const d_l_l_shortened = d_l_l.split("-")[0] // "fr"
            let localization
            // Also works if the user speaks "fr-CA" but the localization is only provided for "fr". (--> uses the "fr" localization as a fallback)
            localization = description_localization[`${d_l_l}`] ?? description_localization[`${d_l_l_shortened}`]

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
        let savedTranslation: SavedTranslation
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
            result = await translateText(descriptionLocalizedText.text, descriptionLocalizedText.language_metadata.locale, locale)
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


    return (text !== "" &&
        <View style={{ marginTop: marginTop, marginHorizontal: marginHorizontal }}>
            {isShowingTranslation ?
                <ExpendableText
                    key={"1"}
                    text={translation}
                    textType={textType}
                    uniqueId={uniqueId}
                    doNotClipAgainOnceUnclipped={doNotClipAgainOnceUnclipped}
                    maximumLines={maximumLines}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    COLORS={COLORS}
                />
                :
                <ExpendableText
                    key={"2"}
                    text={text}
                    textType={textType}
                    uniqueId={uniqueId}
                    doNotClipAgainOnceUnclipped={true}
                    maximumLines={maximumLines}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    COLORS={COLORS}
                />
            }

            {!isInUserLocale &&
                <TranslateTextButton
                    COLORS={COLORS}
                    onPressTranslate={() => { translateUnlocalizedText() }}
                    onPressShowTranslation={() => { setIsShowingTranslation(!isShowingTranslation) }}
                    isTranslating={isTranslating}
                    isTranslated={isTranslated}
                    isDisplayingTranslation={isShowingTranslation}
                />
            }
        </View>
    )
}



/** 
 * A text that clips itself when exceeding the provided line limit.
 * Once the text is unclipped, it never gets clipped again.
 * 
 * e.g. : a user opens a page with a post and unclips its description. Then he closes the page and re-opens it : the post's description will still be unclipped.
*/
interface ExpendableTextInterface {
    text: string
    textType: TextType
    uniqueId: string // 'post_id' or 'category_id'
    COLORS: ColorsInterface
    color?: string
    maximumLines?: number
    doNotClipAgainOnceUnclipped?: boolean
    fontSize?: number
    fontWeight?: TextStyle["fontWeight"]
}
export function ExpendableText({
    text,
    textType,
    uniqueId,
    COLORS,
    maximumLines = 2,
    doNotClipAgainOnceUnclipped = true,
    fontSize = 14,
    fontWeight = "400",
}: ExpendableTextInterface) {


    // States 
    const [clippedText, setClippedText] = useState('')
    const [wasClippedLocally, setWasClippedLocally] = useState(false)  // This property avoids re-clipping the text 'LOCALLY' when the 'VIEW' is updated.


    // Global data
    const dispatch = useDispatch()
    const unclipped_text = useSelector(selectUiStates).unclipped_text


    /** Steps : 
       - 1 - Determines if the text was already unclipped ('GLOBALLY')
       - 2 - Detects if clipping is needed
       - 3 - Truncates the text by removing as much words as needed so that '... see more' fits. ('see more' text lenght's varies in function of the language)
    */
    function clipIfNeeded(e: NativeSyntheticEvent<TextLayoutEventData>) {

        if (wasClippedLocally) { return }

        // Values 
        const shownText = e.nativeEvent.lines.slice(0, maximumLines).map((line) => line.text).join('')
        const hiddenText = text.substring(shownText.length)

        // 1
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


        // 2 
        if (hiddenText !== '' && !wasUnclipped) {

            // 3 
            let textToFit = `... ${see_more_text_placeholder}`
            let newText = shownText


            do {
                newText = removeLastWord(newText)
            } while ((shownText.length - newText.length) < textToFit.length) // The left part corresponds to the removed length



            newText += `... `
            setClippedText(newText)
            setWasClippedLocally(true)
        }

    }


    return (
        <TouchableOpacity
            onPress={() => {
                if (clippedText === "") return

                setClippedText('')
                if (doNotClipAgainOnceUnclipped) {
                    dispatch(saveUnclippedTextState({ text_type: textType, unique_id: uniqueId })) // Saves the fact it has been unclipped 
                }

            }}
            disabled={!wasClippedLocally || (wasClippedLocally && clippedText === '')}
            activeOpacity={0.5}
        >
            <Text
                key={text}
                style={{
                    fontSize: fontSize,
                    fontWeight: fontWeight,
                    color: COLORS.black
                }}
                onTextLayout={(e) => { clipIfNeeded(e) }}
            >{clippedText !== '' ? clippedText : text}<Text style={{
                fontSize: fontSize,
                color: COLORS.smallGrayText
            }}>{clippedText !== '' && see_more_text_placeholder}</Text></Text>
        </TouchableOpacity>
    )
}



function removeLastWord(text): string {
    var lastIndex = text.lastIndexOf(" ")

    return lastIndex !== -1 ? text.substring(0, lastIndex) : text
}