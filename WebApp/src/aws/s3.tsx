//
//  s3.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
// import { Upload } from "@aws-sdk/lib-storage" // REACT Only -> Not supported on react native
import { s3Client, s3ClientConstructor } from '../aws/configs/s3-client-config'
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, PutObjectAclCommandOutput, DeleteObjectCommandOutput, PutObjectCommandInput, GetObjectCommandInput, DeleteObjectCommandInput } from "@aws-sdk/client-s3";
// import { resizeImageAndConvertToBlob } from '../components/ImageProcessing'
import { getBase64 } from '../components/functions'
import { ItemType } from '../Types'





export type BucketNameForS3 = "anyid-eu-west-1"





// Read 
/** 
 * Returns the base64 of a media (Equivalent of the function loadImage() for firebase (deprecated))
*/
export function getContent(bucketName: BucketNameForS3, fileName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const bucketParams: GetObjectCommandInput = {
                Bucket: bucketName,
                Key: fileName,
                ResponseCacheControl: "no-cache" // see : https://github.com/aws-amplify/amplify-js/issues/6693#issuecomment-729855538
            }



            const result = await s3Client.send(new GetObjectCommand(bucketParams))

            // Output (Blob) : {"_data": {"__collector": {}, "blobId": "345DB8D9-424A-49C6-A9D0-D6209B1116E1", "name": "test.jpeg", "offset": 0, "size": 117642, "type": "application/octet-stream"}}
            // console.log(result.Body)


            // Output : 'blob:AB4FD6ED-2834-4C55-A913-5DE3327BA326?offset=0&size=117642'
            // Works on iOS but not Android
            // const uri = URL.createObjectURL(result.Body)


            try {
                let base64 = await getBase64(result.Body as Blob)
                resolve(base64 as any)
            } catch (error) {
                alert(error)
            }



        } catch (error) {
            reject(error)
        }


    })
}












// Write 
/** 
 *  Steps 
    - 1 - Compress image 
    - 2 - Upload to storage
    - 3 - Returns the base64 of the uploaded compressed image 

 
 * File_name guidelines : 
   - `p_p/${account_id}.${file_extension}`                        --->   profile photos
   - `p/${post_id}.${file_extension}`                             --->   posts  
   - `r_i/${account_id}/${item_id}.${file_extension}`             --->   related items   
   - `pdf/${account_id}${"menu" or "map"}.${file_extension}`    --->   pdf
 */
// TODO
export function uploadImage(jwtToken: string, bucketName: BucketNameForS3, fileName: string, uri: string, width: number, height: number, itemType: ItemType, contentType = 'image/jpeg'): Promise<string> {
    return new Promise(async (resolve, reject) => {

        /*
        // 1 
        let base64
        let compressedImageBlob: Blob
        try {
            compressedImageBlob = await resizeImageAndConvertToBlob(itemType === 'profile_photo', uri, width, height)
            console.log("image step 1 done")
        } catch (error) {
            reject(error)
            return
        }




        // 2
        try {
            await putContent(jwtToken, bucketName, fileName, compressedImageBlob, itemType, contentType)
            console.log("image step 2 done")
        } catch (error) {
            reject(error)
            return
        }


        // 3 
        try {
            base64 = await getBase64(compressedImageBlob)
            resolve(base64)
        } catch (error) {
            reject(error)
        }
        */



    })
}


/**
 * File_name guidelines : 
   - `p_p/${account_id}.${file_extension}`                        --->   profile photo
   - `s_p/${account_id}.${file_extension}`                        --->   search photo
   - `p/${post_id}.${file_extension}`                             --->   posts  
   - `r_i/${account_id}/${item_id}.${file_extension}`             --->   related items   
   - `pdf/${account_id}/${ "menu" or "map"}.${file_extension}`    --->   pdf
 */
export function putContent(jwtToken: string, bucketName: BucketNameForS3, fileName: string, blob: Blob, itemType: ItemType, contentType = 'image/jpeg'): Promise<PutObjectAclCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            var params: PutObjectCommandInput = {
                Bucket: bucketName,
                Key: fileName,
                Body: blob,
                Tagging: `item_type=${itemType}`,
                ContentType: contentType, // MIME media type
                CacheControl: "no-cache" // see : https://github.com/aws-amplify/amplify-js/issues/6693#issuecomment-729855538
            }

            const s3AuthenticatedClient = s3ClientConstructor(jwtToken)

            const data = await s3AuthenticatedClient.send(new PutObjectCommand(params))
            resolve(data)

        } catch (error) {
            reject(error)
        }


    })
}


export function deleteContent(jwtToken: string, bucketName: BucketNameForS3, fileName: string): Promise<DeleteObjectCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            var params: DeleteObjectCommandInput = {
                Bucket: bucketName,
                Key: fileName,
            }

            const s3AuthenticatedClient = s3ClientConstructor(jwtToken)

            const data = await s3AuthenticatedClient.send(new DeleteObjectCommand(params))
            resolve(data)

        } catch (error) {
            reject(error)
        }


    })
}


/**
 * 
 * @param imageUri the uri of the profile_photo.
 * @param account_id the id of the account.
 * @param jwtToken 
 * @returns the search_photo base64.
 * 
 * 
 * Steps :
 * 1 - Scales down the provided image to generate a small search photo.
 * 2 - Uploads it to s3.
 * 
*/
// TODO
export async function generateAndUploadSearchPhoto(imageUri: string, account_id: string, jwtToken: string): Promise<string> {
    return new Promise(async (resolve, reject) => {

        /*
        // Step 1 - Scales down the photo to about 40 by 40 pixels.
        let resizingResponse = await ImageResizer.createResizedImage(imageUri, 60, 60, 'JPEG', 100, 0, undefined, false, { mode: 'contain', onlyScaleDown: false })
        let base64 = resizingResponse.uri
        let blob = {} as Blob
        try {
            const fecthResponse = await fetch(base64)
            blob = await fecthResponse.blob()
        } catch (error) {
            reject(error)
            return
        }


        // Step 2
        try {
            let file_name = getFileName("search_photo", account_id)
            await putContent(jwtToken, "anyid-eu-west-1", file_name, blob, "search_photo")
            console.log("image step 2 done")
            resolve(base64)
        } catch (error) {
            reject(error)
        }
        */


    })
}





