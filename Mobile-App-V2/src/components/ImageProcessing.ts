//
//  ImageProcessing.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import ImageResizer from 'react-native-image-resizer'
import ImageEditor, { ImageCropData } from "@react-native-community/image-editor"
import { ImageType } from '../Types'
import { ImageDimensionsObj } from '../Data'


// Ressources to analyse and process images



//
// __________Perform actions__________
//
/**  Compresses the image until it's size is small enought (size checked via blob).
  - Step 1 : Corrects its dimensions based on its type and original dimensions.
  - Step 2 : Crops it in the center if one side is still too large.
  - Step 3 : Compress it if the file still exceeds 200 Ko.
*/
export async function resizeImageAndConvertToBlob(isAProfilePhoto: boolean, uri: string, width: number, height: number): Promise<Blob> {


  let new_uri = uri
  let iWidth = width
  let iHeight = height

  try {
    // Step 1 : Dimensions____________________________________________________________
    const imageType = isAProfilePhoto ?
      (ImageType.profile_photo)
      :
      getImageTypeFromDimensions(width, height)
    let scalingRatio
    let resizingResponse
    if (!isAProfilePhoto) {
      console.log("type :" + " " + imageType + ", width :" + width + ", height :" + height)
      scalingRatio = getImageScalingRatio(imageType, width, height)
      resizingResponse = await ImageResizer.createResizedImage(uri, width * scalingRatio, height * scalingRatio, 'JPEG', 100, 0, undefined, false, { mode: 'contain', onlyScaleDown: false })
    }






    // Step 2 : Cropping extraneous space if any._____________________________________
    if (!isAProfilePhoto) {
      /**
       
       Cropping is not needed : 
        1 - when the width and the height are at the perfect dimension 
        2 - One dimension is perfect and the other one is smaller than it should.
  
       Exemple when the image won't be cropped :
       - Initial values : 1200.0 * 800.0 (W*H)
       - Because the image is a landscape the appropriate dimensions are : 1080.0 * 566.0 (W*H)
       - The smallest side is the height and is too big (800 > 566) so it gets scaled down to 566.0 (Scaling ratio : 0.7075)
       - The width ends up being scaled down to 849.0.
       -> So because 849.0 is smaller than 1080.0 the image won't be cropped.
       */

      // Checks if one size is too large
      iWidth = resizingResponse.width
      iHeight = resizingResponse.height
      new_uri = resizingResponse.uri
      let iDimensions = imagesDimensions.find(iDimensions => iDimensions.image_type === imageType) // Gets appropraite dimensions
      let croppingNeeded = false
      let cropData: ImageCropData = {
        offset: { x: 0, y: 0 }, // No offset needed as the depedency is well done. (Images are cropped in the center by default)
        size: { width: resizingResponse.width, height: resizingResponse.height },
        displaySize: { width: iDimensions.width, height: iDimensions.height },
        resizeMode: 'cover',
      }
      console.log("\n---------Image was resized------", "\n---------Current dimensions after resizing : (", resizingResponse.width, "*", resizingResponse.height, ") / Wanted : (", iDimensions.width, "*", iDimensions.height, ")", "----------------")

      // 1 : Width
      if ((iWidth > iDimensions.width) && (iHeight === iDimensions.height)) {
        croppingNeeded = true
        console.log("\nResize", "width :", iWidth, "to", iDimensions.width, "\n\ncropData :", cropData)
      }

      // 2 : Height 
      else if ((iHeight > iDimensions.height) && (iWidth === iDimensions.width)) {
        croppingNeeded = true
        console.log("\nResize", "height :", iHeight, "to", iDimensions.height, "\n\ncropData :", cropData)
      }

      if (croppingNeeded) {
        try {
          console.log("\nCropping...")
          const uri = await ImageEditor.cropImage(new_uri, cropData)

          // Update values 
          new_uri = uri
          iWidth = iDimensions.width
          iHeight = iHeight
          console.log("\nCropping done")

        } catch (error) {
          console.log("\nCropping issue")
          return Promise.reject(new Error("Failed cropping image please try again."))
        }
      }
    }







    // Step 3 : Compression_____________________________________________________________
    // Check if needed
    const fecthResponse = await (fetch(new_uri))
    let blobPromise = fecthResponse.blob()
    const kiloBytes = (await blobPromise).size / 1024 // bytes to KB -> dividing by 1024 is the proper way to do it (Checked).
    console.log("\n -----> Final size without compression:", (Math.round(kiloBytes * 100) / 100).toFixed(2), "KB")


    // Compresses the image until small enought
    if (kiloBytes > 200) {
      console.log("Compression...")
      blobPromise = await compressImageUntilSmallEnought(new_uri, iWidth, iHeight, 100 - 8) // Quality (can be between 100-0) 
      console.log("\n\n_____________Compression done______________")
    }



    return blobPromise

  } catch {
    // URI issue
    console.log("URI issue")
    return Promise.reject(new Error("Failed image convertion. Please make sure an image is selected and try again."))
  }

}



