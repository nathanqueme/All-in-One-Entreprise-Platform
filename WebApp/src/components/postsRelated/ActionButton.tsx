//
//  ActionButton.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 10/23/22
//

import React from 'react'
import colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import { AnalyticsIcon, EllipsisIcon, MapPinIcon, SearchIcon, WebsiteIcon } from "../Icons"



type ActionButtonType = 'link' | 'share' | 'address' | 'options' | 'analytics' | 'search'
interface ActionButtonInterface {
    type: ActionButtonType
    onClick: () => any
    pressable?: boolean
    placeholder?: string
    marginRight?: boolean
    link?: string
}
/** Enables users to interact with the content they are seeing. For instance by looking at the linked website, address or sharing the content. */
export default function ActionButton({ type, onClick, pressable = true, placeholder, marginRight = false, link }: ActionButtonInterface) {

    const border_radius = 80
    const padding = 10.5
    const margin_right = marginRight ? 14 : 0

    function getIcon() {
        switch (type) {
            case 'address': return <MapPinIcon fontSize={20} />
            case 'analytics': return <AnalyticsIcon fontSize={20} />
            case 'link': return <WebsiteIcon fontSize={20} />
            case 'options': return <EllipsisIcon fontSize={19} />
            case 'search': return <SearchIcon fontSize={19} color={colors.black}/>
            case 'share': return null
        }
    }
    function getPlaceholder() {
        if ((placeholder ?? "").replace(/\s+/g, '') !== "") return placeholder
        switch (type) {
            case 'address': return localization.address
            // case 'analytics': return localization.analytics
            case 'link': return localization.link
            // case 'options': return localization.options
            // case 'search': return localization.search
            case 'share': return localization.share
        }
    }

    function UI(marginRight = 0) {
        return ((type === "options") || (type === "analytics") || (type === "search")) ?
            <div className='relative' style={{ height: 36, width: 36, padding: padding, backgroundColor: colors.softGray, borderRadius: border_radius, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <div className=' absolute'>{getIcon()}</div>
            </div>
            :
            <div style={{ height: 36, marginRight: marginRight, paddingLeft: padding, backgroundColor: colors.softGray, borderRadius: border_radius, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                {getIcon()}
                <p style={{ paddingLeft: 6, paddingRight: padding, fontSize: 13, fontWeight: "500", }}>{getPlaceholder()}</p>
            </div>
    }

    if ((link ?? "") !== "") {
        return (
            <a href={link} target="_blank" className='active:brightness-95 cursor-pointer' onClick={() => { onClick() }} style={{ borderRadius: border_radius, marginRight: margin_right }}>
                {UI()}
            </a>
        )
    }
    if (pressable) {
        return (
            <div className='active:brightness-95 cursor-pointer' onClick={() => { onClick() }} style={{ borderRadius: border_radius, marginRight: margin_right }}>
                {UI()}
            </div>
        )
    } else {
        return UI(margin_right)
    }
}