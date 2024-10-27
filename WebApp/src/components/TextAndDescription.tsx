//
//  TextAndDescription.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 07/27/22
//


// @ts-check
import React, { useState } from 'react'
import '../styles/TextStyles.css'
import colors from '../assets/Colors'
import { CertificationBadgeIcon } from '../components/Icons'
import TextStyles from '../styles/TextStyles'


/** 
   A view that displays text and its description if any at the bottom. 
   On the app : 
   - The a single line text is by default black and gets truncated when tacking to much space.
   - The single line description is in gray and gets truncated too when too large.
 */
interface TextAndDescriptionInterface {
    text: string
    description: string
    numberOfLinesForDescription?: number
    doNotLimitDescriptionNumberOfLines?: boolean
    textColor?: string
    certificationBadge?: boolean
    paddingLeft?: number
    alignItemsCenter?: boolean
}
export default function TextAndDescription({ text, description, numberOfLinesForDescription = 1, doNotLimitDescriptionNumberOfLines = false, textColor = colors.black, certificationBadge = false, paddingLeft = 0, alignItemsCenter = false }: TextAndDescriptionInterface) {
    return (
        <div className={`flex flex-col justify-center ${alignItemsCenter ? "items-center" : "items-start"}`} style={{ paddingLeft: paddingLeft }}>
            {/* Headertext + (badge) */}
            <div className='flex items-center justify-center'>
                <p style={Object.assign({}, TextStyles.calloutMedium,{ color: colors.black })}>{text}</p>
                {certificationBadge &&
                    <div style={{ paddingLeft: 4 }}>
                        <CertificationBadgeIcon size={"1.3em"} />
                    </div>
                }
            </div>

            {/* Gray description */}
            {((description ?? "") !== "") &&
                <p className='gray13' style={{ marginTop: 2, textAlign: alignItemsCenter ? "center" : "start" }}>{description}</p>
            }
        </div>
    )
}
