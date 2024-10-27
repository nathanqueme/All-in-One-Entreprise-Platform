//
//  Types.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


import localization from './utils/localizations'
import { categoriesGroupTypeDescriptions, categoriesDescriptions } from "./utils/typesLocalizations"

/* To work properly an enum needs : 
   - not have a the word 'declare' before 'enum'
   - have a value (enum enumKey = 'value') 
   - that the value is exactly the same than the key (by respecting the capitalization)
*/
// 
// 
// 

export type AccountType = 'hotel' | 'palace'


// Time related
export type TimetablesType = 'opening_hours' | 'availability_hours'
export type TemporaryTime = 'off' // | 'renovations' | 'moving' | 'holidays'
export type SpecialTimeType = 'all_day' | 'never_that_day'


/**
 * Used to adapt the ui of the buttons to add content.
 * 
 * e.g. : "photo" displays an image symbol
 * 
 */
export type ContentType = "photo" | "pdf" | "any" | "account_management"


/**
 * Used to display a sliding alert that indicates that the content of a certain page could not be loaded.
 * 
 * The 'profile_page_loading' issue occurs when the "AccountMainData" could not be loaded.
 */
export type LoadingFailureType = "profile_page_loading" | "profile_not_found"


/** A type that describes an action applied to the UI.
*/
export type UiActionType = 'append' | 'update' | 'remove'


export type MathematicalOperation = '+' | '-'


/** A type that describes an action applied to values.
*/
export type OperationType = 'increase_of_one' | 'decrease_of_one'


/**
 * Used to differenciate text type in the 'ExpandableText' component.
 */
export type TextType = 'post_description' | 'category_description' | 'related_item_description' | 'profile_description'


export type SlidingAlertType = 'copied_alert' | 'sent_alert' | 'no_connection' | 'profile_not_found'


/**
 - map : used by businesses like IKEA to display a map of the store with the stages, elevators, parking,...
          also be used for businesses like amusement parks to display a map with the attractions, restaurants, stores and so on.
 - menu : used by businesses like hotels or restaurants to display their cart,.
 - contact : usable everybody that wants to enable people to contact them.
 */
export type ProfileButtonType = 'map' | 'menu' | 'contact' | 'website' | 'edit'


export type HeaderButtonType =
  'addSymbol' |
  'ellipsisSymbol' |
  'info' |
  'phoneSymbol' |
  'editText' |
  'sendText' |
  'confirmText' |
  'okText' |
  'doneText' |
  'deleteText' |
  'continueText' |
  'selectText' | 
  'settings'


export type HeaderCloseButtonType =
  'chevronLeft' |
  'xmark' |
  'cancelText' |
  'closeText'


export enum ImageType {
  profile_photo = "profile_photo",
  landscape = "landscape",
  portrait = "portrait",
  square = "square",
}













// EditingFields 
// 
// 
// 
/* A type can be used to get infos from an EditionField or to indicate from which textinput the keyboard is shown.
   -> In the second usage case, is used in combination with conditional rendering in headers to change the headertext when the user types. 
   (e.g. : Replaces 'New Category' by 'Name' when the user types the name)

   N.B. : 'username' -> (Most brands started using the 'username' word for users including businesses. But it is not really precise since a business, location and so on are not people.)
   -> P.S : most applications started by doing platforms for people and then extending it for businesses (*). We will do the opposite.
   (*) : a clear way to see this is that when a profile photo is empty on other platforms it displays a 'person symbol' rather than a 'photo symbol'.

*/
export type InformationType = 'account_name' |
  'location_in_place' |
  'category_name' |
  'geolocation' |
  'street' |
  'city' |
  'country' |
  'description' |
  'phoneNumber' |
  'website_link' |
  'link' |
  'link_name' |
  'link_url' |
  'email' |
  'username' |
  'custom' |
  'timetables' |
  'name' |
  'category_type' |
  "subject" |
  'custom_category' |
  'options' | 
  'category' | 
  'translation'


export class InformationMetada {
  type: InformationType
  name: string
  placeholder: string

