//
//  ActionSheet.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useEffect, useState } from 'react'
import { ColorsInterface } from './../../assets/Colors'
import { BackHandler, TouchableHighlight, Text, View, Dimensions, Pressable, LayoutAnimation, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { actionSheetAnimation } from '../animations'
import { TextStylesInterface } from '../styles/TextStyles'


const screenWidth = Dimensions.get("screen").width


interface ActionSheetInterface {
  show: boolean
  setShow: any
  options: string[]
  COLORS: ColorsInterface
  TEXT_STYLES: TextStylesInterface
  description?: string
  actionSheetPress: any
}
/** 
 * Aka BottomSheetDialog, equivalent of ActionSheet on Android 
*/
export function ActionSheet({ show, setShow, options, COLORS, TEXT_STYLES, description, actionSheetPress }: ActionSheetInterface) {

  // Values 
  const insets = useSafeAreaInsets()
  let hasADescription = (description ?? "") !== ""



  // Go back support for Android
  const [backHandler, setBackHandler]: [any, any] = useState()
  useEffect(() => {

    if (show) {
      // The listener needs to be canceled whatever happens : whether the user closed the sheet or used its cancel button
      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        // Prepare for potential overwritte
        LayoutAnimation.configureNext(actionSheetAnimation)
        setShow(false)
        handler.remove()
        return true // Indicates that has overwritten the back action
      })
      setBackHandler(handler)
    }

  }, [show])





  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      pointerEvents={'box-none'}
    >



      {/* Gray background */}
      <Pressable
        onPress={() => {
          if (backHandler !== undefined) backHandler?.remove()
          LayoutAnimation.configureNext(actionSheetAnimation)
          setShow(false)
        }}
        pointerEvents={show ? 'auto' : 'box-none'}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute'
        }}
      >
        {show &&
          <View
            pointerEvents={'box-none'}
            style={{
              backgroundColor: 'black',
              opacity: 0.7,
              width: '100%',
              height: '100%',
              position: 'absolute'
            }} />
        }
      </Pressable>





      {/* Content */}
      <View
        style={{
          backgroundColor: COLORS.whiteToGray,
          width: '100%',
          position: 'absolute',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          paddingBottom: insets.bottom,
          bottom: show ? 0 : - (options.length) * 60 - insets.bottom - (hasADescription ? 60 : 0),
        }}
      >
        {hasADescription &&
          <View style={{ height: 60, justifyContent: "center", alignItems: "center", width: "100%" }}>
            <Text
              adjustsFontSizeToFit
              style={[TEXT_STYLES.gray13Text, { paddingHorizontal: 20 }]}>{description}</Text>
          </View>
        }
        {options.map((item) => {
          let index = options.findIndex((optionItem) => optionItem === item);
          return (
            <ActionSheetButton
              key={index}
              option={item}
              index={index}
              setShow={setShow}
              actionSheetPress={(index) => {
                if (backHandler !== undefined) backHandler?.remove()
                actionSheetPress(index)
              }}
              COLORS={COLORS}
            />
          )
        })}
      </View>





    </View>
  )
}


interface ActionSheetButtonInterface {
  option: string 
  index: number
  setShow: (_: boolean) => any 
  actionSheetPress: (_: number) => any
  COLORS: ColorsInterface 
}
/**
 * N.B.: each item has a fixed height of 60
 */
export function ActionSheetButton({ option, index, setShow, actionSheetPress, COLORS }: ActionSheetButtonInterface) {
  return (

    <TouchableHighlight
      activeOpacity={0.94}
      onPress={() => {
        LayoutAnimation.configureNext(actionSheetAnimation)
        setShow(false)
        setTimeout(() => { actionSheetPress(index) }, 350)
      }} >

      <View     // Needed so that the black overlay is applied properly 
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: COLORS.whiteToGray,
          width: screenWidth,
          height: 60,
          paddingHorizontal: 20
        }}>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          style={{
            fontSize: 16,
            color: COLORS.black
          }}>{option}</Text>

      </View>
    </TouchableHighlight>
  )
}

