//
//  s3-client-config.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { identityPoolConfig, userPoolInfo } from "./main-config"
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool, FromCognitoIdentityPoolParameters } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig


export const s3Client = new S3Client({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    }),
})



export function s3ClientConstructor(jwtToken: string) {


    let region = identityPoolConfig.region
    let loginProvider = `cognito-idp.${region}.amazonaws.com/${userPoolInfo.UserPoolId}`



    let params : FromCognitoIdentityPoolParameters = {
        identityPoolId: identityPoolId,
        logins: { // "cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>" : ...
        },
        clientConfig: { region }
    }
    if (params.logins !== undefined) {
        params.logins[loginProvider] = jwtToken
    }



    let s3ClientConfig: S3ClientConfig = {
        region: region,
        credentials: fromCognitoIdentityPool(params),
    } 
  


    let s3Client = new S3Client(s3ClientConfig)

    return s3Client
}