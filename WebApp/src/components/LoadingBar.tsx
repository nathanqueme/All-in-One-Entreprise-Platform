import React, { useEffect } from 'react'
import Colors from '../assets/Colors'






function getLoadingBarId(isMainLoadingBar:  boolean) {
  return isMainLoadingBar ? 'isMainLoadingBar' : 'loadingBar'
}





interface ProgressBarInterface {
  isLoading?: boolean
  isMainLoadingBar: boolean
  backgroundColor?: string
}
/**
* 
*/
export default function LoadingBar({ isLoading = false, isMainLoadingBar, backgroundColor = Colors.lightGray }: ProgressBarInterface) {
  
  
  // Values
  let display = isLoading || isMainLoadingBar
  

  return (
      <div className='flex overflow-hidden w-full ease-in' 
      style={{
          opacity: display ? 1 : 0,
          height: 2.5,
          backgroundColor: backgroundColor,
      }}>
          <div id={getLoadingBarId(isMainLoadingBar)}
              style={Object.assign({}, {
                  backgroundColor: Colors.darkBlue,
                  width: '100%',
                  height: '100%',
                  left: 0
              })} />
      </div>
  )
}





/**
* @param progress : a string between 0 - 100
* @param transitionDuration : a string like 400 for 400ms
*/
export function animateLoadingBar(progress: number, transitionDuration = 400, isMainLoadingBar = false) {
  let loadingBar = document.getElementById(getLoadingBarId(isMainLoadingBar))
  if (loadingBar === null) return

  let xToReflectProgress = -100 + progress
  loadingBar!.style.transform = `translateX(${xToReflectProgress}%)`
  loadingBar!.style.transitionDuration = `${transitionDuration}ms`

  return
}
