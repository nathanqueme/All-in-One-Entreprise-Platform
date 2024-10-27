//
//  s3.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { ResourceType } from '../types'
import { Readable } from 'stream'
import { s3Client, s3ClientConstructor } from '../configs/s3-client-config'
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, PutObjectAclCommandOutput, DeleteObjectCommandOutput, PutObjectCommandInput, GetObjectCommandInput, DeleteObjectCommandInput, GetObjectCommandOutput } from "@aws-sdk/client-s3"
import { getContentType, getFileName } from '../utils'
import { Buffer } from 'buffer'


// Read 
/** 
 * Returns the base64 of a media (Equivalent of the function loadImage() for firebase (deprecated))
*/
export function getContent(resource_type: ResourceType, short_id: string, item_id?: string, is_menu_pdf?: boolean): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {

            let file_name = getFileName(resource_type, short_id, item_id, is_menu_pdf)

            const bucketParams: GetObjectCommandInput = {
                Bucket: process.env.S3_BUCKET,
                Key: file_name,
                ResponseCacheControl: "no-cache" // see : https://github.com/aws-amplify/amplify-js/issues/6693#issuecomment-729855538
            }

            const result = await s3Client.send(new GetObjectCommand(bucketParams))

            const { Body } = result
            const base64Head = `data:${getContentType(resource_type)};base64,`
            const base64Data = await streamToString(Body as Readable)
            const base64 = base64Head + base64Data
            resolve(base64)

        } catch (error) {
            reject(error)
        }
    })
}
const streamToString = (stream: Readable) => new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString("base64")));
})


/**
 * File_name guidelines : 
   - `p_p/${account_id}.${file_extension}`                        --->   profile photo
   - `s_p/${account_id}.${file_extension}`                        --->   search photo
   - `p/${post_id}.${file_extension}`                             --->   posts  
   - `r_i/${account_id}/${item_id}.${file_extension}`             --->   related items   
   - `pdf/${account_id}/${ "menu" or "map"}.${file_extension}`    --->   pdf
 */
export function putContent(jwt_token: string, base64: string, resource_type: ResourceType, short_id: string, item_id?: string, is_menu_pdf?: boolean): Promise<PutObjectAclCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const file_name = getFileName(resource_type, short_id, item_id, is_menu_pdf)
            const content_type = getContentType(resource_type)

            // The contents of that appear to be a base64 encoded image. That is, you're uploading a text file and not a binary image (and then saying it is, a image/png)
            // https://stackoverflow.com/a/66562415
            const buffer = Buffer.from(base64.replace(/^data:\w+\/\w+;base64,/, ""), 'base64')

            const params: PutObjectCommandInput = {
                Bucket: process.env.S3_BUCKET,
                Key: file_name,
                Body: buffer,
                // Tagging: `item_type=${item_type}`,
                ContentEncoding: "base64", // Indicates that the buffer is encoded in base64
                ContentType: content_type, // MIME media type
                CacheControl: "no-cache" // see : https://github.com/aws-amplify/amplify-js/issues/6693#issuecomment-729855538
            }

            const s3AuthenticatedClient = s3ClientConstructor(jwt_token)

            const data = await s3AuthenticatedClient.send(new PutObjectCommand(params))
            resolve(data)

        } catch (error) {
            reject(error)
        }
    })
}


export function deleteContent(jwt_token: string, file_name: string): Promise<DeleteObjectCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            var params: DeleteObjectCommandInput = {
                Bucket: process.env.S3_BUCKET,
                Key: file_name,
            }

            const s3AuthenticatedClient = s3ClientConstructor(jwt_token)

            const data = await s3AuthenticatedClient.send(new DeleteObjectCommand(params))
            resolve(data)

        } catch (error) {
            reject(error)
        }
    })
}
