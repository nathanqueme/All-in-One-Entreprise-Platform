//
//  LanguagesList.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import * as RNLocalize from "react-native-localize"
import { LanguageMetadata, LocalizedText, LocalizedTextObj } from './../Data'



/** 
 * 
 * Used on Android to manually set user's language.
 * 
 */
export let appSupportedLanguageLocales = ["en", "fr"]




/**
 * 
 * @returns user's preferred locale in full or shorten version. 
 * 
 * e.g. : 'es-US', 'fr-FR' or 'es', 'fr' if shortened.
 * 
 * By default the locale is 'en' and it is not shortened.
 * 
 */
export function getUserPreferredLocale(shorten = false) {

  let locale = RNLocalize.getLocales()[0]?.languageTag ?? 'en'

  return shorten ? locale.split("-")[0] : locale
}





interface LanguageList {
  locale: string
  languages: LanguageMetadata[]
}
export function LanguageMetadataObj(name: string, locale: string) {
  return {
    name: name,
    locale: locale
  }
}
export const languagesLists: LanguageList[] = [
  {
    locale: "en",
    languages: [
      { name: "Afrikaans", locale: "af" },
      { name: "Albanian", locale: "sq" },
      { name: "Amharic", locale: "am" },
      { name: "Arabic", locale: "ar" },
      { name: "Armenian", locale: "hy" },
      { name: "Azerbaijani", locale: "az" },
      { name: "Bengali", locale: "bn" },
      { name: "Bosnian", locale: "bs" },
      { name: "Bulgarian", locale: "bg" },
      { name: "Catalan", locale: "ca" },
      { name: "Chinese (Simplified)", locale: "zh" },
      { name: "Chinese (Traditional)", locale: "zh-TW" },
      { name: "Croatian", locale: "hr" },
      { name: "Czech", locale: "cs" },
      { name: "Danish", locale: "da" },
      { name: "Dari", locale: "fa-AF" },
      { name: "Dutch", locale: "nl" },
      { name: "English", locale: "en" },
      { name: "Estonian", locale: "et" },
      { name: "Farsi (Persian)", locale: "fa" },
      { name: "Filipino, Tagalog", locale: "tl" },
      { name: "Finnish", locale: "fi" },
      { name: "French", locale: "fr" },
      { name: "French (Canada)", locale: "fr-CA" },
      { name: "Georgian", locale: "ka" },
      { name: "German", locale: "de" },
      { name: "Greek", locale: "el" },
      { name: "Gujarati", locale: "gu" },
      { name: "Haitian Creole", locale: "ht" },
      { name: "Hausa", locale: "ha" },
      { name: "Hebrew", locale: "he" },
      { name: "Hindi", locale: "hi" },
      { name: "Hungarian", locale: "hu" },
      { name: "Icelandic", locale: "is" },
      { name: "Indonesian", locale: "id" },
      { name: "Irish", locale: "ga" },
      { name: "Italian", locale: "it" },
      { name: "Japanese", locale: "ja" },
      { name: "Kannada", locale: "kn" },
      { name: "Kazakh", locale: "kk" },
      { name: "Korean", locale: "ko" },
      { name: "Latvian", locale: "lv" },
      { name: "Lithuanian", locale: "lt" },
      { name: "Macedonian", locale: "mk" },
      { name: "Malay", locale: "ms" },
      { name: "Malayalam", locale: "ml" },
      { name: "Maltese", locale: "mt" },
      { name: "Marathi", locale: "mr" },
      { name: "Mongolian", locale: "mn" },
      { name: "Norwegian", locale: "no" },
      { name: "Pashto", locale: "ps" },
      { name: "Polish", locale: "pl" },
      { name: "Portuguese (Brazil)", locale: "pt" },
      { name: "Portuguese (Portugal)", locale: "pt-PT" },
      { name: "Punjabi", locale: "pa" },
      { name: "Romanian", locale: "ro" },
      { name: "Russian", locale: "ru" },
      { name: "Serbian", locale: "sr" },
      { name: "Sinhala", locale: "si" },
      { name: "Slovak", locale: "sk" },
      { name: "Slovenian", locale: "sl" },
      { name: "Somali", locale: "so" },
      { name: "Spanish", locale: "es" },
      { name: "Spanish (Mexico)", locale: "es-MX" },
      { name: "Swahili", locale: "sw" },
      { name: "Swedish", locale: "sv" },
      { name: "Tamil", locale: "ta" },
      { name: "Telugu", locale: "te" },
      { name: "Thai", locale: "th" },
      { name: "Turkish", locale: "tr" },
      { name: "Ukrainian", locale: "uk" },
      { name: "Urdu", locale: "ur" },
      { name: "Uzbek", locale: "uz" },
      { name: "Vietnamese", locale: "vi" },
      { name: "Welsh", locale: "cy" },
    ]
  },

  {
    locale: "fr",
    languages: [
      { name: "Afrikaans", locale: "af" },
      { name: "Albanais", locale: "sq" },
      { name: "Amharique", locale: "am" },
      { name: "Arabe", locale: "ar" },
      { name: "Arménien", locale: "hy" },
      { name: "Azerbaïdjanais", locale: "az" },
      { name: "Bengali", locale: "bn" },
      { name: "Bosniaque", locale: "bs" },
      { name: "Bulgare", locale: "bg" },
      { name: "Catalan", locale: "ca" },
      { name: "Chinois (simplifié)", locale: "zh" },
      { name: "Chinois (traditionnel)", locale: "zh-TW" },
      { name: "Croate", locale: "hr" },
      { name: "Tchèque", locale: "cs" },
      { name: "Danois", locale: "da" },
      { name: "Dari", locale: "fa-AF" },
      { name: "Néerlandais", locale: "nl" },
      { name: "Anglais", locale: "en" },
      { name: "Estonien", locale: "et" },
      { name: "Farsi (persan)", locale: "fa" },
      { name: "Philippin, Tagalog", locale: "tl" },
      { name: "Finnois", locale: "fi" },
      { name: "Français", locale: "fr" },
      { name: "Français (Canada)", locale: "fr-CA" },
      { name: "Géorgien", locale: "ka" },
      { name: "Allemand", locale: "de" },
      { name: "Grec", locale: "el" },
      { name: "Gujarati", locale: "gu" },
      { name: "Créole haïtien", locale: "ht" },
      { name: "Haoussa", locale: "ha" },
      { name: "Hébreu", locale: "he" },
      { name: "Hindi", locale: "hi" },
      { name: "Hongrois", locale: "hu" },
      { name: "Islandais", locale: "is" },
      { name: "Indonésien", locale: "id" },
      { name: "Irlandais", locale: "ga" },
      { name: "Italien", locale: "it" },
      { name: "Japonais", locale: "ja" },
      { name: "Kannada", locale: "kn" },
      { name: "Kazakh", locale: "kk" },
      { name: "Coréen", locale: "ko" },
      { name: "Letton", locale: "lv" },
      { name: "Lituanien", locale: "lt" },
      { name: "Macédonien", locale: "mk" },
      { name: "Malais", locale: "ms" },
      { name: "Malayalam", locale: "ml" },
      { name: "Maltais", locale: "mt" },
      { name: "Marathi", locale: "mr" },
      { name: "Mongol", locale: "mn" },
      { name: "Norvégien", locale: "no" },
      { name: "Pachtoune", locale: "ps" },
      { name: "Polonais", locale: "pl" },
      { name: "Portugais (Brésil)", locale: "pt" },
      { name: "Portugais (Portugal)", locale: "pt-PT" },
      { name: "Pendjabi", locale: "pa" },
      { name: "Roumain", locale: "ro" },
      { name: "Russe", locale: "ru" },
      { name: "Serbe", locale: "sr" },
      { name: "Cinghalais", locale: "si" },
      { name: "Slovaque", locale: "sk" },
      { name: "Slovène", locale: "sl" },
      { name: "Somalien", locale: "so" },
      { name: "Espagnol", locale: "es" },
      { name: "Espagnol (Mexique)", locale: "es-MX" },
      { name: "Swahili", locale: "sw" },
      { name: "Suédois", locale: "sv" },
      { name: "Tamoul", locale: "ta" },
      { name: "Télougou", locale: "te" },
      { name: "Thaï", locale: "th" },
      { name: "Turque", locale: "tr" },
      { name: "Ukrainien", locale: "uk" },
      { name: "Ourdou", locale: "ur" },
      { name: "Ouzbek", locale: "uz" },
      { name: "Vietnamien", locale: "vi" },
      { name: "Gallois", locale: "cy" },
    ]
  },

  {
    locale: "es",
    languages: [
      { name: "Afrikáans", locale: "af" },
      { name: "Albanesa", locale: "sq" },
      { name: "Amárico", locale: "am" },
      { name: "Árabe", locale: "ar" },
      { name: "Armenio", locale: "hy" },
      { name: "Azerbaiyano", locale: "az" },
      { name: "Bengalí", locale: "bn" },
      { name: "Bosnio", locale: "bs" },
      { name: "Búlgaro", locale: "bg" },
      { name: "Catalán", locale: "ca" },
      { name: "Chino (simplificado)", locale: "zh" },
      { name: "Chino (tradicional)", locale: "zh-TW" },
      { name: "Croata", locale: "hr" },
      { name: "Checa", locale: "cs" },
      { name: "Danés", locale: "da" },
      { name: "Dari", locale: "fa-AF" },
      { name: "Holandés", locale: "nl" },
      { name: "Inglés", locale: "en" },
      { name: "Estonio", locale: "et" },
      { name: "Farsi (persa)", locale: "fa" },
      { name: "Filipino, tagalo", locale: "tl" },
      { name: "Finlandés", locale: "fi" },
      { name: "Francés", locale: "fr" },
      { name: "Francés (Canadá)", locale: "fr-CA" },
      { name: "Georgiana", locale: "ka" },
      { name: "Alemán", locale: "de" },
      { name: "Griego", locale: "el" },
      { name: "Gujaratí", locale: "gu" },
      { name: "Criollo haitiano", locale: "ht" },
      { name: "Hausa", locale: "ha" },
      { name: "Hebreo", locale: "he" },
      { name: "Hindi", locale: "hi" },
      { name: "Húngaro", locale: "hu" },
      { name: "Islandés", locale: "is" },
      { name: "Indonesio", locale: "id" },
      { name: "Irlandés", locale: "ga" },
      { name: "Italiano", locale: "it" },
      { name: "Japonés", locale: "ja" },
      { name: "Canarés", locale: "kn" },
      { name: "Kazajo", locale: "kk" },
      { name: "Coreano", locale: "ko" },
      { name: "Letón", locale: "lv" },
      { name: "Lituano", locale: "lt" },
      { name: "Macedonio", locale: "mk" },
      { name: "Malayo", locale: "ms" },
      { name: "Malayalam", locale: "ml" },
      { name: "Maltés", locale: "mt" },
      { name: "Marathi", locale: "mr" },
      { name: "Mongol", locale: "mn" },
      { name: "Noruego", locale: "no" },
      { name: "Pastún", locale: "ps" },
      { name: "Polaco", locale: "pl" },
      { name: "Portugués (Brasil)", locale: "pt" },
      { name: "Portugués (Portugal)", locale: "pt-PT" },
      { name: "Panyabí", locale: "pa" },
      { name: "Rumano", locale: "ro" },
      { name: "Ruso", locale: "ru" },
      { name: "Serbio", locale: "sr" },
      { name: "Cingalés", locale: "si" },
      { name: "Eslovaco", locale: "sk" },
      { name: "Esloveno", locale: "sl" },
      { name: "Somalí", locale: "so" },
      { name: "Español", locale: "es" },
      { name: "Español (México)", locale: "es-MX" },
      { name: "Swahili", locale: "sw" },
      { name: "Sueco", locale: "sv" },
      { name: "Tamil", locale: "ta" },
      { name: "Telugú", locale: "te" },
      { name: "Tailandés", locale: "th" },
      { name: "Turco", locale: "tr" },
      { name: "Ucraniano", locale: "uk" },
      { name: "Urdu", locale: "ur" },
      { name: "Uzbeko", locale: "uz" },
      { name: "Vietnamita", locale: "vi" },
      { name: "Galés", locale: "cy" },
    ]
  },

  {
    locale: "de",
    languages: [
      { name: "Afrikaans", locale: "af" },
      { name: "Albanischen", locale: "sq" },
      { name: "Amharisch", locale: "am" },
      { name: "Arabisch", locale: "ar" },
      { name: "Armenisch", locale: "hy" },
      { name: "Aserbaidschanischen", locale: "az" },
      { name: "Bengalisch", locale: "bn" },
      { name: "Bosnisches", locale: "bs" },
      { name: "Bulgarischen", locale: "bg" },
      { name: "Catalan", locale: "ca" },
      { name: "Chinesisch (vereinfacht)", locale: "zh" },
      { name: "Chinesisch (traditionell)", locale: "zh-TW" },
      { name: "Kroatischen", locale: "hr" },
      { name: "Tschechischen", locale: "cs" },
      { name: "Dänischen", locale: "da" },
      { name: "Dari", locale: "fa-AF" },
      { name: "Niederländisch", locale: "nl" },
      { name: "Englisch", locale: "en" },
      { name: "Estnischen", locale: "et" },
      { name: "Farsi (Persisch)", locale: "fa" },
      { name: "Philippinisch, Tagalog", locale: "tl" },
      { name: "Finnischen", locale: "fi" },
      { name: "Französisch", locale: "fr" },
      { name: "Französisch (Kanada)", locale: "fr-CA" },
      { name: "Georgian", locale: "ka" },
      { name: "Deutsch", locale: "de" },
      { name: "Griechisch", locale: "el" },
      { name: "Gujarati", locale: "gu" },
      { name: "Haitianisch", locale: "ht" },
      { name: "Hausa", locale: "ha" },
      { name: "Hebrä", locale: "he" },
      { name: "Hindi", locale: "hi" },
      { name: "Ungarischen", locale: "hu" },
      { name: "Isländischen", locale: "is" },
      { name: "Indonesisch", locale: "id" },
      { name: "Irisch", locale: "ga" },
      { name: "Italienisch", locale: "it" },
      { name: "Japanisch", locale: "ja" },
      { name: "Kannada", locale: "kn" },
      { name: "Kasachischen", locale: "kk" },
      { name: "Koreanisch", locale: "ko" },
      { name: "Lettisch", locale: "lv" },
      { name: "Litauischen", locale: "lt" },
      { name: "Mazedonischen", locale: "mk" },
      { name: "Malaiisch", locale: "ms" },
      { name: "Malayalam", locale: "ml" },
      { name: "Maltesisch", locale: "mt" },
      { name: "Marathi", locale: "mr" },
      { name: "Mongolischen", locale: "mn" },
      { name: "Norwegischen", locale: "no" },
      { name: "Paschtunisch", locale: "ps" },
      { name: "Polnisch", locale: "pl" },
      { name: "Portugiesisch (Brasilien)", locale: "pt" },
      { name: "Portugiesisch (Portugal)", locale: "pt-PT" },
      { name: "Panjabi", locale: "pa" },
      { name: "Rumänischen", locale: "ro" },
      { name: "Russisch", locale: "ru" },
      { name: "Serbisch", locale: "sr" },
      { name: "Singhalesisch", locale: "si" },
      { name: "Slowakisch", locale: "sk" },
      { name: "Slowenischen", locale: "sl" },
      { name: "Somalisch", locale: "so" },
      { name: "Spanisch", locale: "es" },
      { name: "Spanisch (Mexiko)", locale: "es-MX" },
      { name: "Swahili", locale: "sw" },
      { name: "Schwedisch", locale: "sv" },
      { name: "Tamilisch", locale: "ta" },
      { name: "Telugu", locale: "te" },
      { name: "Thai", locale: "th" },
      { name: "Türkischen", locale: "tr" },
      { name: "Ukrainischen", locale: "uk" },
      { name: "Urdu", locale: "ur" },
      { name: "Usbekisch", locale: "uz" },
      { name: "Vietnamesisch", locale: "vi" },
      { name: "Welsh", locale: "cy" },


    ]
  },

  {
    locale: "it",
    languages: [
      { name: "Afrikaans", locale: "af" },
      { name: "Albanese", locale: "sq" },
      { name: "Amarico", locale: "am" },
      { name: "Arabo", locale: "ar" },
      { name: "Armeno", locale: "hy" },
      { name: "Azerbaigian", locale: "az" },
      { name: "Bengalese", locale: "bn" },
      { name: "Bosniaco", locale: "bs" },
      { name: "Bulgaro", locale: "bg" },
      { name: "Catalano", locale: "ca" },
      { name: "Cinese (semplificato)", locale: "zh" },
      { name: "Cinese (tradizionale)", locale: "zh-TW" },
      { name: "Croato", locale: "hr" },
      { name: "Cechi", locale: "cs" },
      { name: "Danese", locale: "da" },
      { name: "Dari", locale: "fa-AF" },
      { name: "Olandese", locale: "nl" },
      { name: "Inglese", locale: "en" },
      { name: "Estone", locale: "et" },
      { name: "Farsi (persiano)", locale: "fa" },
      { name: "Filippino, tagalog", locale: "tl" },
      { name: "Finlandese", locale: "fi" },
      { name: "Francese", locale: "fr" },
      { name: "Francese (Canada)", locale: "fr-CA" },
      { name: "Georgiana", locale: "ka" },
      { name: "Tedesco", locale: "de" },
      { name: "Greco", locale: "el" },
      { name: "Gujarati", locale: "gu" },
      { name: "Creolo haitiano", locale: "ht" },
      { name: "Hausa", locale: "ha" },
      { name: "Ebraico", locale: "he" },
      { name: "Hindi", locale: "hi" },
      { name: "Ungherese", locale: "hu" },
      { name: "Islandese", locale: "is" },
      { name: "Indonesiano", locale: "id" },
      { name: "Irlandese", locale: "ga" },
      { name: "Italiano", locale: "it" },
      { name: "Giapponese", locale: "ja" },
      { name: "Kannada", locale: "kn" },
      { name: "Kazako", locale: "kk" },
      { name: "Coreano", locale: "ko" },
      { name: "Lettone", locale: "lv" },
      { name: "Lituano", locale: "lt" },
      { name: "Macedone", locale: "mk" },
      { name: "Malese", locale: "ms" },
      { name: "Malayalam", locale: "ml" },
      { name: "Maltese", locale: "mt" },
      { name: "Marathi", locale: "mr" },
      { name: "Mongolo", locale: "mn" },
      { name: "Norvegese", locale: "no" },
      { name: "Pashto", locale: "ps" },
      { name: "Polacco", locale: "pl" },
      { name: "Portoghese (Brasile)", locale: "pt" },
      { name: "Portoghese (Portogallo)", locale: "pt-PT" },
      { name: "Punjabi", locale: "pa" },
      { name: "Rumeno", locale: "ro" },
      { name: "Russo", locale: "ru" },
      { name: "Serbo", locale: "sr" },
      { name: "Sinhala", locale: "si" },
      { name: "Slovacco", locale: "sk" },
      { name: "Sloveno", locale: "sl" },
      { name: "Somalo", locale: "so" },
      { name: "Spagnolo", locale: "es" },
      { name: "Spagnolo (Messico)", locale: "es-MX" },
      { name: "Swahili", locale: "sw" },
      { name: "Svedese", locale: "sv" },
      { name: "Tamil", locale: "ta" },
      { name: "Telugu", locale: "te" },
      { name: "Tailandese", locale: "th" },
      { name: "Turco", locale: "tr" },
      { name: "Ucraino", locale: "uk" },
      { name: "Urdu", locale: "ur" },
      { name: "Uzbeko", locale: "uz" },
      { name: "Vietnamita", locale: "vi" },
      { name: "Gallese", locale: "cy" },
    ]
  },

]


