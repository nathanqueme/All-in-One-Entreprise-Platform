//
//  AddressEditorSubSheet.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/29/22
//

import React from 'react'
import TextStyles from '../../../styles/TextStyles'
import localization from '../../../utils/localizations'
import EditingSubSheetOuterDiv from '../EditingSubSheetOuterDiv'
import { InfoInputButton } from '../Buttons'
import { INNER_PADDING, MINI_PADDING, OUTER_PADDING } from '../Constants'
import { EditingSheetInputField } from '../Inputs'

interface AddressEditorSubSheetInterface {
  street: string
  setStreet: (_: string) => any
  city: string
  setCity: (_: string) => any
  country: string
  setCountrySheet: (_: boolean) => any
}
/**
 * A subsheet to nest into an editing sheet. 
 * Enables the user to edit an address thanks to 3 fields, one for the : 
 * - street
 * - city
 * - country
 */
export default function AddressEditorSubSheet({ street, setStreet, city, setCity, country, setCountrySheet }: AddressEditorSubSheetInterface) {
  return (
    <EditingSubSheetOuterDiv>
      <div className='flex flex-col justify-start items-start w-full' style={{ paddingBottom: OUTER_PADDING }}>
        <>
          <p style={Object.assign({}, TextStyles.medium15, { paddingTop: MINI_PADDING + INNER_PADDING, paddingBottom: MINI_PADDING })}>{localization.street_address}</p>
          <EditingSheetInputField
            infoType="street"
            value={street}
            setValue={setStreet}
            valuePlaceholder={localization.enter_a_street}
            avoidLineBreaks
          />

          <p style={Object.assign({}, TextStyles.medium15, { paddingTop: MINI_PADDING + INNER_PADDING, paddingBottom: MINI_PADDING })}>{localization.city}</p>
          <EditingSheetInputField
            infoType="city"
            value={city}
            setValue={setCity}
            valuePlaceholder={localization.enter_a_city}
            avoidLineBreaks
          />

          <p style={Object.assign({}, TextStyles.medium15, { paddingTop: MINI_PADDING + INNER_PADDING, paddingBottom: MINI_PADDING })}>{localization.country}</p>
          <InfoInputButton infoType={"country"} label={localization.country} infoValue={country} onClick={() => { setCountrySheet(true) }} />

        </>
      </div>
    </EditingSubSheetOuterDiv>
  )
}
