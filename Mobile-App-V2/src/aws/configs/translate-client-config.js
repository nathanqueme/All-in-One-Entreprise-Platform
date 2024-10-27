//
//  translate-client-config.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { identityPoolConfig } from "./main-config"
import { TranslateClient } from "@aws-sdk/client-translate"
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig


export const translateClient = new TranslateClient({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    }),
})