  constructor(type: InformationType, name: string, placeholder: string) {
    this.type = type
    this.name = name
    this.placeholder = placeholder
  }
}


// Code to acces an item : 
export let informationsMetada: InformationMetada[] = [
  new InformationMetada("name", localization.name, localization.name),
  new InformationMetada("account_name", localization.name, localization.name),
  new InformationMetada("location_in_place", localization.location, localization.location_in_the_place),
  new InformationMetada("category_name", localization.name, localization.category_name),
  new InformationMetada("street", localization.street, localization.street_address),
  new InformationMetada("city", localization.city, localization.city),
  new InformationMetada("country", localization.country, localization.country),
  new InformationMetada("geolocation", localization.address, localization.add_address), // InformationType could be called 'location'
  new InformationMetada("description", localization.description, localization.description),
  new InformationMetada("phoneNumber", localization.number, localization.phone_number),
  new InformationMetada("website_link", "Website", localization.website_link),
  new InformationMetada('link', localization.link, localization.add_link),
  new InformationMetada('link_name', localization.name, localization.link_name),
  new InformationMetada('link_url', "Website", localization.link),
  new InformationMetada("email", localization.email, localization.email_address),
  new InformationMetada('username', localization.username, localization.username),
  new InformationMetada("custom", localization.custom, localization.custom),
  new InformationMetada("timetables", localization.timetables, localization.add_timetables),
  new InformationMetada('category_type', localization.type, localization.category_type),
  new InformationMetada('subject', localization.subject, localization.subject),
  new InformationMetada('custom_category', localization.category, localization.name_of_your_category),
  new InformationMetada('options', localization.options, localization.options),
  new InformationMetada('category', localization.category, localization.select_category), 
  new InformationMetada('translation', localization.translation, localization.translation)
]



export function getInfoMetada(infoType: InformationType) {
  let infoMetada = informationsMetada.find(Info => { return Info.type === infoType })

  return infoMetada
}













// Category types 
// 
// 
// 
export class CategoryGroup {
  groupType: CategoryGroupType
  types: CategoryInfo[]

  constructor(groupType: CategoryGroupType, types: CategoryInfo[]) {
    this.groupType = groupType
    this.types = types
  }
}


export class CategoryInfo {
  categoryType: CategoryType
  score: number
  subCategoriesTypes: CategoryInfo[]

  constructor(categoryType: CategoryType, score: number, subCategoriesTypes: CategoryInfo[] = []) {
    this.categoryType = categoryType
    this.score = score
    this.subCategoriesTypes = subCategoriesTypes
  }
}


export type CategoryGroupType = 'custom' | 'recently_and_soon' | 'places' | 'activities'




export type CategoryType =
  // #main 
  'custom' | 'events' | 'news' | 'new_products' |


  // #places
  'nature' | 'parks' | 'beaches' | 'waterfalls' | 'forests' | 'lakes' | 'areas_in_the_mountains' | 'islands' |


  'locations_for_sports' | 'sports_halls' | 'jogging_tracks' | 'biking_tracks' | 'sports_stadiums_and_arenas' | 'gyms' | 'swimming_pools' | 'ski_resorts' |


  'self_care' | 'hairdressers' | 'beauty_salons' | 'spas' |


  'stores' |
  'supermakets_and_grocery_stores' |
  'luxury_stores' |
  'shoes_stores' |
  'clothes_stores' |
  'beauty_stores' |
  'sport_stores' |
  'video_games_stores' |
  'local_markets' |
  'malls' |
  'pharmacies' |
  'cultural_stores' |
  'glasses_stores' |
  'home_appliance_store' |
  'tech_stores' |
  'supply_stores' |
  'kids_stores' |
  'furniture_stores' |
  'gardening_shops' |
  'home_improvements_stores' |
  'art_galleries' |


  'cultural_and_historical_locations' |
  'museums' |
  'monuments' |
  'art_installations' |


  'restaurants' |
  'cafes' |
  'classic_restaurants' |
  'fast_foods' |
  'pizzerias' |
  'sushi_restaurants' |
  'bars' |
  'michelin_star_restaurants' |


  'locations_for_entertainement' |
  'movie_theaters' |
  'music_clubs_and_festivals' |


  'means_of_transportation' |
  'airports' |
  'heliports' |
  'trains_stations' |
  'ports' |
  'bus_stations' |
  'taxi_ranks' |
  'city_bikes' |


  'photos_spots' |


  'hotels' |

  // #activities
  'shopping' |
  'walking' |
  'visiting' |
  'sportive_activities' |
  'chiling_out' |
  'learning' |
  'activities_for_kids'




