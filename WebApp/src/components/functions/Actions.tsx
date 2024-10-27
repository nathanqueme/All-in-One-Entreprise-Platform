//
//  Actions.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'






/**
 * 
 * {international call prefixes or +} + {country_calling_code} + 
 * 
 * e.g. for France : tel:0033612581647 or +33671826060
 * n.b. : the + may not be needed
 * 
*/
export async function call(number: string, calling_code: string) {
  // For accounts near borders check if the client is calling from the other country and if so add the **calling_code**
  // e.g Clients of an hotel in Biarritz could call from Spain.
  let callUrl = `tel:+` + calling_code + number.replace("0", "")
  window.open(callUrl)
}


// TODO
export async function sendMessage(number: string, calling_code: string) {
  let messageUrl = `sms:+` + calling_code + number



  try {
    // await Linking.openURL(messageUrl)
  } catch (error) {
    // alert(error)
  }


  console.log(messageUrl)

}


export async function writeEmail(email: string) {
  let emailUrl = `mailto:` + email
  window.open(emailUrl)
}


/** 
 opens a url with Safari or the Android equivalent in the app.
*/
// TODO
export async function openLinkWithInAppWeb(url: string) {
  try {

    // Linking.openURL(url)


    return
    /*
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'close',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right'
        },
        headers: {
          'my-custom-header': 'my custom header value'
        }
      })
 
    }
    else Linking.openURL(url)
    */

  } catch (error: any) {
    alert(error)
  }
}


/**
 * @platform web version (only) 
*/
export function copyToClipBoard(stringToCopy: string) {
  return new Promise(async (resolve, reject) => {

    try {
      await navigator.clipboard.writeText(stringToCopy);
    } catch (error) {
      console.log("Clipboard API not supported by browser :" + error)
    }

  })
}




