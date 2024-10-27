//
//  CountrySelection.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 11/21/22.
//

import React, { useEffect, useState } from 'react'
import Colors from '../../assets/Colors'
import countriesInUserLanguage, { Country } from '../../assets/CountriesList'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import Divider from '../Divider'
import GraySearchBar from '../GraySearchBar'
import SelectedCircle from '../SelectedCircle'



interface SelectableCountryUiInterface {
    country: Country
    displayCallingCodes: boolean
    onClick: (_: Country) => any
    isSelected: boolean
    isNotSelectable?: boolean
}
/**
 * 
 * The name of the language and optionally its country code at the right.
 * e.g. : Switzerland +41      
 * 
*/
function SelectableCountryUi({ country, displayCallingCodes, onClick, isSelected, isNotSelectable = false }: SelectableCountryUiInterface) {
    return (
        <button
            className={`${isSelected ? "brightness-95" : "hover:brightness-95"} flex items-center justify-between w-full overflow-hidden`}
            style={{ backgroundColor: Colors.white, opacity: isNotSelectable ? 0.25 : 1, height: 40 }}
            onClick={() => { if (!isNotSelectable) onClick(country) }}
        >

            <div className='flex items-start justify-center' style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}>
                {displayCallingCodes &&
                    <div className='self-start flex items-start' style={{ width: 54 }}>
                        <p style={Object.assign({}, TextStyles.medium15, { color: Colors.black })}>{"+" + country.calling_code}</p>
                    </div>
                }
                <p style={Object.assign({}, TextStyles.medium15, { color: Colors.black })}>{country.name}</p>
            </div>

            {/*
                <div style={{ paddingRight: 20 }}>
                <SelectedCircle isSelected={isSelected} />
            </div>
           */}

        </button>
    )
}




interface SelectableCountryListInterface {
    selectedCountryName: string
    setSelectedCountry: (_: Country) => any
    displayCallingCodes?: boolean
    already_selected_country_name?: string
}
/**
 * (WIDE DEVICES ONLY)
 * 
 * A list of countries the user can select, with their name, country calling code and a search bar at the top.
 */
export function SelectableCountryList({ selectedCountryName, setSelectedCountry, displayCallingCodes = false, already_selected_country_name }: SelectableCountryListInterface) {

    // States 
    const [search, setSearch] = useState("")

    // Values 
    const scrollViewId = "countries_scrollview"
    const matchingCountries =
        countriesInUserLanguage.filter(Country => { return Country.name.toLowerCase().startsWith(search.toLowerCase().trim()) || Country.calling_code.startsWith(search.trim()) })
            // Sorted aplhabetically 
            // See answer 1397 for more info : https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            .sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })

    // RESET
    useEffect(() => {
        setSearch("")
        // Scroll to selection
        let index = matchingCountries.findIndex(e => { return e.name === selectedCountryName })
        if (index === -1) { return }
        let scrollView = document.getElementById(scrollViewId); if (scrollView === null) { return }
        scrollView.scroll(0, (index - 5) * 40) 
    }, [])


    return (
        <div id={scrollViewId} className='overflow-y-scroll' style={{ height: 320 * 2 }}>

            <div style={{ marginInline: 20, marginTop: 10, marginBottom: 10 }}>
                <GraySearchBar text={search} setText={setSearch} becomeActive={false} />
            </div>


            {(matchingCountries.length !== 0 ?
                <Divider marginLeft={20} /> :
                <p style={Object.assign({}, TextStyles.callout, { marginHorizontal: 20, color: Colors.black })}>{localization.no_results_found}</p>
            )
            }


            <ul className='flex flex-col items-start justify-start w-full'>
                <div style={{ height: 10 }} /> {/* Makes equally spaced + avoids to apply rounded border to button */}
                {matchingCountries.map((e, index) => {
                    return (
                        <li key={index} className="w-full">
                            <SelectableCountryUi
                                country={e}
                                displayCallingCodes={displayCallingCodes}
                                onClick={() => {
                                    setSelectedCountry(e)
                                }}
                                isSelected={selectedCountryName === e.name}
                                isNotSelectable={already_selected_country_name === e.name}
                            />
                        </li>
                    )
                })}
                <div style={{ height: 10 }} /> {/* Makes equally spaced + avoids to apply rounded border to button */}
            </ul>

        </div>
    )
}