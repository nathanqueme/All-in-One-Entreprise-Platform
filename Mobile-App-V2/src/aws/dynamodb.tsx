//
//  dynamodb.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { ddbDocClient, dynamoDBDocumentConstructor } from "./configs/dynamodb-client-config"
import { QueryCommand, ExecuteStatementCommandInput, ExecuteStatementCommandOutput, QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, PutCommandOutput, UpdateCommandOutput, DeleteCommandOutput, GetCommandInput, DeleteCommandInput, UpdateCommandInput } from "@aws-sdk/lib-dynamodb"
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { AccountMainData, Post, Profile, RelatedItem, PostCategoryMetadata, SearchResult, ImageDataObj } from "../Data"
import { MathematicalOperation } from "../Types"
import { getFileName, sanitizeString, stringInSearchQueryFormat } from "../components/functions"
import { getContent } from "./s3"




/**
 * N.B.: Use PartiQL only when one item is supposed to be return.
*/



export type TableName =
    "accountsMainData" |
    "postCategories" |
    "posts" |
    "privateData" |
    "profiles" |
    "relatedItems" |
    "usageSessions" |
    "usageData"




// GetCommandInput : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/querycommandinput.html



// Writtes
// 
//
//
//
// ---> General
/**
 * @description Lets the owner of an account to upload its information a secured way.
 */
export async function putItem(table_name: TableName, item: Post | AccountMainData | Profile | RelatedItem | PostCategoryMetadata, jwtToken: string): Promise<PutCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {


            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)


            const output = await dynamoDBDocument.send(
                new PutCommand({
                    TableName: table_name,
                    Item: item
                })
            )
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

















// Reads
// N.B. : the function unmarshall() is used to convert dynamodb objects into pure javascript objects for instance {'name': {'S': 'Mack'}} into {'name': 'Mack'} while using the QueryCommand from the @aws-sdk/client-dynamodb module
//
//
//
// ---> AccountMainData
export type AccountMainDataIndex =
    "s-username-index" |
    "s-search_name-index"
// "search-index" (DEPRECATED) Keep index on server until first app not used
// "username-index" (DEPRECATED) Keep index on server until first app not used
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html
export async function getAccountMainData(account_id: string, projectionExpression?: string): Promise<AccountMainData | undefined> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "accountsMainData" as TableName,
                ProjectionExpression: projectionExpression,
                Key: {
                    account_id: account_id
                },
            }

            const output = await ddbDocClient.send(new GetCommand(input))
            resolve(output.Item as AccountMainData)

        } catch (error) {
            reject(error)
        }
    })
}


// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.Pagination
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/querycommandinput.html



// PartiQL (NEW)
/**
 * @param expressionAttributes "account_id" or "account_id, short_id" or "short_id"
 */
export function getAccountMainDataAttributesByUsername(username: string, expressionAttributes: "account_id" | "short_id" | "account_id, short_id") {
    return new Promise<AccountMainData | undefined>(async (resolve, reject) => {
        try {


            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${expressionAttributes} FROM accountsMainData WHERE username = '${username}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
            }


            const output = await ddbDocClient.executeStatement(input)
            const accountMainData = output.Items[0] as AccountMainData
            resolve(accountMainData)


        } catch (error) {
            reject(error)
        }
    })
}


// PartiQL (NEW)
export function checkShortIdAvailability(short_id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT short_id FROM accountsMainData WHERE short_id = '${sanitizeString(short_id)}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
            }
            const ouput = await ddbDocClient.executeStatement(input)
            console.log(`\n----EVENT-----\nevent: checked ${short_id} short_id availability`)
            // ouput.Items = [ { short_id: "123" } ] or []
            resolve((ouput.Items?.length ?? 0) === 0)


        } catch (error) {
            reject(error)
        }
    })
}


