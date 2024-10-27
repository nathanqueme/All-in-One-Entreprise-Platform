//
//  InfoDisplay.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState } from 'react'
import localization from '../../utils/localizations'
import { TextStylesInterface } from '../styles/TextStyles'
import { ColorsInterface } from './../../assets/Colors'
import { Text, View, Pressable, StyleSheet, TouchableHighlight } from 'react-native'
import { getDayName, getCurrentDay, getIsOpenOrAvailableText, getDailyTimetablesOfGivenDay, checkIfIsInTimeInterval, getDailyTimetableDescription, getTemporaryTimeDescriptiveText } from '../functions'
import { ChevronSymbol, WebsiteSymbol, MapPinSymbol, PhoneSymbol, TextSymbol, EmailSymbol, PersonSymbol, PencilSymbol, InfoCircleSymbol, ClockSymbol, EllipsisSymbol, CategorySymbol } from '../Symbols'
import { getInfoMetada, InformationMetada, InformationType } from '../../Types'
import { Timetables } from '../../Data'
import { getTimetablesDescriptiveText } from './TimetablesRelated'





interface InfoUIInterface {
    infoType: InformationType
    infoValue: string
    pressable: boolean
    setSelectedInfoType: any
    setSelectedInfoValue: any
    displayInfoName: boolean
    displayChevron: boolean
    fixedSize: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    lineLimit?: number
}
/** 
 * An information with its name in small gray at the top left and its value in the center.
 */
export function InfoUI({ infoType, infoValue, pressable = true, setSelectedInfoType, setSelectedInfoValue, displayInfoName = true, displayChevron, fixedSize = false, COLORS, TEXT_STYLES, lineLimit }: InfoUIInterface) {
    let infoMetada = getInfoMetada(infoType)


    return (
        <Pressable
            onPress={() => {
                setSelectedInfoType(infoType)
                setSelectedInfoValue(infoValue)
            }}
            disabled={!pressable}
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flex: 1,
                backgroundColor: COLORS.white,
                padding: 20,
            }}>



            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingRight: displayChevron && infoValue !== "" ? 10 : 0, // Space with the chevron
            }}>


                {/* Long value description */}
                {infoValue !== '' && displayInfoName ?
                    <Text style={[TEXT_STYLES.gray13Text, { paddingBottom: 6 }]} >{infoMetada?.placeholder ?? localization.value}</Text> :
                    null
                }



                {/* Value */}
                {infoValue === '' ?
                    <Text style={[TEXT_STYLES.calloutMedium, { color: 'rgba(192, 192, 192, 1)' }]} >{infoMetada?.placeholder ?? localization.value}</Text>
                    :
                    (fixedSize ?
                        <Text style={[TEXT_STYLES.calloutMedium, { color: COLORS.black, lineHeight: 21 }]} >{infoValue}</Text> :
                        <Text
                            numberOfLines={lineLimit}
                            ellipsizeMode='tail'
                            style={[TEXT_STYLES.callout, { color: COLORS.black }]}
                        >{infoValue} </Text>
                    )
                }
            </View>



            {(displayChevron && infoValue !== "") ?
                <ChevronSymbol /> : null
            }



        </Pressable>
    )
}




interface InfoWithSymbolUIInterface {
    infoType: InformationType
    infoValue: any
    pressable: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    customDisplayName?: string
    displayInBlue?: boolean
    displayNameInstead?: boolean
    displayChevron?: boolean
    setSelectedInfoType: any
    setSelectedInfoValue: any
    blackSchemeAppearance?: boolean
    backgroundColor?: string
    displayInfoTypeName?: boolean
    paddingHorizontal?: number
}
/**
 *  An information in a row with its symbol at the left and its value at the rigth.
 * 
 * Supports displaying a "Translate text" button.
 */