const USER_LOCALE = getUserPreferredLocale()
const USER_LOCALE_SHORTENED = USER_LOCALE.split("-")[0] ?? "en"
const userLocaleIsSupported = languagesLists.findIndex(e => { return e.locale === USER_LOCALE_SHORTENED }) !== -1
export const languagesInUserLocale = languagesLists?.find(e => { return e.locale === (userLocaleIsSupported ? USER_LOCALE_SHORTENED : "en") })?.languages ?? []




/**
 * @returns the locale of the language spoken by the user. 
 * e.g.: If the user's speaks french it's locale will be "fr-FR"
 * 
 * - 1 : "fr-FR" is supported -> returns "fr-FR"
 * 
 * - 2 : "fr-FR" is not supported -> use "fr"
 *   - 2.1 : "fr" is supported return "fr"
 *   - 2.2 : "fr" is not supported return "en" as a fallback
 * 
 */
export function getUserSpokenLanguage(): LanguageMetadata {

  const exactLanguage: LanguageMetadata | undefined = languagesInUserLocale.find(e => { return e.locale === USER_LOCALE })
  if (exactLanguage) return exactLanguage // 1

  const similarLanguage: LanguageMetadata | undefined = languagesInUserLocale.find(e => { return e.locale === USER_LOCALE_SHORTENED })
  if (similarLanguage) return similarLanguage // 2.1

  const fallbackLanguage: LanguageMetadata = languagesInUserLocale.find(e => { return e.locale === "en" }) ?? LanguageMetadataObj("English", "en")
  return fallbackLanguage // 2.2
}