// (NEW)
/**
 * Searches for the accounts main data with a similar "username" or "account_name" or both.
 * @param searchResults the already returned searchOutputs
 * 
 * see : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/executestatementcommandinput.html
*/
export function getMatchingAccountsMainData(searchQuery: string, searchResults: SearchResult[], searchWithUsername = true): Promise<AccountMainData[]> {
    return new Promise(async (resolve, reject) => {

        try {


            // Really good performance with following PartiQL code but there is the limit issue.
            /**
               const input: ExecuteStatementCommandInput = {
                Statement: `SELECT * FROM accountsMainData WHERE CONTAINS(\"search_name\", '${trimmedSearchInput}') OR CONTAINS(\"username\", '${trimmedSearchInput}')`,
                // Additionnal options 
                Limit: 80, // Will be a problem when there is more than 80 places. (--> will be required to use pagination with the next token.)
                // does not limits to showing only 80 reulsts but limits to only analysing the first 80 items so if there is 10 000 its a big problem --> it does not searches on the entire data set.
                // Or implement cloudsearch
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
               }
     
            const output = await ddbDocClient.executeStatement(input)

            Statement: `SELECT * FROM accountsMainData WHERE CONTAINS(\"account_name\", '${searchString.toLowerCase()}') OR CONTAINS(\"username\", '${searchString.toLowerCase().replace(/\s+/g, '')}')`,
             * Statement: `SELECT * FROM accountsMainData WHERE geolocation.latitude BETWEEN 38.0000 AND 39.0000 OR geolocation.longitude BETWEEN 2.0000 AND 4.000`,
             * 
             * 
            */


            // searchQuery = "George VI Paris"
            let formattedSearchQuery = stringInSearchQueryFormat(searchQuery)
            if (formattedSearchQuery === "") return // Avoids returning all items 



            const input: QueryCommandInput = {
                TableName: 'accountsMainData' as TableName,
                IndexName: searchWithUsername ? 's-username-index' : 's-search_name-index' as AccountMainDataIndex,
                KeyConditionExpression: `s = :constant and begins_with(${searchWithUsername ? "username" : "search_name"}, :sk)`,
                ExpressionAttributeValues: {
                    ":constant": { "N": "1" },
                    ":sk": { "S": formattedSearchQuery }, // "search_name" or "username"
                },
                Limit: 10,
                ReturnConsumedCapacity: "TOTAL"
            }


            const output = await ddbDocClient.send(new QueryCommand(input))
            if (output.Items.length === 0) {
                resolve([])
                return 
            }
            const accountsMainData = output.Items?.flatMap(e => {
                let accountMainData = unmarshall(e) as AccountMainData
                return accountMainData
            }) ?? []





            // Values are loaded --> now load account's main photo if not already done.
            let photosToLoadCount = accountsMainData?.length ?? 0
            if (photosToLoadCount === 0) {
                resolve(accountsMainData)
            }
            accountsMainData.forEach(async (e: AccountMainData) => {

                let item = searchResults.find(searchResult => { return searchResult.type === "accountMainData" && (searchResult.object as AccountMainData).account_id === e.account_id })
                // 1 : reuse already loaded image 
                if (item !== undefined) {

                    e.image_data = ImageDataObj((item.object as AccountMainData)?.image_data?.base64 ?? "")
                    photosToLoadCount -= 1
                    if (photosToLoadCount === 0) {
                        // 2
                        resolve(accountsMainData)
                    }

                }
                // 2 : load search photo 
                else {
                    try {

                        let file_name = getFileName("search_photo", e.short_id)
                        let base64 = await getContent("anyid-eu-west-1", file_name)
                        e.image_data = ImageDataObj(base64)

                        photosToLoadCount -= 1
                        if (photosToLoadCount === 0) {
                            // 2
                            resolve(accountsMainData)
                        }

                    } catch (error) {
                        console.log(`\n\n------> The image of the account ${e.account_id} could not be loaded`)
                        photosToLoadCount -= 1
                        if (photosToLoadCount === 0) {
                            resolve(accountsMainData)
                        }
                    }
                }

            })



        } catch (error) {
            reject(error)
        }


    })
}


