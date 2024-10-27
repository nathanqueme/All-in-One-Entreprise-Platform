//
//  Types.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//


export type AccountType = 'hotel' | 'palace'


// Time related
export type TimetablesType = 'opening_hours' | 'availability_hours'
export type TemporaryTime = 'off' // | 'renovations' | 'moving' | 'holidays'
export type SpecialTimeType = 'all_day' | 'never_that_day'

export type ResourceType = 'profile_photo' | 'search_photo' | 'post' | 'related_item' | 'pdf'

// https://fr.wikipedia.org/wiki/Type_de_m%C3%A9dias
export type ContentType = "application/pdf" | "image/jpeg" | "image/png"


export type MathematicalOperation = 'add' | 'subtract'


/** A type that describes an action applied to values.
*/
export type OperationType = 'increase_of_one' | 'decrease_of_one'


export enum ImageType {
  profile_photo = "profile_photo",
  landscape = "landscape",
  portrait = "portrait",
  square = "square",
}


/**
- map : used by businesses like IKEA to display a map of the store with the stages, elevators, parking,...
        also be used for businesses like amusement parks to display a map with the attractions, restaurants, stores and so on.
- menu : used by businesses like hotels or restaurants to display their cart,.
- contact : usable everybody that wants to enable people to contact them.
*/
export type ProfileButtonType = 'map' | 'menu' | 'contact' | 'website' | 'edit'


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
  'options'





// Category types 
// 
// 
// 
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
'accountActivityNotFound' | 
'invalidViewId' 
