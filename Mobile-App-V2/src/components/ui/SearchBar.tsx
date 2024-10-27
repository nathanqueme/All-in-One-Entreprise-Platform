//
//  SearchBar.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useEffect, useRef } from "react"
import localization from "../../utils/localizations"
import { TextStylesInterface } from '../styles/TextStyles'
import { View, TextInput } from "react-native"
import { ColorsInterface } from "./../../assets/Colors"
import { SearchSymbol } from '../../components/Symbols'


interface SearchBarInterface {
   text: string 
   setText: (_:string) => any
   becomeActive: boolean
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   delay?: number
}
export default function SearchBar({ text, setText, becomeActive, COLORS, TEXT_STYLES, delay: focusDelay = 500 }: SearchBarInterface) {


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
    <View style={{
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexShrink: 1,
      backgroundColor: COLORS.lightGray,
      borderRadius: 10
    }}>


      <View style={{ marginLeft: 8 , marginRight: 8, marginVertical: 7 }}>
        <SearchSymbol COLORS={COLORS}/>
        {/* Search icon : <Octicons name="search" size={Platform.OS === 'ios' ? 14 : 22} color="gray" /> */}
      </View>


      <TextInput
        ref={textInputRef as any}
        style={[TEXT_STYLES.textInput, { flexShrink: 1 }]} // flexShrink: 1 makes the text clipped inside the gray capsule + (on iOS makes the clearButton visible)
        onChangeText={setText}
        value={text}
        placeholder={localization.search}
        keyboardType="default"
        clearButtonMode="always" // iOS only 
        placeholderTextColor="gray"
        autoCapitalize="none"
      />


      {/* The space at the right of the textinput is not tappable
      
      {Platform.OS === 'ios' ? null :
        <AntDesign name="close" size={22} color={COLORS.clear} />
      } */}



    </View>
  )
}

