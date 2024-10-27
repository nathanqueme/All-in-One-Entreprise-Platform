//
//  daysjs.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { getUserPreferredLocale } from "../assets/LanguagesList"




// let dayjsSupportedLocales = ["af", "am", "ar-dz", "ar-iq", "ar-kw", "ar-ly", "ar-ma", "ar-sa", "ar-tn", "ar", "az", "be", "bg", "bi", "bm", "bn-bd", "bn", "bo", "br", "bs", "ca", "cs", "cv", "cy", "da", "de-at", "de-ch", "de", "dv", "el", "en-au", "en-ca", "en-gb", "en-ie", "en-il", "en-in", "en-nz", "en-sg", "en-tt", "en", "eo", "es-do", "es-mx", "es-pr", "es-us", "es", "et", "eu", "fa", "fi", "fo", "fr-ca", "fr-ch", "fr", "fy", "ga", "gd", "gl", "gom-latn", "gu", "he", "hi", "hr", "ht", "hu", "hy-am", "id", "is", "it-ch", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "ku", "ky", "lb", "lo", "lt", "lv", "me", "mi", "mk", "ml", "mn", "mr", "ms-my", "ms", "mt", "my", "nb", "ne", "nl-be", "nl", "nn", "oc-lnc", "pa-in", "pl", "pt-br", "pt", "rn", "ro", "ru", "rw", "sd", "se", "si", "sk", "sl", "sq", "sr-cyrl", "sr", "ss", "sv-fi", "sv", "sw", "ta", "te", "tet", "tg", "th", "tk", "tl-ph", "tlh", "tr", "tzl", "tzm-latn", "tzm", "ug-cn", "uk", "ur", "uz-latn", "uz", "vi", "x-pseudo", "yo", "zh-cn", "zh-hk", "zh-tw", "zh"]
type dayjsSupportedLocales = "en" | "fr"



// Initialization
let userLocale = getUserPreferredLocale()
switch (userLocale.toLowerCase() as dayjsSupportedLocales) {
 case "en": require("dayjs/locale/en"); break
 case "fr": require("dayjs/locale/fr"); break
}






