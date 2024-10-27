import React from "react"
import TextStyles from '../styles/TextStyles'
import Divider from "./Divider"
import Colors from './../assets/Colors'
import { isMobileHook } from './functions'


const isMobile = isMobileHook()


interface SectionAppearanceInterface {
  text: string
  children: any
  width: string
  marginTop?: number
  marginBottom?: number
  backgroundColor?: string
  loadingAppearance?: boolean
  loadingUiHeight?: number
  border?: boolean
}
/**
 * On large devices (desktops) : Puts the element in a container with a rounded gray border and adds gray text at the top left.
 * On thin devices (phones) : Adds the element between two dividers and adds text at the top left.
 * 
 * @param widthOnLargedevices can be like : "100px" or "100%"
 */
export default function SectionAppearance({ text, children, width, marginTop, marginBottom, backgroundColor, loadingAppearance, loadingUiHeight = 60, border = true }: SectionAppearanceInterface) {


  // Value 
  const textPadding = isMobile ? 20 : 0


  return (
    <div className='flex flex-col items-start justify-center' style={{ marginTop: marginTop, marginBottom: marginBottom }}>
      {/* Descritpion */}
      <p
        className="text-start"
        style={Object.assign({}, TextStyles.gray13Text, {
          marginBottom: 10,
          marginLeft: textPadding,
          marginRight: textPadding,
          color: loadingAppearance ? Colors.clear : Colors.smallGrayText,
          backgroundColor: loadingAppearance ? Colors.lightGray : Colors.clear,
        })}>{text}</p>


      {isMobile ?
        <div className='flex flex-col w-full overflow-hidden' style={{ backgroundColor: Colors.whiteToGray2 }}>
          {!loadingAppearance && <Divider />}
          {loadingAppearance ?
            <div style={{ height: loadingUiHeight, width: "100%", backgroundColor: Colors.lightGray }} />
            :
            children
          }
          {!loadingAppearance && <Divider />}
        </div>
        :
        /** Gray border 
         * Before borderRadius was 4px.
        */
        <div className={`flex flex-col items-start justify-center ${(!loadingAppearance && border) && "border-2"} rounded-lg overflow-hidden`} style={{ width: width, backgroundColor: backgroundColor }}>
          {loadingAppearance ?
            <div style={{ height: loadingUiHeight, width: "100%", backgroundColor: Colors.lightGray }} />
            :
            children
          }
        </div>
      }
    </div>
  )
}