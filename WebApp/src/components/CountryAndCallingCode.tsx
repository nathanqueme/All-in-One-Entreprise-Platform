

import React from "react"
import '../styles/TextStyles.css'
import Colors from "../assets/Colors"
import TextStyles from "../styles/TextStyles"


interface CountryAndCallingCodeInterface {
    country_code: string
    calling_code: string
    onClick: () => any
}


export default function CountryAndCallingCode({ country_code, calling_code, onClick }: CountryAndCallingCodeInterface) {
    return (
        <p
            className='pl-4 min-w-fit cursor-pointer hover:opacity-70'
            onClick={() => { onClick() }}
            style={Object.assign({}, TextStyles.calloutMedium,{ color: Colors.darkBlue })}
        >{country_code} (+{calling_code})</p>
    )
}