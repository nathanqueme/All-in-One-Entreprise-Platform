//
//  LocalizationEditorSubSheet.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/29/22
//

import React from 'react'
import Colors from '../../../assets/Colors'
import { LanguageMetadataObj, LocalizedText, LocalizedTextObj } from '../../../Data'
import localization from '../../../utils/localizations'
import { SelectableCountryList } from '../../selectors/CountrySelection'
import { WindowHeight } from '../../WindowHeight'
import { InfoInputButton } from '../Buttons'
import { INNER_PADDING, OUTER_PADDING } from '../Constants'
import EditingSubSheetOuterDiv from '../EditingSubSheetOuterDiv'
import { EditingSheetInputField } from '../Inputs'
import { MiniSheet } from '../MiniSheet'


interface LocalizationEditorSubSheetInterface {
  originalLanguage: string
  originalLanguageIsSet: boolean
  targetLanguage: string
  setDescription: React.Dispatch<React.SetStateAction<LocalizedText | undefined>>
  descriptionText: string
  handleDescriptionText: (text: string, isDescriptionTranslation?: boolean) => any
  descriptionInTargetLanguage?: LocalizedText
  setDescriptionInTargetLanguage: React.Dispatch<React.SetStateAction<LocalizedText | undefined>>
  descriptionInTargetLanguageText: string
  descriptionLenghtOk: boolean
  // MINI SHEETS
  originalLanguageSheet: boolean
  setOriginalLanguageSheet: React.Dispatch<React.SetStateAction<boolean>>
  targetLanguageSheet: boolean
  setTargetLanguageSheet: React.Dispatch<React.SetStateAction<boolean>>

}
export default function LocalizationEditorSubSheet({
  originalLanguage,
  originalLanguageIsSet,
  targetLanguage,
  setDescription,
  descriptionText,
  handleDescriptionText,
  descriptionInTargetLanguage,
  setDescriptionInTargetLanguage,
  descriptionInTargetLanguageText,
  descriptionLenghtOk,
  // MINI SHEETS
  originalLanguageSheet,
  setOriginalLanguageSheet,
  targetLanguageSheet,
  setTargetLanguageSheet
}: LocalizationEditorSubSheetInterface) {

  // VALUES
  const WINDOW_HEIGHT = WindowHeight()

  return (
    <EditingSubSheetOuterDiv>
      <div id="localization_row" className='flex items-start justify-start w-full h-full'>
        <div id={"left"} style={{ width: "50%", paddingTop: INNER_PADDING / 1.5, paddingRight: INNER_PADDING, paddingBottom: OUTER_PADDING }} className='flex flex-col justify-start items-start h-full'>
          <InfoInputButton infoType={"translation"} label={localization.original_language} infoValue={originalLanguage} onClick={() => { setOriginalLanguageSheet(true) }} displayIcon={false} width={"100%"} disabled={originalLanguageIsSet}
            miniSheet={
              originalLanguageSheet &&
              <MiniSheet marginLeft={0} setShow={setOriginalLanguageSheet} displayControlBar={false} absolutePosition="top-0" width="100%" content={
                <SelectableCountryList selectedCountryName={originalLanguage} already_selected_country_name={targetLanguage} setSelectedCountry={(country) => {
                  setDescription((prevV) => {
                    return LocalizedTextObj(LanguageMetadataObj(country.name, country.country_code), prevV?.text ?? "")
                  })
                  setOriginalLanguageSheet(false)
                }} />
              } />
            } />

          <EditingSheetInputField
            infoType="description"
            value={descriptionText}
            setValue={(text) => { handleDescriptionText(text) }}
            valuePlaceholder={localization.describe_your_post}
            extraInfo={`${descriptionText.length}/1000`}
            invalidAppearance={!descriptionLenghtOk}
            marginTop={INNER_PADDING}
            minHeight={WINDOW_HEIGHT * 0.56}
            disabled
            fixedHeight
          />
        </div>
        <div className='h-full' style={{ borderColor: Colors.borderGray, borderWidth: 0.5 }} />
        <div id={"right"} style={{ width: "50%", paddingTop: INNER_PADDING / 1.5, paddingLeft: INNER_PADDING, paddingBottom: OUTER_PADDING }} className='flex flex-col justify-start items-start h-full'>
          <InfoInputButton infoType={"translation"} label={localization.translation_language} infoValue={descriptionInTargetLanguage?.language_metadata.name ?? ""} onClick={() => { setTargetLanguageSheet(true) }} displayIcon={false} width={"100%"}
            miniSheet={
              targetLanguageSheet &&
              <MiniSheet marginLeft={0} setShow={setTargetLanguageSheet} displayControlBar={false} absolutePosition="top-0" width="100%" content={
                <SelectableCountryList selectedCountryName={descriptionInTargetLanguage?.language_metadata.name ?? ""} already_selected_country_name={originalLanguage} setSelectedCountry={(country) => {
                  setDescriptionInTargetLanguage((prevV) => {
                    return LocalizedTextObj(LanguageMetadataObj(country.name, country.country_code), prevV?.text ?? "")
                  })
                  setTargetLanguageSheet(false)
                }} />
              } />
            } />


          <EditingSheetInputField
            infoType="description"
            value={descriptionInTargetLanguageText}
            setValue={(text) => { handleDescriptionText(text, true) }}
            valuePlaceholder={localization.describe_your_post}
            extraInfo={`${descriptionInTargetLanguageText.length}/1000`}
            invalidAppearance={!descriptionLenghtOk}
            marginTop={INNER_PADDING}
            minHeight={WINDOW_HEIGHT * 0.56}
            fixedHeight
          />
        </div>
      </div>
    </EditingSubSheetOuterDiv>
  )
}