// Guideline the technique to know if a subcategory is pertinent is by asking if it can have at least 8 items for instance "Beaches" can have 8 items but "lakes" won't.
export let categoryTypesMetadata = [
  /** */
  new CategoryGroup('custom', [
    new CategoryInfo('custom', 0.5),
  ]),


  new CategoryGroup('places', [
    new CategoryInfo('nature', 0.8, [
      new CategoryInfo('parks', 0.8),
      new CategoryInfo('beaches', 0.8),
      new CategoryInfo('waterfalls', 0.5),
      new CategoryInfo('forests', 0.3),
      // new CategoryInfo('lakes', 0.5),
      new CategoryInfo('areas_in_the_mountains', 0.4),
      new CategoryInfo('islands', 0.7),
    ]),

    new CategoryInfo('locations_for_sports', 0.9, [
      new CategoryInfo('sports_halls', 0.8),
      new CategoryInfo('jogging_tracks', 0.6),
      new CategoryInfo('biking_tracks', 0.6),
      new CategoryInfo('sports_stadiums_and_arenas', 0.6),
      new CategoryInfo('gyms', 0.6),
      new CategoryInfo('swimming_pools', 0.4),
      new CategoryInfo('ski_resorts', 0.7),
    ]),

    new CategoryInfo('self_care', 0.6, [
      new CategoryInfo('hairdressers', 0.4),
      new CategoryInfo('beauty_salons', 0.4),
      new CategoryInfo('spas', 0.9),
    ]),

    new CategoryInfo('stores', 0.8, [
      new CategoryInfo('supermakets_and_grocery_stores', 0.6),
      new CategoryInfo('luxury_stores', 1),
      new CategoryInfo('shoes_stores', 0.4),
      new CategoryInfo('clothes_stores', 0.7),
      new CategoryInfo('beauty_stores', 0.6),
      new CategoryInfo('sport_stores', 0.6),
      new CategoryInfo('video_games_stores', 0.4),
      new CategoryInfo('local_markets', 0.4),
      new CategoryInfo('malls', 0.4),
      new CategoryInfo('pharmacies', 0.4),
      new CategoryInfo('cultural_stores', 0.3),
      new CategoryInfo('glasses_stores', 0.2),
      new CategoryInfo('home_appliance_store', 0.2),
      new CategoryInfo('tech_stores', 0.2),
      new CategoryInfo('supply_stores', 0.2),
      new CategoryInfo('kids_stores', 0.2),
      new CategoryInfo('furniture_stores', 0.1),
      new CategoryInfo('gardening_shops', 0.1),
      new CategoryInfo('home_improvements_stores', 0.1),
      new CategoryInfo('art_galleries', 0.7),
    ]),

    new CategoryInfo('cultural_and_historical_locations', 0.4, [
      new CategoryInfo('museums', 0.7),
      new CategoryInfo('monuments', 0.7),
      new CategoryInfo('art_installations', 0.8),
    ]),

    new CategoryInfo('restaurants', 0.7, []
      /*[
        new CategoryInfo('cafes', 0.2),
        new CategoryInfo('classic_restaurants', 0.7),
        new CategoryInfo('fast_foods', 0.4),
        new CategoryInfo('pizzerias', 0.5),
        new CategoryInfo('sushi_restaurants', 0.4),
        new CategoryInfo('bars', 0.2),
        new CategoryInfo('michelin_star_restaurants', 0.7),
      ]*/
    ),

    new CategoryInfo('locations_for_entertainement', 0.3, [
      new CategoryInfo('movie_theaters', 0.8),
      new CategoryInfo('music_clubs_and_festivals', 0.8),
    ]),

    new CategoryInfo('means_of_transportation', 0.4, []
      /* [
        new CategoryInfo('airports', 0.4),
        new CategoryInfo('heliports', 0.7), // To remove 
        new CategoryInfo('trains_stations', 0.3),
        new CategoryInfo('ports', 0.7),
        new CategoryInfo('bus_stations', 0.2),
        new CategoryInfo('taxi_ranks', 0.2),
        new CategoryInfo('city_bikes', 0.8),
      ] */
    ),

    new CategoryInfo('photos_spots', 0.6),

    new CategoryInfo('hotels', 0.3),

  ]),


  new CategoryGroup('activities', [
    // new CategoryInfo('for_kids', 200),
    new CategoryInfo('shopping', 0.5),
    new CategoryInfo('walking', 0.6),
    new CategoryInfo('visiting', 0.6),
    new CategoryInfo('sportive_activities', 0.7),
    new CategoryInfo('chiling_out', 0.6),
    new CategoryInfo('learning', 0.4),
    new CategoryInfo('activities_for_kids', 0.2)
  ]),


  new CategoryGroup('recently_and_soon', [
    new CategoryInfo('events', 1),
    new CategoryInfo('news', 1),
    new CategoryInfo('new_products', 1),
  ]),



]