export function InfoWithSymbolUI({ infoType, infoValue, pressable, COLORS, TEXT_STYLES, customDisplayName, displayInBlue = false, displayNameInstead = false, displayChevron = false, setSelectedInfoType, setSelectedInfoValue, blackSchemeAppearance = false, backgroundColor = COLORS.whiteToGray2, displayInfoTypeName = false, paddingHorizontal = 16 }: InfoWithSymbolUIInterface) {

    // States 
    const [hasMultipleLines, setHasMultipleLines] = useState(false)


    // Values 
    let infoMetada = getInfoMetada(infoType)


    return (
        <TouchableHighlight activeOpacity={0.9}
            onPress={() => {
                setSelectedInfoType(infoType)
                setSelectedInfoValue(infoValue)
            }}
            disabled={!pressable}
        >
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignContent: "center",
                    alignSelf: "center",
                    backgroundColor: blackSchemeAppearance ? COLORS.bgDarkGray : backgroundColor,
                    paddingRight: 20,
                    paddingVertical: 12,
                }}>



                {/*
                    Info symbol / Logo  
                    8 of padding at the top is needed when more than one line. Otherwise it is slightly moved at the top.
                */}
                <View style={{ paddingTop: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: paddingHorizontal }}>
                    <View style={{ width: 28, justifyContent: "center", alignItems: "center", display: "flex" }}>
                        <InfoSymbol COLORS={COLORS} infoType={infoType} color={blackSchemeAppearance ? "white" : undefined} />
                    </View>
                </View>



                {/* Value */}
                <View style={{
                    flex: 1,
                    paddingRight: 10,
                }}>
                    {infoType !== 'timetables' ?
                        <DefaultInfoUi
                            infoValue={infoValue}
                            infoMetada={infoMetada}
                            displayInBlue={displayInBlue}
                            customDisplayName={customDisplayName}
                            displayNameInstead={displayNameInstead}
                            setHasMultipleLines={setHasMultipleLines}
                            blackSchemeAppearance={blackSchemeAppearance}
                            displayInfoTypeName={displayInfoTypeName}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />
                        :
                        <TimetablesInfoUi
                            timetables={infoValue}
                            infoMetada={infoMetada}
                            blackSchemeAppearance={blackSchemeAppearance}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />
                    }
                </View>



                {displayChevron &&
                    <View style={{ paddingTop: hasMultipleLines ? 8 : 2 }}>
                        <ChevronSymbol />
                    </View>
                }



            </View>
        </TouchableHighlight>
    )
}




/**
 * Displays the correct info symbol based on the provided infoType.
 */
export function InfoSymbol({ infoType, COLORS, color }: { infoType: InformationType, COLORS: ColorsInterface, color?: string }) {
    return (
        <View>
            {
                (() => {
                    switch (infoType as InformationType) {
                        case 'location_in_place':
                        case 'geolocation': return <MapPinSymbol COLORS={COLORS} color={color} />
                        case 'phoneNumber': return <PhoneSymbol COLORS={COLORS} color={color} />
                        case 'link':
                        case 'website_link': return <WebsiteSymbol COLORS={COLORS} color={color} />
                        case 'name':
                        case 'account_name': return <TextSymbol COLORS={COLORS} color={color} />
                        case 'email': return <EmailSymbol COLORS={COLORS} color={color} />
                        case 'username': return <PersonSymbol COLORS={COLORS} color={color} />
                        case 'description': return <InfoCircleSymbol COLORS={COLORS} color={color} />
                        case 'timetables': return <ClockSymbol COLORS={COLORS} color={color} />
                        case 'options': return <EllipsisSymbol COLORS={COLORS} color={color} />
                        case 'category': return <CategorySymbol COLORS={COLORS} color={color} />
                        case 'translation':
                        default: return <PencilSymbol COLORS={COLORS} color={color} />
                    }
                })()
            }
        </View>
    )

}



interface DefaultInfoUiInterface {
    infoValue: string
    infoMetada: InformationMetada
    displayInBlue: boolean
    customDisplayName: string
    displayNameInstead: boolean
    setHasMultipleLines: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
    blackSchemeAppearance?: boolean
    displayInfoTypeName?: boolean
}
/**
 * - Displays the text of the info.
 * - When the infoValue is undefined displays a 'EmptyInfoUi'. 
*/
function DefaultInfoUi({ infoValue, infoMetada, displayInBlue, customDisplayName, displayNameInstead, setHasMultipleLines, COLORS, TEXT_STYLES, blackSchemeAppearance = false, displayInfoTypeName = false }: DefaultInfoUiInterface) {
    return (
        <View>
            {infoValue === '' ?
                <EmptyInfoUi TEXT_STYLES={TEXT_STYLES} placeholder={infoMetada?.placeholder ?? 'Value'} />
                :
                <Text
                    style={[
                        TEXT_STYLES.calloutMedium,
                        { color: displayInBlue ? COLORS.darkBlue : (blackSchemeAppearance ? "white" : COLORS.black) }
                    ]}
                    onTextLayout={(e) => { setHasMultipleLines(e.nativeEvent.lines.length > 1) }}
                >{customDisplayName ? customDisplayName : displayNameInstead ? infoMetada.name : infoValue}</Text>
            }
            {displayInfoTypeName && <Text style={TEXT_STYLES.gray13Text}>{infoMetada.name}</Text>}
        </View>)
}






