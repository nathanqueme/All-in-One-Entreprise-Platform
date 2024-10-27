//
//  animations.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { Easing, LayoutAnimation } from 'react-native'

// https://easings.net/
// https://github.com/expo/react-apple-easing/blob/master/AppleEasing.js
// https://developer.apple.com/documentation/quartzcore/camediatimingfunction/predefined_timing_functions



export const defaultEasing = Easing.bezier(0.25, 0.1, 0.25, 1)
export const easing = Easing.bezier(0.15, 0.2, 0.25, 1)



export const layoutAnimation = {
  duration: 350,
  update: {
    duration: 350,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    duration: 350,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
}







export const actionSheetAnimation = {
  duration: 180,
  create: {
    type:  LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
}





/**
 * Avoids unwanted animations caused by previous animations.
 */
export const animationCanceler = {
  duration: 0,
}