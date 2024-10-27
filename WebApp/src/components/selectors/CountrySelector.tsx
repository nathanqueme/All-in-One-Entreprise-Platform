//
//  CountrySelector.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 07/25/22.
//


import React, { useState, useEffect } from 'react'
import '../../styles/TextStyles.css'
import colors from './../../assets/Colors'
import countriesInUserLanguage from './../../assets/CountriesList'
import Divider from '../../components/Divider'
import GraySearchBar from '../GraySearchBar'
import localization from '../../utils/localizations'
import TextStyles from '../../styles/TextStyles'
import { ClassicHeader } from '../headersComponents'
import { isMobileHook } from '../functions'



const isMobile = isMobileHook()



interface CountrySelectorInterface {
    displayCallingCodes: boolean
    showSelector: boolean
    setShowSelector: (_: any) => any
    handleSelection: (_: any) => any
}
/**
 * On desktops looks like an "ActionSheet".
 * On small devices looks like a page occupying the full width.
 */
export default function CountrySelector({ displayCallingCodes, showSelector, setShowSelector, handleSelection }: CountrySelectorInterface) {

    // States
    const [search, setSearch] = useState('')
    const [countries, setCountries] = useState([] as any[])


    // Values
    let matchingCountries =
        countries.filter(Country => { return Country.name.toLowerCase().startsWith(search.toLowerCase().trim()) || Country.calling_code.startsWith(search.trim()) })
            // Sorted aplhabetically 
            // See answer 1397 for more info : https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            .sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })



    // Initialization
    useEffect(() => {
        if (!showSelector) {
            setCountries([])
            setSearch('')
        }
        else {
            setTimeout(() => {
                // Get Countriess
                console.log("\n\n\n-------------Init countries-------------")
                setCountries(countriesInUserLanguage)
            }, 0)
        }
    }, [showSelector])



    if (showSelector) {
        return (
            // Black background 
            <div className='fixed bg-black bg-opacity-70 inset-0 flex justify-center items-center z-40'>

                {/* Detects close gestures */}
                <div className='flex w-full h-full absolute z-30' onClick={() => { setShowSelector(false) }} />

                {/* Selector */}
                <div className={`bg-clip-content flex flex-col z-50 ${isMobile ? "w-full" : "rounded-xl w-96 mx-5"}`} style={{ backgroundColor: colors.whiteToGray2, height: isMobile ? window.innerHeight : window.innerHeight * 0.65 }}>
                    <ClassicHeader
                        onClose={() => {
                            setShowSelector(false)
                        }}
                        closeButtonType={'cancelText'}
                        headerText={displayCallingCodes ? localization.calling_codes : localization.countries}
                        backgroundColor={colors.clear}
                    />

                    {/* Searchbar + Countries */}
                    <div className='overflow-y-scroll overflow-x-hidden'>
                        <div>
                            <div className='my-2 mx-5'>
                                <GraySearchBar text={search} setText={setSearch} becomeActive={false} />
                            </div>

                            {/* No results */}
                            {countries.length > 0 ?
                                matchingCountries.length !== 0 ?
                                    <Divider marginLeft={20} />
                                    :
                                    <p style={Object.assign({}, TextStyles.calloutMedium,{ color: colors.black, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 })}>{localization.no_results_found}</p>
                                :
                                null
                            }

                        </div>

                        {/* Matching countries */}
                        <ul className=''>
                            {matchingCountries.map((e, index) => {
                                return (
                                    <div key={e.country_code}>
                                        <SelectableCountryUi
                                            country={e}
                                            displayCallingCodes={displayCallingCodes}
                                            onClick={() => {
                                                handleSelection(e)
                                            }}
                                        />
                                        {index !== (countries.length - 1) &&
                                            <Divider marginLeft={20} />
                                        }
                                    </div>
                                )
                            })}
                        </ul>

                    </div>
                </div >
            </div>
        )
    } else {
        return null
    }
}






interface SelectableCountryUiInterface {
    country: any
    displayCallingCodes: boolean
    onClick: () => any
}
/**
 * 
 * The name of the language and optionally its country code at the right.
 * e.g. : Switzerland             +41      
 * 
 */
const SelectableCountryUi = ({ country, displayCallingCodes, onClick }: SelectableCountryUiInterface) => {
    return (
        <div className='flex items-center justify-between p-5 cursor-pointer active:bg-gray-100' onClick={() => { onClick() }}>
            <p style={Object.assign({}, TextStyles.calloutMedium,{ color: colors.black })}>{country.name}</p>

            {displayCallingCodes &&
                <p style={Object.assign({}, TextStyles.calloutMedium,{ color: colors.black })}>+{country.calling_code}</p>
            }
        </div>
    )
}






