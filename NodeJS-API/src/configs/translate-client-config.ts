//
//  translate-client-config.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
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