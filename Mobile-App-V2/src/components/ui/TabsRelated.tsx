//
//  TabsRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 06/22/22.
//

import React, { useState, useRef, useEffect, forwardRef } from "react"
import localization from "../../utils/localizations"
import { TextStylesInterface } from './../../components/styles/TextStyles'
import { ColorsInterface } from './../../assets/Colors'
import { View, Text, LayoutRectangle, Dimensions, Animated, TouchableHighlight } from "react-native"


const screenWidth = Dimensions.get("screen").width


interface TabsButtonsInterface {
    tabs: TabType[]
    data: TabData[]
    tabsListRef: React.MutableRefObject<any>
    currentTab: TabType
    setCurrentTab: any
    scrollX: Animated.Value
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * Tabs with their buttons 
 */
export function TabsButtons({ tabs, data, tabsListRef, currentTab, setCurrentTab, scrollX, COLORS, TEXT_STYLES }: TabsButtonsInterface) {

    // States 
    const [measures, setMeasures]: [LayoutRectangle[], any] = useState([]) // An array of (x, y, width, height)
    const [initialized, setIniatized] = useState(false)


    // Values
    const containerRef = useRef()
    const tabsButtonsListRef = useRef(null)


    // Initialization of measures
    useEffect(() => {

        if (initialized) return

        let m = []
        data.forEach((i) => {
            i?.ref?.current?.measureLayout(
                containerRef.current,
                (x, y, width, height) => {
                    m.push({ x, y, width, height })

                    if (width === 0) return
                    if (m.length === data.length) setMeasures(m); setIniatized(true)

                },
                () => { })
        })

    })




    useEffect(() => {

        data.forEach((e, index) => {
            scrollX.addListener(({ value }) => {

                // opacity + scrollTo text at end of swipe
                if (value === index * screenWidth) {

                    // Opacity
                    setCurrentTab(data[index].type)

                    // tabs buttons 
                    if (index === undefined || measures[index] === undefined) return
                    tabsButtonsListRef?.current?.scrollToOffset({
                        offset: measures[index]?.x ?? 0
                    })
                }


                // Detect when on a tab
                // let percentOfScreenWidthScrolled = value / screenWidth
                // if (percentOfScreenWidthScrolled >= index - 0.5 && percentOfScreenWidthScrolled <= index + 0.5) console.log(index)


            })
        })

    }, [])




    return (
        <View style={{ backgroundColor: COLORS.whiteToGray2, marginHorizontal: 20 }}>
            <View ref={containerRef} style={{ width: "100%" }}>
                <Animated.FlatList
                    ref={tabsButtonsListRef}
                    data={data as any}
                    horizontal
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={e => { return e.type }}
                    renderItem={({ item, index }) => (

                        <TabCell
                            ref={item.ref}
                            type={item.type}
                            index={index}
                            currentTab={currentTab}
                            onPress={(index: number) => {

                                // Text opacity 
                                setCurrentTab(item.type)

                                // Tabs buttons 
                                tabsButtonsListRef?.current?.scrollToOffset({
                                    offset: measures[index]?.x ?? 0
                                })

                                // Tabs 
                                tabsListRef?.current?.scrollToOffset({
                                    offset: index * screenWidth
                                })

                            }}
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                        />

                    )}
                />
            </View>



            {(tabs.length === measures.length) &&
                <Indicator
                    tabs={tabs}
                    measures={measures}
                    scrollX={scrollX}
                    COLORS={COLORS}
                />
            }



        </View>
    )
}


interface TabCellInterface {
    type: TabType
    index: number
    currentTab: TabType
    onPress: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
const TabCell = forwardRef(({ type, index, currentTab, onPress, COLORS, TEXT_STYLES }: TabCellInterface, ref) => {
    return (
        <TouchableHighlight
            activeOpacity={0.94}
            onPress={() => onPress(index)}
        >


            {/* Text + space */}
            <View
                ref={ref as React.RefObject<View>}
                style={{
                    flex: 1,
                    backgroundColor: COLORS.whiteToGray2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 14,
                    // height is about 44.5
                }}
            >
                <Text style={[
                    TEXT_STYLES.medium15, {
                        color: COLORS.black,
                        opacity: currentTab === type ? 1 : 0.3
                    }
                ]}>{(getTabDescription(type) ?? "").toUpperCase()}</Text>
            </View>


        </TouchableHighlight>
    )
})


interface IndicatorInterface {
    tabs: TabType[]
    measures: LayoutRectangle[]
    scrollX: Animated.Value
    COLORS: ColorsInterface
}
function Indicator({ tabs, measures, scrollX, COLORS }: IndicatorInterface) {

    // Values
    const inputRange = tabs.map((_, index) => index * screenWidth)
    const indicatorWidth = scrollX.interpolate({
        inputRange,
        outputRange: measures.map((measure) => measure.width),
    })
    const translateX = scrollX.interpolate({
        inputRange,
        outputRange: measures.map((measure) => measure.x),
    })

    return (
        <Animated.View
            style={{
                position: "absolute",
                left: 0,
                top: 48 - 3,
                height: 3,
                width: indicatorWidth,
                backgroundColor: COLORS.black,
                zIndex: 2,
                transform: [{
                    translateX
                }]
            }}
        />
    )
}




export type TabType = 'home' | 
'related_items' | 
'about' 
export interface TabData {
    type: TabType
    ref: React.RefObject<View>
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
    TabMetadataObj("related_items", localization.in_the_place),
    TabMetadataObj("about", localization.about),
]

function getTabDescription(type: TabType) {
    let tabMetadata = tabsMetadata?.find(e => { return e.type === type })
    return tabMetadata?.name ?? ""
}