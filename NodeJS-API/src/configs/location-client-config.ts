//
//  location-client-config.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { identityPoolConfig } from "./main-config"
import { LocationClient } from "@aws-sdk/client-location"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig


export const locationClient = new LocationClient({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    })
})