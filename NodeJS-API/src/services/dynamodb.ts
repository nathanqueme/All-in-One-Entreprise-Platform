//
//  dynamodb.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { MathematicalOperation } from "../types"
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ddbDocClient, dynamoDBDocumentConstructor } from "../configs/dynamodb-client-config"
import { QueryCommand, ExecuteStatementCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { AccountMainData, Post, Profile, RelatedItem, PostCategoryMetadata } from "../data"
import { AccountActivity, AccountView, DeviceInfo, Session } from '../analyticsData'
import { handleReservedWords, catchReservedWords, handleHumanLanguage, formatResponseToHandleHL, stringInSearchQueryFormat, getOperationSign } from "../utils"
import { PutCommand, UpdateCommand, DeleteCommand, PutCommandOutput, UpdateCommandOutput, DeleteCommandOutput, DeleteCommandInput, UpdateCommandInput, PutCommandInput } from "@aws-sdk/lib-dynamodb"



// N.B.: Use PartiQL only when one item is supposed to be return.
// N.B. : the function unmarshall() is used to convert dynamodb objects into pure javascript objects for instance {'name': {'S': 'Mack'}} into {'name': 'Mack'} while using the QueryCommand from the @aws-sdk/client-dynamodb module
// 
// GetCommandInput : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/querycommandinput.html
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.Pagination
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/querycommandinput.html
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-dynamodb-utilities.html


// DEPRECATED indexes : Keep them on server until first app not used
// 'post_id-index'
// export type ProfileIndex = 'email-index'
// export type PostCategoriesIndex = 'category_id-index'



// TABLES__________________________________________________________________
// LEXICON : 
// HIDDEN : warns that the data is not intended to be viewed by users.
// U.B. (User behavior) : data designed to understand how people use the products and behave globaly. 
// U.I. (User interests) : indicates that the data could be used to understand what people like.
export type TableName =
    // CONTENT 
    'accountsMainData' |
    'postCategories' |
    'posts' |
    'profiles' |
    'relatedItems' |
    // ANALYTICS & DATA 
    // -> GLOBAL DATA :
    'userDevices' |             // HIDDEN / U.B.
    'sessions' |                // HIDDEN / U.B. / U.I.
    // -> MORE TARGETED DATA :
    'accountsViews' |           // U.I.
    'accountsActivity' |
    'searchHistory' |           // U.I. (TODO)
    'postsViews'                // U.I. (TODO)
// __________________________________________________________________________





// Writtes
// 
//
//
//
// ---> General
/**
 * @description Lets the owner of an account to upload its information a secured way.
 */
export async function putItem(table_name: TableName, item: Post | AccountMainData | Profile | RelatedItem | PostCategoryMetadata, jwt_token: string,): Promise<PutCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            function getItemPartionKey() {
                switch (table_name) {
                    case "accountsMainData": return ["account_id"]
                    case "postCategories": return ["account_id", "category_id"]
                    case "posts": return ["account_id", "post_id"]
                    case "profiles": return ["account_id"]
                    case "relatedItems": return ["account_id", "created_date"]
                    default: return undefined
                }
            }
            let condition_expression: string[] | undefined
            let partionKey = getItemPartionKey()
            if (partionKey !== undefined) {
                partionKey.forEach((e, index) => {
                    if (condition_expression === undefined) condition_expression = [`attribute_not_exists(${e})`]
                    else condition_expression[index] = `attribute_not_exists(${e})`
                })
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(
                new PutCommand({
                    TableName: table_name,
                    Item: item,
                    // avoids overwriting
                    ConditionExpression: condition_expression?.join(" AND ")
                })
            )
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

/** Saves analytics data without overwritting an item with the same partion key. */
export async function putDataItem(table_name: TableName, item: DeviceInfo | Session | AccountView | AccountActivity): Promise<PutCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            function getItemPartionKey() {
                switch (table_name) {
                    case 'userDevices': return ["device_id"]
                    case 'sessions': return ["id"]
                    case 'accountsViews': return ["account_id", "viewing_date"]
                    case 'accountsActivity': return ["account_id", "year_month"]
                    default: return undefined
                }
            }
            let condition_expression: string[] | undefined
            let partionKey = getItemPartionKey()
            if (partionKey !== undefined) {
                partionKey.forEach((e, index) => {
                    if (condition_expression === undefined) condition_expression = [`attribute_not_exists(${e})`]
                    else condition_expression[index] = `attribute_not_exists(${e})`
                })
            }

            const input: PutCommandInput = {
                TableName: table_name,
                Item: item,
                // avoids overwriting
                ConditionExpression: condition_expression?.join(" OR ")
            }

            const result = await ddbDocClient.send(new PutCommand(input))
            resolve(result)

        } catch (error) {
            reject(error)
        }
    })
}