/**
  UpdateExpression: "set info.plot = :p, info.#r = :r",
                ExpressionAttributeValues: {
                    ":p": "MOVIE_PLOT",
                    ":r": "MOVIE_RANK",
                },
*/
export function updateAccountMainData(account_id: string, attribute: keyof AccountMainData, value: any, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input: UpdateCommandInput = {
                TableName: 'accountsMainData' as TableName,
                Key: {
                    account_id: account_id,
                },
                UpdateExpression: `set ${attribute} = :v`,
                ExpressionAttributeValues: {
                    ":v": value,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export async function deleteAccountMainData(account_id: string, jwtToken: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: DeleteCommandInput = {
                TableName: "accountsMainData" as TableName,
                Key: {
                    account_id: account_id
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}





















// ---> Profile
// export type ProfileIndex = 'email-index' // (DEPRECATED) Keep index on server until first app not used
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html
export async function getProfile(account_id: string, projectionExpression?: string, description_localization_locale?: string): Promise<Profile | undefined> {
    return new Promise(async (resolve, reject) => {
        try {
            const input: GetCommandInput = {
                TableName: "profiles" as TableName,
                ProjectionExpression: !description_localization_locale ? projectionExpression : ["account_id", "additional_resources", "buttons", "comment_count", "email", "links", "phone_number", "menu_timetables", "post_count", "category_count", "related_items_count", "timetables", "description", "#dl.#dlc"].join(", "),
                // work around for reserved keywords
                ExpressionAttributeNames: description_localization_locale ? { "#dl": `description_localization`, "#dlc": description_localization_locale } : undefined,
                Key: {
                    account_id: account_id
                },
            }

            const output = await ddbDocClient.send(new GetCommand(input))
            resolve(output.Item as Profile)

        } catch (error) {
            reject(error)
        }
    })
}


/** 
 * Used to determine if an email is available.
*/
// PartiQL (NEW)
export function queryProfileByEmail(email: string): Promise<ExecuteStatementCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT email FROM profiles WHERE email = '${email.toLowerCase().replace(/\s+/g, '')}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
            }
            const output = await ddbDocClient.executeStatement(input)
            // const converted = unmarshall(output.Items[0] ?? [] as any)
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export function updateProfile(account_id: string, attribute: keyof Profile, value: any, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input = {
                TableName: 'profiles' as TableName,
                Key: {
                    account_id: account_id,
                },
                ExpressionAttributeValues: {
                    ":v": value,
                },
                UpdateExpression: `set ${attribute} = :v`, // When the updated attribute is a Link the attribute property looks something like this : 'links[2]' (2 for the index of the link to modify).
            }


            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)


            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export function updateProfileWithOperation(account_id: string, attribute: keyof Profile, operation: MathematicalOperation, value: number, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input = {
                TableName: 'profiles' as TableName,
                Key: {
                    account_id: account_id,
                },
                ExpressionAttributeValues: {
                    ":v": value,
                },
                UpdateExpression: `set ${attribute} = ${attribute} ${operation} :v`,
            }


            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export async function deleteProfile(account_id: string, jwtToken: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "profiles" as TableName,
                Key: {
                    account_id: account_id
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}






















// ---> RelatedItem
// export type RelatedItemIndex = "account_id-item_id-index" // (DEPRECATED) Keep index on server until first app not used
/**
    - A - loadBeforeCreatedDate is empty --> loads the first 8 most recent RelatedItems
    - B - loadBeforeCreatedDate os not empty --> loads the next 8 most recent RelatedItems after the given created date
*/
export function queryRelatedItemsByMostRecent(account_id: string, Limit = undefined, loadBeforeCreatedDate?: string, projectionExpression?: string, description_localization_locale?: string): Promise<RelatedItem[]> {
    return new Promise(async (resolve, reject) => {
        try {


            const hasCreatedDateParameter = (loadBeforeCreatedDate ?? "") !== ""


            const input: QueryCommandInput = {
                TableName: "relatedItems" as TableName,
                ScanIndexForward: false, // Descending order
                ExpressionAttributeValues: !hasCreatedDateParameter ?
                    // A
                    {
                        ":id": { "S": account_id },
                    } :
                    // B 
                    {
                        ":id": { "S": account_id },
                        ":c_date": { "S": loadBeforeCreatedDate ?? "" },
                    },
                KeyConditionExpression: !hasCreatedDateParameter ?
                    // A 
                    "account_id = :id" :
                    // B 
                    "account_id = :id and created_date < :c_date"
                ,
                ProjectionExpression: !description_localization_locale ? projectionExpression : ["account_id", "created_date", "description", "#dl.#dlc", "item_id", "link", "#n", "simple_location", "timetables"].join(", "),
                // work around for reserved keywords
                ExpressionAttributeNames: description_localization_locale ? { "#n": "name", "#dl": `description_localization`, "#dlc": description_localization_locale } : undefined,
                Limit: Limit
            }




            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)


        } catch (error) {
            reject(error)
        }
    })
}


/** 
 * Used to determine if an 'item_id' is unique.
*/
// PartiQL (NEW)
export function queryRelatedItemAttributesByItemId(account_id: string, item_id: string, expressionAttributes: "item_id" | "all"): Promise<RelatedItem | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${expressionAttributes === "all" ? "*" : expressionAttributes} FROM relatedItems WHERE account_id = '${sanitizeString(account_id)}' AND item_id = '${sanitizeString(item_id)}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL",
            }
            const output = await ddbDocClient.executeStatement(input)
            let relatedItem = output.Items ? output.Items[0] as RelatedItem : undefined
            resolve(relatedItem)

        } catch (error) {
            reject(error)
        }
    })
}


