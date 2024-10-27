//
//  dynamodb-client-config.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { identityPoolConfig, userPoolInfo } from "./main-config"
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { fromCognitoIdentityPool, FromCognitoIdentityPoolParameters } from "@aws-sdk/credential-providers"


const { region, identityPoolId } = identityPoolConfig


// DynamoDB custom config (optional)
const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    // convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    // convertClassInstanceToMap: false, // false, by default.
}
const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
}
const translateConfig = { marshallOptions, unmarshallOptions }





export const dynamoClient = new DynamoDBClient({
    region: region,
    credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        clientConfig: { region }
    }),
})
export const ddbDocClient = DynamoDBDocument.from(dynamoClient, translateConfig)







export function dynamoDBDocumentConstructor(jwtToken: string) {


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



    let dynamoDBClientConfig: DynamoDBClientConfig = {
        region: region,
        credentials: fromCognitoIdentityPool(params),
    }
  


    let dynamoDBClient = new DynamoDBClient(dynamoDBClientConfig)
    let dynamoDBDocument = DynamoDBDocument.from(dynamoDBClient, translateConfig)


    return dynamoDBDocument
}