/**
 * 
 * @param locale the locale of the supported language. (e.g. : "fr" for French)
 * @returns - the metadata of the language : { name: "French", locale: "fr" }, with the language's "name" in user's language.
 */
export function getLanguageMetadata(locale: string) {

  let languageIndex = languagesInUserLocale.findIndex(e => { return e.locale === locale })

  return languagesInUserLocale[languageIndex]
}



/**
  *  Transforms { "en": "In pursuit of the dream." } into a "LocalizedTextObj" by getting the language name in user's language.
  *
  * @param : { "en": "In pursuit of the dream." }
  * @returns : { languageMetadata: { name: "English", locale: "en" }, text: "In pursuit of the dream." } or {}
  * 
  * N.B. : This module is here to avoid  aving to import the long list of languages in multiple files.
  *
*/
export function getLocalizedText(item?: object): LocalizedText {

  if (item === undefined) return {} as any 

  let locale = Object.keys(item)[0]
  let languageMetadata = getLanguageMetadata(locale)

  return LocalizedTextObj(languageMetadata, item[locale])
}



/**
 * 
 * @param an object such as { "en": "In pursuit of the dream.", "fr" : "A la poursuite du rêve." }
 * @returns an array of LocalizedText or an empty array
 */
export function getLocalizedTexts(item: object): LocalizedText[] {

  let localizedTexts: LocalizedText[] = []

  Object.keys(item).forEach(locale => {
    let languageMetadata = getLanguageMetadata(locale)
    let localizedText = LocalizedTextObj(languageMetadata, item[locale])

    localizedTexts.push(localizedText)
  })

  return localizedTexts
}