//
//  Inputs.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/17/22
//

import React, { useState } from 'react'
import Colors from '../../assets/Colors'
import TextStyles from '../../styles/TextStyles'
import { BORDER_RADIUS, MINI_PADDING } from './Constants'
import { InformationType, getInfoMetada } from '../../Types'


// InputFields
interface EditingSheetInputFieldInterface {
    infoType: InformationType
    value: string
    setValue: (_: string) => any
    valuePlaceholder: string
    customPlaceholder?: string
    extraInfo?: string
    icon?: any
    invalidAppearance?: boolean
    avoidLineBreaks?: boolean
    marginTop?: number
    marginBottom?: number
    minHeight?: number
    fixedHeight?: boolean
    disabled?: boolean
    preAddedCharacters?: string
}
/**
 * An input field with a gray rounded border that gets blue when edited, displays the information type in small gray and the information value in black.
 * Can become red when the value is invalid and can display a description at the bottom right. e.g.: "37/200" -> a character limit indicator.
 */
export function EditingSheetInputField({ infoType: infoType, value, setValue, valuePlaceholder: valuePlaceholder, customPlaceholder: customPlaceholder = "", extraInfo: extraInfo = "", icon, invalidAppearance: invalidAppearance = false, avoidLineBreaks: avoidLineBreaks = false, marginTop, marginBottom, minHeight, fixedHeight: fixedHeight = false, disabled = false, preAddedCharacters: preAddedCharacters }: EditingSheetInputFieldInterface) {

    // States
    const [isFocus, setIsFocus] = useState(false)
    const [isHovered, setIsHovered] = useState(false)


    // Values 
    const id = `${infoType}_input`
    const infoMetada = getInfoMetada(infoType)
    const placeholder = customPlaceholder !== '' ? customPlaceholder : infoMetada?.placeholder ?? 'Value'
    const placeholder_color = invalidAppearance ? Colors.red : (isFocus ? Colors.darkBlue : Colors.smallGrayText)
    const border_color = invalidAppearance ? Colors.red : (isFocus ? Colors.darkBlue : Colors.borderGray)
    const backgroundColor = disabled ? Colors.lightGray : Colors.whiteToGray2

    function focusInput() {
        let input_div = document.getElementById(id); if (input_div === undefined) return
        input_div?.focus()
    }

    return (
        <div className='flex flex-col items-start border w-full' style={{ borderColor: isHovered && !isFocus && !invalidAppearance && !disabled ? Colors.smallGrayText : border_color, borderRadius: BORDER_RADIUS, backgroundColor: backgroundColor, marginTop: marginTop, marginBottom: marginBottom, paddingInline: MINI_PADDING, paddingBottom: MINI_PADDING, paddingTop: 6 }} onMouseOver={() => { setIsHovered(true) }} onMouseLeave={() => { setIsHovered(false) }}>
            <p className='w-full flex items-start justify-start text-start' style={{ paddingBottom: 4, color: placeholder_color, fontSize: 12 }}>{placeholder}</p>
            <textarea
                id={id}
                rows={1}
                autoComplete={"off"}
                autoCapitalize={"on"}
                className={`outline-none border-none w-full resize-none ${disabled ? "pointer-events-none" : ""}`}
                style={Object.assign({}, TextStyles.sheetInputFont, { minHeight: minHeight, backgroundColor: backgroundColor })}
                placeholder={valuePlaceholder}
                value={value}
                onChange={event => {
                    let new_text = event.target.value

                    if (avoidLineBreaks && new_text.includes("\n")) {
                        return
                    } else if (fixedHeight !== true) {
                        // Auto expanding
                        const textarea_div = document.getElementById(id); if (textarea_div === null) return
                        textarea_div.style.height = ""; /* Reset the height*/
                        textarea_div.style.height = Math.min(textarea_div.scrollHeight, textarea_div.scrollHeight + 40) + "px";
                    }


                    // ADDING TEXT
                    if ((new_text.length === 1) && (preAddedCharacters) && (value.length === 0)) {
                        setValue(preAddedCharacters + new_text)
                    }
                    // DELETING TEXT
                    else if ((new_text.length <= (preAddedCharacters?.length ?? 0))) {  // ((pre_added_characters) && (new_text.replace(pre_added_characters, "").length === 0))
                        setValue("")
                    }
                    else {
                        setValue(new_text)
                    }


                }}
                onFocus={() => { setIsFocus(true) }}
                onBlur={() => { setIsFocus(false) }}
            />


            {/* EXTRA INFORMATION e.g. : 
                - "37/200" (character counter) 
                - "English, Italian, French" (language detector results)
            */}
            {((extraInfo !== "") || (icon !== undefined)) &&
                <div className='w-full flex items-center justify-between' style={{ marginTop: 2, opacity: isFocus ? 1 : 0 }} onClick={() => { focusInput() }}>
                    <div>
                        {(icon !== undefined) && icon}
                    </div>
                    {extraInfo !== "" &&
                        <p style={{ color: invalidAppearance ? Colors.red : Colors.placeholderGray, fontSize: 12, marginBottom: -2 }}>{extraInfo}</p>
                    }
                </div>
            }
        </div>
    )
}
