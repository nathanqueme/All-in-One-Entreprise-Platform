//
//  Data.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { CategoryType, ImageType, ProfileButtonType, AccountType, TemporaryTime, TimetablesType, SpecialTimeType, ErrorType, ErrorDetail } from "./Types"

// All objects are plain objects to able to save them on redux 
// ...Obj() stands for ...Object()

/** Public/SemiPrivate data______________________________________________________________________________________________________________
    -> Can be seen by everybody or only the allowed people
*/
/** For understanding how the data is organized only (The data will never be merged into an AccountObj for better performance) :
 AccountObj: {
  accountMainData: AccountMainData
  profile: Profile
  relatedItems: RelatedItem[]  // Is empty if the pro_account is owned by a person
  postsCategories: postsCategories[]
}
*/










// Page related__________________________________________________________________
// (Only on devices)
// 
export interface Page {
  page_number: number
  account_id: string
  short_id: string
}
/**
 * Represents an opened page
 * 
 * @param page_number Makes each page unique as the same page can be opened multiple times.
 * @param account_id Unique id of the account.
 * @param short_id Short and unique id of the account. Used to identify an account without using it's account_id (sensitive AWS id).
 */
export function PageObj(page_number: number, account_id: string, short_id: string) {
  return {
    page_number: page_number,
    account_id: account_id,
    short_id: short_id
  }
}


export interface PageAccountMainData {
  page: Page
  account_main_data: AccountMainData
}
export function PageAccountMainDataObj(page: Page, account_main_data: AccountMainData) {
  return {
    page: page,
    account_main_data: account_main_data
  }
}


export interface PageProfile {
  page: Page
  profile: Profile
}
export function PageProfileObj(page: Page, profile: Profile) {
  return {
    page: page,
    profile: profile
  }
}


export interface PageRelatedItem {
  page: Page
  related_items: RelatedItem[]
}
export function PageRelatedItemObj(page: Page, related_items: RelatedItem[]) {
  return {
    page: page,
    related_items: related_items,
  }
}


export interface PagePostCategories {
  page: Page
  post_categories: PostCategory[]
}
export function PagePostCategoriesObj(page: Page, post_categories: PostCategory[]) {
  return {
    page: page,
    post_categories: post_categories
  }
}
//____________________________________________________________________________
// 
// 
// 
//____________________________________________________________________________


























// UPDATED
export interface AccountMainData {
  account_id: string
  short_id: string
  account_name: string
  search_name: string // NEW
  username: string
  account_type: AccountType
  certified: boolean
  has_photo: boolean
  // has_header_photo: boolean // DEPRECATED
  geolocation: Geolocation
  image_data: ImageData // Device only
  // headerImageData: ImageData // DEPRECATED
  s?: number
}
/**
 * @param s makes an accountMainData searchable when set to 1 and not when set to 0.
 */
export function AccountMainDataObj(account_id: string, short_id: string, account_name: string, search_name: string, username: string, account_type: AccountType, certified: boolean, has_photo: boolean, geolocation: Geolocation, image_data?: ImageData, s = 1) {
  return {
    account_id: account_id,
    short_id: short_id,
    account_name: account_name,
    search_name: search_name,
    username: username,
    account_type: account_type,
    certified: certified,
    has_photo: has_photo,
    geolocation: geolocation,
    image_data: image_data,
    s: s
  }
}


// UPDATED
export interface Profile {
  account_id: string
  additional_resources: ProfileButtonType[]
  buttons: ProfileButtonType[]
  comment_count: number
  email: string
  // like_count: number // DEPRECATED
  links: Link[]
  phone_number: PhoneNumber
  menu_timetables: Timetables[]
  post_count: number
  category_count: number
  related_items_count: number
  timetables?: Timetables
  description?: object
  description_localization?: object
  menu_phone_number?: PhoneNumber
}
export function ProfileObj(account_id: string, additional_resources: ProfileButtonType[], buttons: ProfileButtonType[], comment_count: number = 0, email: string, links: Link[] = [], phone_number: PhoneNumber, menu_timetables: Timetables[], post_count: number, category_count: number, related_items_count: number, timetables?: Timetables, description?: object, description_localization?: object, menu_phone_number?: PhoneNumber) {
  return {
    account_id: account_id,
    additional_resources: additional_resources,
    buttons: buttons,
    comment_count: comment_count,
    email: email,
    links: links,
    phone_number: phone_number,
    menu_timetables: menu_timetables,
    post_count: post_count,
    category_count: category_count,
    related_items_count: related_items_count,
    timetables: timetables,
    description: description,
    description_localization: description_localization,
    menu_phone_number: menu_phone_number,
  }
}