export function deleteRelatedItem(account_id: string, created_date: string, jwtToken: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input: DeleteCommandInput = {
                TableName: "relatedItems" as TableName,
                Key: {
                    account_id: account_id,
                    created_date: created_date,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

























// ---> Post
// export type PostCategoriesIndex = 'category_id-index' (DEPRECATED) Keep index on server until first app not used
export type PostIndex =
    'category_id-created_date-index'
// 'post_id-index' (DEPRECATED) Keep index on server until first app not used
export function queryAllPostCategories(account_id: string, projectionExpression = undefined): Promise<PostCategoryMetadata[]> {
    return new Promise(async (resolve, reject) => {
        try {


            const input = {
                TableName: "postCategories" as TableName,
                ExpressionAttributeValues: {
                    ":id": { "S": account_id },
                },
                KeyConditionExpression: "account_id = :id",
                ProjectionExpression: projectionExpression
            }


            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)


        } catch (error) {
            reject(error)
        }
    })
}


/** 
 * Used to determine if a 'category_id' is unique and to load a postCategory's metadata on the web version.
*/
export function getPostCategoryMetadataAttributesByCategoryId(category_id: string, expressionAttributes: "category_id" | "all"): Promise<PostCategoryMetadata | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${(expressionAttributes === "all" ? "*" : expressionAttributes)} FROM postCategories WHERE category_id = '${sanitizeString(category_id)}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL",
            }
            const output = await ddbDocClient.executeStatement(input)
            let item = output.Items ? output.Items[0] as PostCategoryMetadata : undefined
            resolve(item)

        } catch (error) {
            reject(error)
        }
    })
}


/**
    - A - loadBeforeCreatedDate is empty --> loads the first 8 most recent posts
    - B - loadBeforeCreatedDate os not empty --> loads the next 8 most recent posts after the given created date
*/
export function queryPostsByMostRecents(category_id: string, limit?: number, loadBeforeCreatedDate?: string, projectionExpression?: string, description_localization_locale?: string): Promise<Post[]> {
    return new Promise(async (resolve, reject) => {
        try {

            const hasCreatedDateParameter = loadBeforeCreatedDate !== undefined && loadBeforeCreatedDate !== ''
            // console.log("hasCreatedDateParameter : " + hasCreatedDateParameter)

            const input: QueryCommandInput = {
                TableName: "posts" as TableName,
                IndexName: "category_id-created_date-index" as PostIndex,
                ScanIndexForward: false, // Descending order
                ExpressionAttributeValues: !hasCreatedDateParameter ?
                    // A
                    {
                        ":id": { "S": category_id },
                    } :
                    // B 
                    {
                        ":id": { "S": category_id },
                        ":c_date": { "S": loadBeforeCreatedDate },
                    },
                KeyConditionExpression: !hasCreatedDateParameter ?
                    // A 
                    "category_id = :id" :
                    // B 
                    "category_id = :id and created_date < :c_date"
                ,
                ProjectionExpression: !description_localization_locale ? projectionExpression : ["post_id", "account_id", "category_id", "created_date", "saved_count", "comment_count", "comments_disabled", "geolocation", "geohash", "tagged", "link_url", "description", "#dl.#dlc", "#n"].join(", "),
                // work around for reserved keywords
                ExpressionAttributeNames: description_localization_locale ? { "#n": "name", "#dl": `description_localization`, "#dlc": description_localization_locale } : undefined,
                Limit: limit
            }





            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)

        } catch (error) {
            reject(error)
        }
    })
}


