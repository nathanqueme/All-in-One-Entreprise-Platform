//
//  encryption.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/07/22
//

import crypto from 'crypto'
import { Hash, HashObj } from '../data'
const { ENCRYPTION_ALGORITHM = "", ENCRYPTION_KEY = "" } = process.env


// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data

export function encrypt(text: string): Hash {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv)

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

    return HashObj(iv.toString('hex'), encrypted.toString('hex'))
}

export function decrypt(hash: Hash) {
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, Buffer.from(hash.iv, 'hex'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

    return decrpyted.toString()
}

export async function getJwtTokenHashFromHeader(header_authorization: string) {
    const jwt_token_hash_string = header_authorization.replace("Bearer ", "").replace("Bearer", "")
    if (jwt_token_hash_string === "") return undefined
    else {
        try {
            let hash = (jwt_token_hash_string as any) as Hash
            // console.log(hash.iv)
            // console.log(typeof jwt_token_hash_string)
            const jwt_token_hash = await JSON.parse(jwt_token_hash_string) as Hash | undefined
            return jwt_token_hash
        } catch (error) {
            return undefined
        }
    }
}