// Reads
//
//
//
// ---> AccountMainData
export type AccountMainDataIndex = "s-username-index" | "s-search_name-index"
export async function getAccountMainData(account_id: string, part: string): Promise<AccountMainData | undefined> {
    return new Promise(async (resolve, reject) => {
        try {
            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${part} FROM accountsMainData WHERE account_id = '${account_id}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
            }

            const output = await ddbDocClient.executeStatement(input)
            const accountMainData = output.Items ? output.Items[0] as AccountMainData : undefined
            resolve(accountMainData)

        } catch (error) {
            reject(error)
        }
    })
}

/**
 * @param part "account_id" or "account_id, short_id" or "short_id"
 */
export function getAccountMainDataByUsername(username: string, part: string) {
    return new Promise<AccountMainData | undefined>(async (resolve, reject) => {
        try {

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${part} FROM accountsMainData WHERE username = '${username}'`,
                // Additionnal options 
                // WARNING : do not use a limit here otherwise only checks for one item.
                ConsistentRead: true,
                ReturnConsumedCapacity: "TOTAL"
            }

            const output = await ddbDocClient.executeStatement(input)
            const accountMainData = (output?.Items ?? [])[0] as AccountMainData // TODO
            resolve(accountMainData)

        } catch (error) {
            reject(error)
        }
    })
}

// DEPRECATED : getAccountMainDataAttributesByAccountId
// TODO : checkShortIdAvailability(short_id: string)

/**
 * Searches for the accounts main data with a similar "username" or "account_name" or both.
 * @param searchResults the already returned searchOutputs
 * 
 * see : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/executestatementcommandinput.html
*/
export function searchAccountsMainData(q: string, with_username = true): Promise<AccountMainData[]> {
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
            let formattedSearchQuery = stringInSearchQueryFormat(q)
            if (formattedSearchQuery === "") return // Avoids returning all items 

            const input: QueryCommandInput = {
                TableName: 'accountsMainData' as TableName,
                IndexName: with_username ? 's-username-index' : 's-search_name-index' as AccountMainDataIndex,
                KeyConditionExpression: `s = :constant and begins_with(${with_username ? "username" : "search_name"}, :sk)`,
                ExpressionAttributeValues: {
                    ":constant": { "N": "1" },
                    ":sk": { "S": formattedSearchQuery }, // "search_name" or "username"
                },
                Limit: 10,
                ReturnConsumedCapacity: "TOTAL"
            }

            const output = await ddbDocClient.send(new QueryCommand(input))
            const accountsMainData = output.Items?.flatMap(e => {
                let accountMainData = unmarshall(e) as AccountMainData
                accountMainData.search_name = stringInSearchQueryFormat(accountMainData.account_name)
                return accountMainData
            }) ?? []


            resolve(accountsMainData)


        } catch (error) {
            reject(error)
        }


    })
}

export function updateAccountMainData(account_id: string, attribute: keyof AccountMainData, value: any, jwt_token: string): Promise<UpdateCommandOutput> {
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

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

export async function deleteAccountMainData(account_id: string, jwt_token: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: DeleteCommandInput = {
                TableName: "accountsMainData" as TableName,
                Key: { account_id: account_id },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}





// ---> Profile
export async function getProfile(account_id: string, part: string, hl?: string): Promise<Profile | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const hl_aware_part = handleHumanLanguage(part, hl)

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${hl_aware_part} FROM profiles WHERE account_id = '${account_id}'`,
                ConsistentRead: true
            }

            const output = await ddbDocClient.executeStatement(input)
            let profile: Profile | undefined
            if (output.Items) {
                profile = output.Items[0] as Profile
                if (hl) {
                    profile = formatResponseToHandleHL(profile, hl)
                }
            }
            resolve(profile)

        } catch (error) {
            reject(error)
        }
    })
}