export interface RelatedItem {
  account_id: string
  item_id: string
  name: string
  image_data: ImageData
  created_date: string
  timetables: Timetables
  description?: object,
  description_localization?: object
  simple_location?: string
  link?: Link
}
/**
 * @param created_date date of creation in ISO 8601 format.
 */
export function RelatedItemObj(account_id: string, item_id: string, name: string, image_data: ImageData, created_date: string, timetables: Timetables, description?: object, description_localization?: object, simple_location?: string, link?: Link) {
  return {
    account_id: account_id,
    item_id: item_id,
    name: name,
    image_data: image_data,
    created_date: created_date,
    timetables: timetables,
    description: description,
    description_localization: description_localization,
    simple_location: simple_location,
    link: link
  }
}






















// Posts category
export interface PostCategory {
  metadata: PostCategoryMetadata
  is_loaded?: boolean // Not on server
  posts?: Post[]
}
/**
 * 
 * @param is_loaded not on server
 * @param posts not on server
 */
export function PostCategoryObj(metadata: PostCategoryMetadata, is_loaded?: boolean, posts?: Post[]) {
  return {
    metadata: metadata,
    is_loaded: is_loaded,
    posts: posts,
  }
}


/**
  * N.B.: The 'category_id' is a unique id, globally on the application
 */
export interface PostCategoryMetadata {
  account_id: string
  category_id: string
  type: CategoryType
  score: number
  post_count: number
  c_index: number  // index would be nice but it is a reserved word on dynamoDB
  created_date: string
  update_date: string
  custom_type?: string
}
/**
 * @param created_date date of creation in ISO 8601 format.
 * @param update_date date of the last update in ISO 8601 format.
*/
export function PostCategoryMetadataObj(account_id: string, category_id: string, type: CategoryType, score: number, post_count: number, c_index: number, created_date: string, update_date: string, custom_type?: string) {
  return {
    account_id: account_id,
    category_id: category_id,
    type: type,
    score: score,
    post_count: post_count,
    c_index: c_index,
    created_date: created_date,
    update_date: update_date,
    custom_type: custom_type,
  }
}



/**
 * @param created_date date of creation in ISO 8601 format.
 * 
 * @nota_bene The 'post_id', 'category_id' and 'account_id' are unique ids globally on the application
*/
// UPDATED
export interface Post {
  post_id: string
  category_id: string
  account_id: string
  created_date: string
  image_data: ImageData
  name: string
  saved_count: number
  comment_count: number
  comments_disabled: boolean
  geolocation: Geolocation
  geohash: string
  description?: object // { ‘fr’ : ‘A la poursuite du rêve.’ }     (language's locale + text)
  description_localization?: object
  tagged?: string[]
  link_url?: string
}
export function PostObj(post_id: string, category_id: string, account_id: string, created_date: string, image_data: ImageData, name: string, saved_count: number, comment_count: number, comments_disabled: boolean, geolocation: Geolocation, geohash: string, description?: object, description_localization?: object, tagged?: string[], link_url?: string) {
  return {
    post_id: post_id,
    category_id: category_id,
    account_id: account_id,
    created_date: created_date,
    image_data: image_data,
    name: name,
    saved_count: saved_count,
    comment_count: comment_count,
    comments_disabled: comments_disabled,
    geolocation: geolocation,
    geohash: geohash,
    description: description,
    description_localization: description_localization,
    tagged: tagged,
    link_url: link_url,
  }
}


export interface Geolocation {
  city: string
  country: string
  iso: string
  region: string
  street: string
  zip: string
  latitude?: number
  longitude?: number
  auto_generated?: boolean
}
/** 
 * 
 * @param iso A "country/region" specified using ISO 3166 3-digit country/region code. For example, "CAN".
 * @param latitude_and_longitude Coordinates are not always 4 digits when it finishes with zeros at the end.
 * 
 * @example "geolocation": {
  "city": "Paris",
  "country": "France",
  "iso": "FRA",
  "region": "Île-de-France",
  "street": "5 Av. Anatole",
  "zip": "75007",
  "latitude": 48.8588, ---> Simplified from 48.85881898871568
  "longitude": 2.2945, ---> Simplified from 2.29459704006771
}
*
* @comment Is called 'geolocation' because 'location' is a reserved word used by 'dynamodb'.
*
* @nota_bene An address to user's eye is : a street + a country + a city 
*
*/
export function GeolocationObj(city: string, country: string, iso: string, region: string, street: string, zip: string, latitude?: number, longitude?: number, auto_generated?: boolean) {
  return {
    city: city,
    country: country,
    iso: iso,
    region: region,
    street: street,
    zip: zip,
    latitude: latitude,
    longitude: longitude,
    auto_generated: auto_generated
  }
}



