import React from 'react'
import Colors from '../assets/Colors'


interface ActivityIndicatorInterface {
  color?: string
  widthAndHeight?: number
}
/**
 * 
 * A loading spinner
 * 
 * default widthAndHeight = 26
 * 
 */
export default function ActivityIndicator({ color = Colors.darkBlue, widthAndHeight = 26 }: ActivityIndicatorInterface) {
  return (
    <div className='borderWidth3 border-transparent rounded-full animate-spin-fast flex-grow-0'
      style={{
        borderTopColor: color,
        borderLeftColor: color,
        width: widthAndHeight,
        height: widthAndHeight
      }} />
  )
}

