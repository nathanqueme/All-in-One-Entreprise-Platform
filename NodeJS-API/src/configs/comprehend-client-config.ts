//
//  comprehend-client-config.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { identityPoolConfig } from "./main-config"
import { ComprehendClient } from "@aws-sdk/client-comprehend";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig


export const comprehendClient = new ComprehendClient({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    }),
})