/** 
 * Used to determine if a 'post_id' is unique or to load a obtain the category_id of a post.
*/
export function getPostAttributesByPostId(post_id: string, expressionAttributes: "post_id" | "category_id" | "all"): Promise<Post | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${(expressionAttributes === "all" ? "*" : expressionAttributes)} FROM posts WHERE post_id = '${sanitizeString(post_id)}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL",
            }
            const output = await ddbDocClient.executeStatement(input)
            let item = output.Items ? output.Items[0] as Post : undefined
            resolve(item)

        } catch (error) {
            reject(error)
        }
    })
}


/**
 * Also updates the post the category's "updated_date".
 */
export function updatePostCategoryPostCount(account_id: string, category_id: string, operation: MathematicalOperation, value: number, update_date: string, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {


            const input: UpdateCommandInput = {
                TableName: 'postCategories' as TableName,
                Key: {
                    account_id: account_id,
                    category_id: category_id,
                },
                ExpressionAttributeValues: {
                    ":v": value,
                    ":u_d": update_date
                },
                UpdateExpression: `set post_count = post_count ${operation} :v, update_date = :u_d`,
            }


            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)

            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export function updatePostCategoryIndex(account_id: string, category_id: string, c_index: number, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {

        const input: UpdateCommandInput = {
            TableName: 'postCategories' as TableName,
            Key: {
                account_id: account_id,
                category_id: category_id,
            },
            ExpressionAttributeValues: {
                ":c_i": c_index,
            },
            UpdateExpression: `set c_index = :c_i`,
        }



        try {

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }




    })

}


export function updatePostCategoryUpdatedDate(account_id: string, category_id: string, update_date: string, jwtToken: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {


        const input = {
            TableName: 'postCategories' as TableName,
            Key: {
                account_id: account_id,
                category_id: category_id,
            },
            ExpressionAttributeValues: {
                ":u_d": update_date,
            },
            UpdateExpression: `set update_date = :u_d`,
        }



        try {

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)

            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }



    })
}


export function deletePostCategoryMetadata(account_id: string, category_id: string, jwtToken: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "postCategories" as TableName,
                Key: {
                    account_id: account_id,
                    category_id: category_id,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}


export function deletePost(account_id: string, post_id: string, jwtToken: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "posts" as TableName,
                Key: {
                    account_id: account_id,
                    post_id: post_id,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}















// PARTIQL issue (needs pagination)
export function queryTest(dummy_id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {


            /*
            In the table of items PK   number_value
                                  A    1
                                  B    2
                                  C    3
                                  D    1
                                  E    5
                                  ...

            (QUERY)
            REQUIRES AN INDEX TO QUERY THE DATA A CERTAIN WAY.
            LETS LIMITING THE RETURNED ITEMS PROPERLY.
            
            const input = {
                TableName: 'test' as BucketNameForDB,
                IndexName: "number_value-index",
                KeyConditionExpression: "number_value = :n_v",
                ExpressionAttributeValues: {
                    ":n_v": { "S": "4" },
                },
                Limit: 1,
            }
            const output = await ddbDocClient.send(new QueryCommand(input))


            
            (PARTIQL QUERY)
            LETS QUERYING ONE ITEM PRECISELY AND WITHOUT AN INDEX.
            NOT ADDING A LIMIT MAY ADD A LOT OF MULTIPLE ITEMS (A, 1), (D, 1) ...
            ISSUE : BUT ADDING A LIMIT OF 1 ITEM DISABLES QUERYING AFTER THE FIRST ITEM SO (A, 1) (B, 1), (C, 3), ... ARE NOT READABLE. 
            To solve the issue add an index and use it like : `SELECT * FROM "test"."number_value-index" WHERE number_value = '${"4"}'` rather than `SELECT * FROM "test" WHERE number_value = '${"4"}'`
            However this does not entirely works and requires PAGINATION. with the

            CODE WITH ISSUE: 
            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT * FROM "test" WHERE number_value = '${"4"}'`,
                // Additionnal options 
                Limit: 1,
                ReturnConsumedCapacity: "TOTAL"
            }
            const output = await ddbDocClient.executeStatement(input)

 */
            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT * FROM "test"."number_value-index" WHERE number_value = '${"4"}'`,
                // Additionnal options 
                Limit: 1,
                ReturnConsumedCapacity: "TOTAL"
            }
            const output = await ddbDocClient.executeStatement(input)



            alert(JSON.stringify(output.Items))
            resolve([] as any)


        } catch (error) {
            reject(error)
        }
    })
}







