//
//  ContentRelated.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 08/21/22.
//

// @ts-check
import React from 'react'






export async function loadImage(image_url: string) {
    let response: Response
    try {
        response = await fetch(image_url)
        const blob = await response.blob()
        const uri = URL.createObjectURL(blob)
        return uri
    }
    catch (error) {
        return Promise.reject(error)
    }
}


export async function loadImageBase64(image_url: string) {
    let response: Response
    try {
        response = await fetch(image_url)
        const blob = await response.blob()
        const base64 = await getBase64(blob)

        return base64 as string
    }
    catch (error) {
        return Promise.reject(error)
    }
}


/** 
 Converts a Blob into a base64 string.
 
 Issue : blocks the main thread --> buttons are not tappable.
*/
export function getBase64(blob: Blob): Promise<string> {
    const reader = new FileReader()
    return new Promise(async (resolve, reject) => {
        try {

            reader.readAsDataURL(blob)
            reader.onload = async (ev) => {
                let base64 = ev?.target?.result as string
                resolve(base64)
            }

        } catch (error) {
            reject(error)
        }
    })
}


/**
 * 
 * @param base64 
 * @returns a number representing the ratio between the height and width. e.g. : 0.5 means that the 'height' is 2 times smaller than the 'width'.
 */
export function getImageDimensionRatio(base64: string): Promise<number> {
    return new Promise(async (resolve, reject) => {

        const { width, height } = await getImageDimension(base64)
        resolve(height / width)

    })
}


interface ImageDimension {
    width: number
    height: number
}
/**
 * @returns { width: width, height: height }
 */
export function getImageDimension(base64: string): Promise<ImageDimension> {
    return new Promise((resolve, reject) => {

        let image = new Image;
        image.src = base64
        image.onload = (e) => {
            resolve({ width: image.width, height: image.height })
        }

    })
}


/** 
 * Saves the given base64 as a file on user's device disks
 * @platform web version (ONLY)
*/
export function saveBase64AsFile(base64: string, fileName: string) {
    var link = document.createElement("a")

    document.body.appendChild(link) // for Firefox

    link.setAttribute("href", base64)
    link.setAttribute("download", fileName)
    link.click()
}


/**
 * @platform web version only  
 */
export function getBlobFromFile(file_uri: string): Promise<Blob> {
    return new Promise(async (resolve, reject) => {

      try {
        let response = await fetch(file_uri)
        let blob = await response.blob()
        resolve(blob)
      } catch (error) {
        reject(error)
      }

    })
  }