/*
const dayjsLocalesImporters = {
    "af": require("dayjs/locale/af"),
    "am": require("dayjs/locale/am"),
    "ar": require("dayjs/locale/ar"),
    "ar-dz": require("dayjs/locale/ar-dz"),
    "ar-iq": require("dayjs/locale/ar-iq"),
    "ar-kw": require("dayjs/locale/ar-kw"),
    "ar-ly": require("dayjs/locale/ar-ly"),
    "ar-ma": require("dayjs/locale/ar-ma"),
    "ar-sa": require("dayjs/locale/ar-sa"),
    "ar-tn": require("dayjs/locale/ar-tn"),
    "az": require("dayjs/locale/az"),
    "be": require("dayjs/locale/be"),
    "bg": require("dayjs/locale/bg"),
    "bi": require("dayjs/locale/bi"),
    "bm": require("dayjs/locale/bm"),
    "bn": require("dayjs/locale/bn"),
    "bn-bd": require("dayjs/locale/bn-bd"),
    "bo": require("dayjs/locale/bo"),
    "br": require("dayjs/locale/br"),
    "bs": require("dayjs/locale/bs"),
    "ca": require("dayjs/locale/ca"),
    "cs": require("dayjs/locale/cs"),
    "cv": require("dayjs/locale/cv"),
    "cy": require("dayjs/locale/cy"),
    "da": require("dayjs/locale/da"),
    "de": require("dayjs/locale/de"),
    "de-at": require("dayjs/locale/de-at"),
    "de-ch": require("dayjs/locale/de-ch"),
    "dv": require("dayjs/locale/dv"),
    "el": require("dayjs/locale/el"),
    "en": require("dayjs/locale/en"),
    "en-au": require("dayjs/locale/en-au"),
    "en-ca": require("dayjs/locale/en-ca"),
    "en-gb": require("dayjs/locale/en-gb"),
    "en-ie": require("dayjs/locale/en-ie"),
    "en-il": require("dayjs/locale/en-il"),
    "en-in": require("dayjs/locale/en-in"),
    "en-nz": require("dayjs/locale/en-nz"),
    "en-sg": require("dayjs/locale/en-sg"),
    "en-tt": require("dayjs/locale/en-tt"),
    "eo": require("dayjs/locale/eo"),
    "es": require("dayjs/locale/es"),
    "es-do": require("dayjs/locale/es-do"),
    "es-mx": require("dayjs/locale/es-mx"),
    "es-pr": require("dayjs/locale/es-pr"),
    "es-us": require("dayjs/locale/es-us"),
    "et": require("dayjs/locale/et"),
    "eu": require("dayjs/locale/eu"),
    "fa": require("dayjs/locale/fa"),
    "fi": require("dayjs/locale/fi"),
    "fo": require("dayjs/locale/fo"),
    "fr": require("dayjs/locale/fr"),
    "fr-ca": require("dayjs/locale/fr-ca"),
    "fr-ch": require("dayjs/locale/fr-ch"),
    "fy": require("dayjs/locale/fy"),
    "ga": require("dayjs/locale/ga"),
    "gd": require("dayjs/locale/gd"),
    "gl": require("dayjs/locale/gl"),
    "gom-latn": require("dayjs/locale/gom-latn"),
    "gu": require("dayjs/locale/gu"),
    "he": require("dayjs/locale/he"),
    "hi": require("dayjs/locale/hi"),
    "hr": require("dayjs/locale/hr"),
    "ht": require("dayjs/locale/ht"),
    "hu": require("dayjs/locale/hu"),
    "hy-am": require("dayjs/locale/hy-am"),
    "id": require("dayjs/locale/id"),
    "is": require("dayjs/locale/is"),
    "it": require("dayjs/locale/it"),
    "it-ch": require("dayjs/locale/it-ch"),
    "ja": require("dayjs/locale/ja"),
    "jv": require("dayjs/locale/jv"),
    "ka": require("dayjs/locale/ka"),
    "kk": require("dayjs/locale/kk"),
    "km": require("dayjs/locale/km"),
    "kn": require("dayjs/locale/kn"),
    "ko": require("dayjs/locale/ko"),
    "ku": require("dayjs/locale/ku"),
    "ky": require("dayjs/locale/ky"),
    "lb": require("dayjs/locale/lb"),
    "lo": require("dayjs/locale/lo"),
    "lt": require("dayjs/locale/lt"),
    "lv": require("dayjs/locale/lv"),
    "me": require("dayjs/locale/me"),
    "mi": require("dayjs/locale/mi"),
    "mk": require("dayjs/locale/mk"),
    "ml": require("dayjs/locale/ml"),
    "mn": require("dayjs/locale/mn"),
    "mr": require("dayjs/locale/mr"),
    "ms": require("dayjs/locale/ms"),
    "ms-my": require("dayjs/locale/ms-my"),
    "mt": require("dayjs/locale/mt"),
    "my": require("dayjs/locale/my"),
    "nb": require("dayjs/locale/nb"),
    "ne": require("dayjs/locale/ne"),
    "nl": require("dayjs/locale/nl"),
    "nl-be": require("dayjs/locale/nl-be"),
    "nn": require("dayjs/locale/nn"),
    "oc-lnc": require("dayjs/locale/oc-lnc"),
    "pa-in": require("dayjs/locale/pa-in"),
    "pl": require("dayjs/locale/pl"),
    "pt": require("dayjs/locale/pt"),
    "pt-br": require("dayjs/locale/pt-br"),
    "rn": require("dayjs/locale/rn"),
    "ro": require("dayjs/locale/ro"),
    "ru": require("dayjs/locale/ru"),
    "rw": require("dayjs/locale/rw"),
    "sd": require("dayjs/locale/sd"),
    "se": require("dayjs/locale/se"),
    "si": require("dayjs/locale/si"),
    "sk": require("dayjs/locale/sk"),
    "sl": require("dayjs/locale/sl"),
    "sq": require("dayjs/locale/sq"),
    "sr": require("dayjs/locale/sr"),
    "sr-cyrl": require("dayjs/locale/sr-cyrl"),
    "ss": require("dayjs/locale/ss"),
    "sv": require("dayjs/locale/sv"),
    "sv-fi": require("dayjs/locale/sv-fi"),
    "sw": require("dayjs/locale/sw"),
    "ta": require("dayjs/locale/ta"),
    "te": require("dayjs/locale/te"),
    "tet": require("dayjs/locale/tet"),
    "tg": require("dayjs/locale/tg"),
    "th": require("dayjs/locale/th"),
    "tk": require("dayjs/locale/tk"),
    "tl-ph": require("dayjs/locale/tl-ph"),
    "tlh": require("dayjs/locale/tlh"),
    "tr": require("dayjs/locale/tr"),
    "tzl": require("dayjs/locale/tzl"),
    "tzm": require("dayjs/locale/tzm"),
    "tzm-latn": require("dayjs/locale/tzm-latn"),
    "ug-cn": require("dayjs/locale/ug-cn"),
    "uk": require("dayjs/locale/uk"),
    "ur": require("dayjs/locale/ur"),
    "uz": require("dayjs/locale/uz"),
    "uz-latn": require("dayjs/locale/uz-latn"),
    "vi": require("dayjs/locale/vi"),
    "yo": require("dayjs/locale/yo"),
    "zh": require("dayjs/locale/zh"),
    "zh-cn": require("dayjs/locale/zh-cn"),
    "zh-hk": require("dayjs/locale/zh-hk"),
    "zh-tw": require("dayjs/locale/zh-tw")
}
*/