/** Used to determine if an email is available. */
export function queryProfileByEmail(email: string, part: string, hl?: string): Promise<Profile | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const hl_aware_part = handleHumanLanguage(part, hl)

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${hl_aware_part} FROM profiles WHERE email = '${email.toLowerCase().replace(/\s+/g, '')}'`,
                ConsistentRead: true
            }
            const output = await ddbDocClient.executeStatement(input)
            let profile: Profile | undefined
            if (output.Items) {
                profile = output.Items[0] as Profile
                if (hl) {
                    profile = formatResponseToHandleHL(profile, hl)
                }
            }
            resolve(profile)

        } catch (error) {
            reject(error)
        }
    })
}

export function updateProfile(account_id: string, attribute: keyof Profile, value: any, jwt_token: string): Promise<UpdateCommandOutput> {
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


            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)


            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

export function updateProfileWithOperation(account_id: string, attribute: keyof Profile, operation: MathematicalOperation, value: number, jwt_token: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const operation_sign = getOperationSign(operation)

            const input = {
                TableName: 'profiles' as TableName,
                Key: { account_id: account_id },
                ExpressionAttributeValues: { ":value": value },
                UpdateExpression: `SET ${attribute} = ${attribute} ${operation_sign} :value`,
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

export async function deleteProfile(account_id: string, jwt_token: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "profiles" as TableName,
                Key: {
                    account_id: account_id
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}







// ---> RelatedItem
// export type RelatedItemIndex = "account_id-item_id-index" // (DEPRECATED) Keep index on server until first app not used
/** Queries related items by most recently created.
    - A - loadBeforeCreatedDate is empty --> loads the first 8 most recent RelatedItems
    - B - loadBeforeCreatedDate os not empty --> loads the next 8 most recent RelatedItems after the given created date
*/
export function queryRelatedItems(account_id: string, part: string, max_results?: number, load_before_created_date?: string, hl?: string): Promise<RelatedItem[]> {
    return new Promise(async (resolve, reject) => {
        try {

            const hl_aware_part = handleHumanLanguage(part, hl)
            const hasCreatedDateParameter = (load_before_created_date ?? "") !== ""

            const input: QueryCommandInput = {
                TableName: "relatedItems" as TableName,
                ScanIndexForward: false, // Descending order
                ExpressionAttributeValues: !hasCreatedDateParameter ?
                    // A
                    { ":id": { "S": account_id }, } :
                    // B 
                    {
                        ":id": { "S": account_id },
                        ":c_date": { "S": load_before_created_date ?? "" },
                    },
                KeyConditionExpression: !hasCreatedDateParameter ?
                    // A 
                    "account_id = :id" :
                    // B 
                    "account_id = :id and created_date < :c_date"
                ,
                ProjectionExpression: catchReservedWords(hl_aware_part),
                ExpressionAttributeNames: handleReservedWords(hl_aware_part),
                Limit: max_results
            }

            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)

        } catch (error) {
            reject(error)
        }
    })
}

/** Used to determine if an 'item_id' is unique */
export function queryRelatedItemByItemId(account_id: string, item_id: string, part: string, hl?: string): Promise<RelatedItem | undefined> {
    return new Promise(async (resolve, reject) => {
        try {

            const hl_aware_part = handleHumanLanguage(part, hl)

            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${hl_aware_part} FROM relatedItems WHERE account_id = '${account_id}' AND item_id = '${item_id}'`,
                ConsistentRead: true,
            }

            const output = await ddbDocClient.executeStatement(input)
            let relatedItem: RelatedItem | undefined
            if (output.Items) {
                relatedItem = output.Items[0] as RelatedItem
                if (hl) {
                    relatedItem = formatResponseToHandleHL(relatedItem, hl)
                }
            }
            resolve(relatedItem)

        } catch (error) {
            reject(error)
        }
    })
}