/** Compresses an image until it's size is smaller than 200KB. */
async function compressImageUntilSmallEnought(uri: string, width: number, height: number, iQuality: number) {
  const resizingResponse = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', iQuality, 0, undefined, false, { mode: 'contain', onlyScaleDown: false })
  // Response
  const fetchResponse = await (fetch(resizingResponse.uri))
  const blobPromise = fetchResponse.blob()


  // Calculation
  const kiloBytes = (await blobPromise).size / 1024
  console.log("->", (Math.round(kiloBytes * 100) / 100).toFixed(2), "KB")


  // Management based on size
  if (kiloBytes > 200 && iQuality - 8 >= 0) {
    // Lowers the quality five by five
    return compressImageUntilSmallEnought(uri, width, height, iQuality - 8) // N.B. : Uses "uri" and not "resizingResponse.uri" as "resizingResponse.uri" is not the original image, it is only used for the calculation of the size.
  }
  else {
    console.log("Compressed image size :", (Math.round(kiloBytes * 100) / 100).toFixed(2), "KB", "image quality :", iQuality)
    return blobPromise
  }
}










//
// ___________Getting values___________
//
/** Determines the photo's type based on its dimesnsions. Used for photos that are not of type "profile_photo". */
function getImageTypeFromDimensions(width: number, height: number): ImageType {
  console.log("\n - Getting image's type")

  if (width === height) {
    return ImageType.square
  } else if (width > height) {
    return ImageType.landscape
  } else {
    return ImageType.portrait
  }

}



// Dimensions in width * height
let imagesDimensions = [
  ImageDimensionsObj(ImageType.landscape, 1080, 566),
  ImageDimensionsObj(ImageType.portrait, 1080, 1350),
  ImageDimensionsObj(ImageType.profile_photo, 320, 320),
  ImageDimensionsObj(ImageType.square, 1080, 1080),
]



/** Determines a scaling ratio so that the image has proper dimensions. 0.5 means two times smaller. 1.5 means two times larger */
function getImageScalingRatio(imageType: ImageType, width: number, height: number): number {
  console.log("\n - Getting Image's scaling ratio",)



  // Avoids error (Should never be a problem)
  let iDimensions = imagesDimensions.find(iDimensions => { return iDimensions.image_type === imageType }) // Gets appropraite dimensions
  // console.log("\nimageDimensions :", JSON.stringify(iDimensions))
  if (width === 0 || height === 0 || iDimensions.height === 0 || iDimensions.width === 0) {
    console.log("ERROR : Invalid frame dimensions. An image can not have dimensions equal to 0.")
    return 1
  }


  // (Always use the smallest dimension so that there is one which is perfect and the other one that is perfect too or too large.)
  let widthIsLargerSide = width > height
  return widthIsLargerSide ? iDimensions.height / height : iDimensions.width / width


}
























// function convertURIToImageData(uri: string) {
//   return new Promise(function (resolve, reject) {
//     if (uri == null) return reject()
//
//
//     var canvas = document.createElement('canvas'),
//       context = canvas.getContext('2d'),
//       image = new Image()
//
//
//     image.onload = function () {
//       canvas.width = image.width
//       canvas.height = image.height
//       context.drawImage(image, 0, 0, canvas.width, canvas.height)
//
//       var dataImg = canvas.toDataURL('JPEG', 1)
//       console.log(dataImg)
//       resolve(dataImg)
//
//     }
//
//     image.src = uri
//
//   })
// }





// convertURIToImageData(image_uri).then(function(imageData) {
//   // Here you can use imageData
//   console.log("imageData", imageData)
// })

