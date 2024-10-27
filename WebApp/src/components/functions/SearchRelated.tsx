//
//  SearchRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'





// Search related
/**
  * Removes diacritics from a string.
  * But may not remove all of diacritics.
  * https://stackoverflow.com/a/37511463
*/
export function stringWithoutAccents(input_string: string) {
  let output_string = (input_string).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  return output_string
}


/**
 * - Removes all whitespaces.
 * - Lowercases all characters.
 * - Removes all accents.
 * 
 * @converts "Hôtel of  Miami " into "hotelofmiami"
*/
export function stringInSearchQueryFormat(input_string: string) {
  return stringWithoutAccents(input_string.toLowerCase().replace(/\s+/g, ''))
}