export function deleteRelatedItem(account_id: string, created_date: string, jwt_token: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const input: DeleteCommandInput = {
                TableName: "relatedItems" as TableName,
                Key: {
                    account_id: account_id,
                    created_date: created_date,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}






// ---> Posts
export type PostIndex = 'category_id-created_date-index'
export function queryPostCategories(account_id: string, part: string, max_results?: number): Promise<PostCategoryMetadata[]> {
    return new Promise(async (resolve, reject) => {
        try {

            const input = {
                TableName: "postCategories" as TableName,
                ExpressionAttributeValues: {
                    ":id": { "S": account_id },
                },
                KeyConditionExpression: "account_id = :id",
                ProjectionExpression: catchReservedWords(part),
                ExpressionAttributeNames: handleReservedWords(part),
                Limit: max_results
            }

            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)

        } catch (error) {
            reject(error)
        }
    })
}

// DEPRECATED getPostCategoryByCategoryId()

/** Query posts by most recently created 
    - A - loadBeforeCreatedDate is empty --> loads the first 8 most recent posts
    - B - loadBeforeCreatedDate os not empty --> loads the next 8 most recent posts after the given created date
*/
export function queryPosts(category_id: string, part: string, max_results?: number, load_before_created_date?: string, hl?: string): Promise<Post[]> {
    return new Promise(async (resolve, reject) => {
        try {

            const hl_aware_part = handleHumanLanguage(part, hl)
            const hasCreatedDateParameter = load_before_created_date !== undefined && load_before_created_date !== ''

            const input: QueryCommandInput = {
                TableName: "posts" as TableName,
                IndexName: "category_id-created_date-index" as PostIndex,
                ScanIndexForward: false, // Descending order
                ExpressionAttributeValues: !hasCreatedDateParameter ?
                    // A
                    { ":id": { "S": category_id }, } :
                    // B 
                    {
                        ":id": { "S": category_id },
                        ":c_date": { "S": load_before_created_date },
                    },
                KeyConditionExpression: !hasCreatedDateParameter ?
                    // A 
                    "category_id = :id" :
                    // B 
                    "category_id = :id and created_date < :c_date"
                ,
                ProjectionExpression: catchReservedWords(hl_aware_part),
                ExpressionAttributeNames: handleReservedWords(hl_aware_part),
                Limit: max_results
            }

            const output = await ddbDocClient.send(new QueryCommand(input))
            const convertedItems = output.Items?.flatMap(e => { return unmarshall(e) }) ?? []
            resolve(convertedItems)

        } catch (error) {
            reject(error)
        }
    })
}

// DEPRECATED getPostAttributesByPostId()

/**
 * Also updates the post the category's "updated_date".
 */
export function updatePostCategoryPostCount(account_id: string, category_id: string, operation: MathematicalOperation, value: number, update_date: string, jwt_token: string): Promise<UpdateCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {

            const operation_sign = getOperationSign(operation)

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
                UpdateExpression: `set post_count = post_count ${operation_sign} :v, update_date = :u_d`,
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)

            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

export function updatePostCategoryIndex(account_id: string, category_id: string, c_index: number, jwt_token: string): Promise<UpdateCommandOutput> {
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

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)
            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }

    })
}

export function updatePostCategoryUpdatedDate(account_id: string, category_id: string, update_date: string, jwt_token: string): Promise<UpdateCommandOutput> {
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

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)

            const output = await dynamoDBDocument.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }

    })
}

export function deletePostCategoryMetadata(account_id: string, category_id: string, jwt_token: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "postCategories" as TableName,
                Key: {
                    account_id: account_id,
                    category_id: category_id,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}

export function deletePost(account_id: string, post_id: string, jwt_token: string): Promise<DeleteCommandOutput> {
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                TableName: "posts" as TableName,
                Key: {
                    account_id: account_id,
                    post_id: post_id,
                },
            }

            const dynamoDBDocument = dynamoDBDocumentConstructor(jwt_token)

            const output = await dynamoDBDocument.send(new DeleteCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}





// ---> AccountsActivity
export function getAccountActivity(account_id: string, year_month: string, part: string) {
    return new Promise<AccountActivity | undefined>(async (resolve, reject) => {
        try {
            const input: ExecuteStatementCommandInput = {
                Statement: `SELECT ${part} FROM accountsActivity WHERE account_id = '${account_id}' AND year_month = '${year_month}'`,
                ConsistentRead: true,
            }

            const output = await ddbDocClient.executeStatement(input)
            const accountActivity = output.Items ? output.Items[0] as AccountActivity : undefined
            resolve(accountActivity)

        } catch (error) {
            reject(error)
        }
    })
}

export function updateAccountsActivity(account_id: string, year_month: string, value: number) {
    return new Promise(async (resolve, reject) => {
        try {

            const input: UpdateCommandInput = {
                TableName: 'accountsActivity' as TableName,
                Key: {
                    account_id: account_id,
                    year_month: year_month,
                },
                ExpressionAttributeValues: {
                    ":v": value
                },
                UpdateExpression: `ADD view_count :v`,
            }

            const output = await ddbDocClient.send(new UpdateCommand(input))
            resolve(output)

        } catch (error) {
            reject(error)
        }
    })
}




// ---> Accounts 
export function getAccountViews(account_id: string, year_month: string, part: string, max_results?: number) {
    return new Promise<AccountView[]>(async (resolve, reject) => {

        try {
            const input: QueryCommandInput = {
                TableName: 'accountsViews' as TableName,
                KeyConditionExpression: "account_id = :pk AND begins_with(viewing_date, :sk)",  // WARNING: to load January's content specify year_month = "2022-01" and not "2022-1" Otherwise woöö fetch the month of Octobre ("2022-10")
                ExpressionAttributeValues: {
                    ":pk": { "S": account_id },
                    ":sk": { "S": year_month },
                },
                IndexName: "viewing_date-index", 
                ProjectionExpression: catchReservedWords(part),
                Limit: max_results
            }

            const output = await ddbDocClient.send(new QueryCommand(input))
            const accountViews = output.Items?.flatMap(e => unmarshall(e) as AccountView) ?? []
            resolve(accountViews)

        } catch (error) {
            reject(error)
        }
    })
}

