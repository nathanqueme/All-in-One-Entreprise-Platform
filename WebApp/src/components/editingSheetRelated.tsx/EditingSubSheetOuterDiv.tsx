//
//  EditingSubSheetOuterDiv.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/17/22
//

import React from 'react'
import { INNER_PADDING } from './Constants'


interface EditingSubSheetOuterDivInterface {
    children: any
    paddingInline?: number
}
/**
 * The div that has to be around a SubSheet.
 */
export default function EditingSubSheetOuterDiv({ children, paddingInline = INNER_PADDING }: EditingSubSheetOuterDivInterface) {
    return (
        <div id={"editor_scrollview"} className='relative overflow-y-scroll flex flex-col items-start justify-start h-full w-full' style={{ paddingInline: paddingInline }}>
            {children}
        </div>
    )
}
