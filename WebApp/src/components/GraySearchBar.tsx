//
//  GraySearchBar.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React, { useEffect, useRef } from "react"
import '../styles/MainStyles.css'
import '../styles/TextStyles.css'
import colors from '../assets/Colors'
import localization from "../utils/localizations"
import { SearchIcon } from './Icons'
import TextStyles from "../styles/TextStyles"


interface SearchBarInterface {
    text: string
    setText: (_: string) => any
    becomeActive: boolean
    focusDelay?: number
}
export default function SearchBar({ text, setText, becomeActive, focusDelay = 500 }: SearchBarInterface) {


    const textInputRef = useRef("searchTextInput")


    // Intitialization
    useEffect(() => {
        if (becomeActive) {
            setTimeout(() => {
                (textInputRef.current as any).focus()
            }, focusDelay)
        }
    }, [])


    return (
        <div className='roundedContainer touch-auto' style={{ backgroundColor: colors.lightGray }}>
            <div className='flex items-center justify-between mx-3'>
                <div className='mr-3'>
                    <SearchIcon />
                </div>

                <input className='h-10 bg-transparent rounded-xl outline-none border-none flex-grow'
                    autoComplete='off'
                    autoCapitalize='words'
                    spellCheck={false}
                    style={Object.assign({}, TextStyles.calloutMedium,{ color: colors.black })}
                    type='text'
                    placeholder={localization.search}
                    value={text}
                    onChange={event => { setText(event.target.value) }}
                />
            </div>
        </div>
    )
}