export interface PhoneNumber {
  number: string
  country_code: string
  calling_code: string
}
export function PhoneNumberObj(number: string, country_code: string, calling_code: string) {
  return {
    number: number,
    country_code: country_code,
    calling_code: calling_code,
  }
}


export interface Timetables {
  type: TimetablesType
  daily_timetables: DailyTimetable[]
  subject?: string
  temporary_time?: TemporaryTime
}
export function TimetablesObj(type: TimetablesType, daily_timetables: DailyTimetable[], subject?: string, temporary_time?: TemporaryTime) {
  return {
    type: type,
    daily_timetables: daily_timetables,
    subject: subject,
    temporary_time: temporary_time
  }
}


/** all_day : 'Open all day' / 'Available all day'
   never_that_day : 'Close all day' / 'Not available that day'
 */
export interface DailyTimetable {
  day: number // --->  a number between [0-6].
  start_time: string
  end_time: string
  special_time: SpecialTimeType | ''
}
export function DailyTimetableObj(day: number, start_time: string, end_time: string, special_time: SpecialTimeType | '') {
  return {
    day: day,
    start_time: start_time,
    end_time: end_time,
    special_time: special_time,
  }
}



export interface Link {
  name: string
  url: string
}
export function LinkObj(name: string, url: string) {
  return {
    name: name,
    url: url,
  }
}

























export interface LanguageMetadata {
  name: string
  locale: string
}
export function LanguageMetadataObj(name: string, locale: string) {
  return {
    name: name,
    locale: locale
  }
}


export interface LocalizedText {
  language_metadata: LanguageMetadata
  text: string
}
/** 
 * Used on devices only, to edit localized text.
*/
export function LocalizedTextObj(language_metadata: LanguageMetadata, text: string) {
  return {
    language_metadata: language_metadata,
    text: text
  }
}


// Device only 
export interface SavedTranslation {
  unique_id: string
  text: string
}
export function SavedTranslationObj(unique_id: string, text: string) {
  return {
    unique_id: unique_id,
    text: text,
  }
}


/**
 * Used to sort categories
 */
export interface ItemIndex {
  unique_id: string
  index: number
}
export function ItemIndexObj(unique_id: string, index: number) {
  return {
    unique_id: unique_id,
    index: index
  }
}


export interface ProfileButtonUiMetadata {
  title: string
  symbol: any
}
export function ProfileButtonUiMetadataObj(title: string, symbol: any) {
  return {
    title: title,
    symbol: symbol,
  }
}


export class ImageData {
  base64?: string
  height_width_ratio?: number
}
export function ImageDataObj(base64?: string, height_width_ratio?: number) {
  return {
    base64: base64,
    height_width_ratio: height_width_ratio
  }
}


export interface ImageDimensions {
  image_type: ImageType
  width: number
  height: number
}
/** 
 * Used for handling image size during upload.
*/
export function ImageDimensionsObj(image_type: ImageType, width: number, height: number) {
  return {
    image_type: image_type,
    width: width,
    height: height,
  }
}
















// NEW
type SearchResultType =
  "accountMainData" |
  "city"
export interface SearchResult {
  search_query: string // Unformatted search query
  type: SearchResultType,
  object: City | AccountMainData
}
/**
 * Represents the results matching the typed query.
*/
export function SearchResultObj(search_query: string, type: SearchResultType, object: City | AccountMainData) {
  return {
    search_query: search_query,
    type: type,
    object: object
  }
}





// NEW
// Todo
export interface City {

}
export function CityObj() {
  return {

  }
}


export interface CoreError {
  type: ErrorType
  detail: ErrorDetail
  description?: string
}
export function CoreErrorObj(type: ErrorType, detail: ErrorDetail, description?: string) {
  return {
    type: type,
    detail: detail,
    description: description,
  }
}


// https://ipinfo.io/pricing
export interface IpAddressInfo {
  ip: string,
  hostname: string,
  city: string,
  region: string,
  country: string,
  loc: string
  org: string,
  postal: string,
  timezone: string
}