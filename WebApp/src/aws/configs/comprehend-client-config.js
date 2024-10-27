//
//  comprehend-client-config.js
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//



// @ts-check
import { identityPoolConfig } from "./main-config"
//
import { ComprehendClient } from "@aws-sdk/client-comprehend";
//
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig





export const comprehendClient = new ComprehendClient({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    }),
})