//
//  TabsRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/22/22.
//

import React, { useState, useEffect } from "react"
import localization from "../utils/localizations"
import colors from "../assets/Colors"
import TextStyles from '../styles/TextStyles'
import { Link } from 'react-router-dom'
import { capitalize } from "./functions"





interface TabsButtonsInterface {
    tabs: TabType[]
    currentMainTab: TabType
    username: string
}
/**
 * Tabs with their buttons 
 */
export function TabsButtons({ tabs, currentMainTab, username }: TabsButtonsInterface) {

    // States 
    const [measures, setMeasures]: [DOMRect[], any] = useState([]) // An array of (x, y, width, height, ...)


    // Values 
    let currentMainTabWithFallback = tabs.includes(currentMainTab) ? currentMainTab : "home"


    // Initialization of measures
    // N.B. : if there is padding or space on sides the indicator's x is offseted to the right of the space.
    // e.g. : on desktops if there is 60px of spacing on the horizontal sides the indicator will be offseted of an extra marginLeft: 60px
    useEffect(() => {

        getMeasures()
        window.addEventListener("resize", getMeasures)

    }, [])

    function getMeasures() {
        let m: DOMRect[] = []
        let tabsContainer = document.getElementById("tabsContainer")
        if (tabsContainer === null) return
        let containerXOffset = tabsContainer!.getBoundingClientRect().x

        tabs.forEach((tabType, index) => {
            let tabDiv = document.getElementById(tabType)
            if (tabDiv === null) return
            let divMeasures = tabDiv.getBoundingClientRect()
            divMeasures.x = divMeasures.x - containerXOffset // Extra offset correction

            m.push(divMeasures)
            if (m.length === tabs.length) setMeasures(m)
        })
    }


    return (
        <div className='flex flex-col relative' style={{ marginLeft: 20 }}>
            <div id="tabsContainer" className='flex items-center justify-center'>
                {tabs.map((tabType, index) => {
                    return (
                        <TabCell
                            key={index}
                            type={tabType}
                            link={`/${username}/${tabType !== "home" ? tabType + "/" : ""}`}
                            currentMainTab={currentMainTabWithFallback}
                        />
                    )
                })
                }
            </div>

            {(tabs.length === measures.length) &&
                <Indicator
                    tabs={tabs}
                    currentMainTab={currentMainTabWithFallback}
                    measures={measures}
                />
            }
        </div>
    )
}







interface TabCellInterface {
    type: TabType
    link: string
    currentMainTab: TabType
}
{/* A button with the name of the tab. */ }
function TabCell({ type, link, currentMainTab }: TabCellInterface) {


    // States 
    const [isHovered, setIsHovered] = useState(false)


    // Values 
    let isSelectedTab = currentMainTab === type


    return (
        <Link to={link} className="active:bg-gray-100">
            <div id={type} className='justify-center items-center' style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 14, paddingBottom: 14 }} onMouseOver={() => { setIsHovered(true) }} onMouseLeave={() => { setIsHovered(false) }}>
                <p className='text-black' style={Object.assign({}, TextStyles.medium15, {
                    opacity: isHovered || isSelectedTab ? 1 : 0.3
                })}>{(getTabDescription(type) ?? "").toUpperCase()}</p>
            </div>
        </Link>
    )
}





interface IndicatorInterface {
    tabs: TabType[]
    currentMainTab: TabType
    measures: DOMRect[]
}
{/* A thick black divider. */ }
function Indicator({ tabs, currentMainTab, measures }: IndicatorInterface) {

    // Values
    let selectedTabIndex = tabs?.findIndex(e => { return e === currentMainTab })
    let matchingTabMeasures = measures[selectedTabIndex]

    return (
        <div className="a absolute left-0 right-0" style={{
            bottom: 0,
            height: 3,
            backgroundColor: colors.black,
            width: matchingTabMeasures.width,
            marginLeft: matchingTabMeasures.x
        }} />
    )
}












export type TabType = 'home' | 'in_the_place' | 'about' | 'menu' | 'map' | // Mains tabs 
    'posts' | 'r_i' // Secondary tabs 
export interface TabData {
    type: TabType
    ref: React.RefObject<any>
}

export interface TabMetadata {
    type: TabType
    name: string
}
export function TabMetadataObj(type: TabType, name: string) {
    return {
        type: type,
        name: name,
    }
}

let tabsMetadata: TabMetadata[] = [
    TabMetadataObj("home", localization.home),
    TabMetadataObj("in_the_place", localization.in_the_place),
    TabMetadataObj("about", localization.about)
]

function getTabDescription(type: TabType) {
    let tabMetadata = tabsMetadata?.find(e => { return e.type === type })
    return tabMetadata?.name ?? ""
}