interface TimetablesInfoUiInterface {
    timetables: Timetables
    infoMetada: InformationMetada
    blackSchemeAppearance: boolean
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
   - A view that displays the open or available (#) state, the current day's name and day number and 'See more' text at the bottom.
   - When timetables are undefined displays a 'EmptyInfoUi'.
   - (#) : 'Open' / 'Closed' or 'Available'/'Not available'
 */
export function TimetablesInfoUi({ timetables, infoMetada, blackSchemeAppearance, COLORS, TEXT_STYLES }: TimetablesInfoUiInterface) {


    // Values 
    let hasTimetables = (timetables !== undefined) && ((timetables?.daily_timetables?.length ?? 0) > 0)
    let currentDay = getCurrentDay()
    let yesterdayDailyTimetables = hasTimetables ? getDailyTimetablesOfGivenDay(currentDay === 0 ? 6 : currentDay - 1, timetables.daily_timetables) : undefined
    let currentDayDailyTimetables = hasTimetables ? getDailyTimetablesOfGivenDay(currentDay, timetables.daily_timetables) : undefined

    // -> today's dailyTimetables may be like 17H00 - 18H00 but yesterday's dailyTimetable may be like 17H00 - 05H00 so if it is currently 04H00 "isOpenOrAvailableTodayWithOtherDay" is true.
    let isOpenOrAvailableTodayWithOtherDay = hasTimetables ? yesterdayDailyTimetables.map(e => {
        let output = checkIfIsInTimeInterval(e)
        return output.isInTimeInterval && output.type === "until_time_in_today_and_in_tomorrow"
    }).includes(true) : undefined
    let isOpenOrAvailableToday = hasTimetables ? currentDayDailyTimetables.map(e => { return checkIfIsInTimeInterval(e).isInTimeInterval }).includes(true) : undefined
    let isOpenOrAvailable = isOpenOrAvailableTodayWithOtherDay || isOpenOrAvailableToday
    let isOpenOrAvailableText = hasTimetables ? getIsOpenOrAvailableText(isOpenOrAvailable, timetables.type) : undefined



    return (
        <View>
            {!hasTimetables ?
                <EmptyInfoUi TEXT_STYLES={TEXT_STYLES} placeholder={infoMetada?.placeholder ?? 'Value'} />
                :
                (timetables?.temporary_time ?? "") !== "" ?
                    <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={[TEXT_STYLES.calloutMedium, { color: COLORS.red }]}
                    >{getTemporaryTimeDescriptiveText(timetables.temporary_time, timetables.type)}</Text>
                    :
                    <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={[
                            TEXT_STYLES.calloutMedium, {
                                color: isOpenOrAvailable ? COLORS.darkBlue : 'orange'
                            }]}
                    >{isOpenOrAvailableText}<Text
                        style={{ color: (blackSchemeAppearance ? "white" : COLORS.black) }}>{' (' + getDayName(getCurrentDay()) + ', ' + currentDayDailyTimetables.map(e => { return getDailyTimetableDescription(e, timetables.type) }).join(", ") + ')'}</Text>
                    </Text>
            }


            <Text
                numberOfLines={1}
                ellipsizeMode='tail'
                style={[
                    TEXT_STYLES.gray13Text,
                    { marginTop: 4 }
                ]}
            >{getTimetablesDescriptiveText(timetables?.type ?? "opening_hours", timetables?.subject)}</Text>
        </View>
    )
}





interface EmptyInfoUiInterface {
    placeholder: string
    TEXT_STYLES: TextStylesInterface
}
/**
 * A gray text of the provided placeholder.
 */
export function EmptyInfoUi({ placeholder, TEXT_STYLES }: EmptyInfoUiInterface) {
    return (
        <Text
            style={[
                TEXT_STYLES.calloutMedium,
                { color: 'rgba(192, 192, 192, 1)' }
            ]}
        >{placeholder}</Text>
    )
}




export const styles = StyleSheet.create({
    imageStyle: {
        width: 26,
        height: 26,
        resizeMode: 'contain'
    }
})