export function getGroupeTypeDescriptiveText(groupType: CategoryGroupType): string {
  if (groupType) {
    return categoriesGroupTypeDescriptions[groupType]
  } else return ""
}




export function getCategoryTypeDescription(categoryType?: CategoryType, customCategory?: string): string {
  if (categoryType) {
    return ((customCategory !== undefined) && (customCategory !== "")) ? customCategory : categoriesDescriptions[categoryType] ?? ""
  } else return ""
}


// A type describes where a DailyTimetable came from and so determines what will be updated.
export type DailyTimetableSource = 'RelatedItemPage' | 'AccountInfoPage' | 'PdfInfoPage'


export type ItemType =
  'profile_photo' |
  'post_photo' |
  'related_item_photo' |
  'pdf_menus' |
  'pdf_map' |
  'search_photo'


export type SettingsInfo = 'your_information' | 'your_qr_code' | 'about' | 'sign_out' |
  'change_password' | 'language' | 'delete_account' |
  'help' | 'settings' | 'analytics'


export function getSettingsInfoDescription(settingsInfo: SettingsInfo) {
  switch (settingsInfo) {
    case 'language': return localization.language
    case 'change_password': return localization.change_password
    case 'about': return localization.about
    case 'sign_out': return localization.sign_out
    case 'your_information': return localization.your_information // Before was "your_information"
    case 'your_qr_code': return localization.your_qr_code
    case 'delete_account': return localization.delete_account
    case 'help': return localization.help
    case 'settings': return localization.settings
    case 'analytics': return localization.analytics
    default: return ''
  }
}



export type ErrorType = 'badRequest (400)' | 'invalidValue (400)' | 'notFound (404)' | 'forbidden (403)' | 'unexpectedCondition (500)'

export type ErrorDetail =  
// general
'invalidFilters' | 'missingRequiredParameter' | 'forbidden' | 'invalidAccountId' | 'unexpectedCondition' |

// accountsMainData
'accountMainDataNotFound' | 
// postCategories'
'invalidCategoryId' |
// posts
'invalidPostId' |
// profiles
'profileNotFound' | 
// relatedItems
'relatedItemNotFound' | 'invalidCreatedDate' |
// sessions 
'invalidSessionId' |
// userDevices 
'invalidDeviceId' |

// auth
'invalidAuthDetails' | 

// analytics
'accountActivityNotFound'



// NEW
export type HourSlice = '0-3' | '3-6' | '6-9' | '9-12' | '12-15' | '15-18' | '18-21' | '21-0'
