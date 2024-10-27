//
//  cognito.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
// Cognito
import { userPool } from './configs/main-config'
import {
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserSession,
    CognitoRefreshToken,
} from "amazon-cognito-identity-js" // --> this sdk allows : sign-up users, authenticate users, view, delete, and update user attributes within the Amazon Cognito Identity service. 
import { AnyAction, Dispatch } from '@reduxjs/toolkit'
// import { updateUiStateValue, updateUiStateValuePayload } from '../state/slices/uiStatesSlice'
import { dynamoDBDocumentConstructor } from './configs/dynamodb-client-config'




// Session related 


/*

Weird behavior with : 


   cognitoUser.getSession(function (error, session) {
            alert(JSON.stringify(session))
        })


 */


/** 
 * @returns a "CognitoUserSession" from the "user pool". 
 * Usage : some of the "CognitoUserSession" metadata is cached (this is done outside of this function) in order to use sdks as an authenticated user.
 * 
 * 
 * user's account state : user is registered and its account is checked.
 */
export async function signInUser(username: string, password: string): Promise<CognitoUserSession> {
    var authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
    })
    var cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
    })


    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async function (userSession) {
                resolve(userSession)
                cognitoUser.getSession(function callback() { })
            },
            onFailure: function (error) {
                reject(error)
            },
        })
    })
}




export async function signInUserAndReturnCognitoUser(username: string, password: string): Promise<CognitoUser> {
    var authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
    })
    var cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
    })


    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async function (userSession) {
                resolve(cognitoUser)
            },
            onFailure: function (error) {
                reject(error)
            },
        })
    })
}









/**
 * Represents a signed in user session's metadata.
 * 
 * account_id : the id of the user's account.                                                                                    (Private: no -> public)
 * jwtToken : the token used to send request to the sdks with the user's cognito attributes and as an authenticated user.        (Private: yes -> sensitive)
 * refreshToken : the token used to refresh the "jwtToken".                                                                      (Private: yes -> sensitive)   
 * 
 */
export interface CachedSessionMetadata {
    account_id: string
    jwtToken: string
    refreshToken: string
}

/**
 * 
 * @param session "CognitoUserSession"
 * @returns some of its metadata
*/
export function getSessionMetadata(session: CognitoUserSession): Promise<CachedSessionMetadata> {
    return new Promise(async (resolve, reject) => {

        let jwtToken = session.getIdToken().getJwtToken()
        let refreshToken = session.getRefreshToken().getToken()




        // Getting user's aws "identityID" (N.B.: comes from the Identity pool and not user pool)
        // ---> the "identityID" is called "account_id" on the app.
        // 
        // ---> equivalent in deprecated code at : https://www.npmjs.com/package/amazon-cognito-identity-js
        // Code sample of the step 4 :
        // refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        // AWS.config.credentials.refresh(error => {
        // ---> before a global config was needed now it is passed and accessible throught each service : DynamoDB, S3 and so on.
        // and accessed like that ...
        const dynamoDBDocument = dynamoDBDocumentConstructor(jwtToken)
        try {

            let credentials = await dynamoDBDocument.config.credentials({ forceRefresh: false }) // forcing the Refresh is not needed 
            let account_id = (credentials as any)["identityId"]
            resolve(CachedSessionMetadataObj(account_id, jwtToken, refreshToken))

        } catch (error) {
            reject(error)
        }



    })
}




export function CachedSessionMetadataObj(account_id: string, jwtToken: string, refreshToken: string) {
    return {
        account_id: account_id,
        jwtToken: jwtToken,
        refreshToken: refreshToken
    }
}
/**
 * Caches the given session.
*/
// TODO
export function cacheSessionMetadata(username: string, sessionMetadata: CachedSessionMetadata) {
    return new Promise(async (resolve, reject) => {

        /*
        try {
            await Keychain.setGenericPassword(username, JSON.stringify(sessionMetadata))
            resolve("\nCognito session metadata successfully cached.")
        } catch {
            reject("\nCognito session metadata was not successfully cached.")
        }
        */

    })
}



/**
 * 
 * - 1 - Retrieves the cached "refreshToken".
 * - 2 - Refreshes the "jwtToken" by using the "refreshToken".
 * - 3 - Updates the cache.
 * - 4 - Update the uiState that indicates if the "jwtToken" was refreshed.
 * 
 * 
 * 
 * @param username can be the "email_address" or the "prefered_username" of the cognito username.
 * @returns refreshed jwtToken
 * 
 */
// TODO
export function refreshAndUpdateUserJwtToken(username: string, dispatch: Dispatch<AnyAction>): Promise<string> {
    return new Promise(async (resolve, reject) => {


        console.log("\n\n--> refreshAndUpdateUserJwtToken")


        // Step 1
        let cachedSessionMetadata: CachedSessionMetadata = CachedSessionMetadataObj("", "", "")
        try {
            // const credentials: any = await Keychain.getGenericPassword()
            // if (credentials.password !== undefined) cachedSessionMetadata = JSON.parse(credentials.password)
        } catch (error) {
            reject("Error : Failed retrieving user's session metadata.")
        }
        console.log("\nStep 1 done")



        // Step 2 
        let sessionMetadata: CachedSessionMetadata = CachedSessionMetadataObj("", "", "")
        try {
            let session = await refreshUserSession(username, cachedSessionMetadata.refreshToken)
            sessionMetadata = await getSessionMetadata(session)
        } catch (error) {
            reject(error)
        }
        console.log("Step 2 done (session refreshed from cognito function : refreshAndUpdateUserJwtToken())")



        // Step 3 
        try {
            await cacheSessionMetadata(username, sessionMetadata)
        } catch (error) {
            reject(error)
        }
        console.log("Step 3 done")



        // Step 4
        // let payload: updateUiStateValuePayload = { attribute: "jwtTokenWasRefreshed", value: true }
        // dispatch(updateUiStateValue(payload))
        resolve(sessionMetadata.jwtToken)
        console.log("Step 4 done")



    })
}



export function refreshUserSession(username: string, refreshToken: string): Promise<CognitoUserSession> {
    return new Promise(async (resolve, reject) => {


        var cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        })


        let cognitoRefreshToken = new CognitoRefreshToken({ "RefreshToken": refreshToken })



        // Crashes here when trying to refresh tokens without an internet connection
        cognitoUser.refreshSession(cognitoRefreshToken, function callback(error, result) {
            if (error !== undefined && error !== null) {
                reject(error)
            } else {
                resolve(result)
            }
        })



    })
}


// TODO
export function getJwtToken(): Promise<string> {
    return new Promise(async (resolve, reject) => {

        try {
            // const credentials: any = await Keychain.getGenericPassword()
            // let cachedSessionMetadata: CachedSessionMetadata = JSON.parse(credentials.password)
            // resolve(cachedSessionMetadata.jwtToken)
        } catch (error) {
            reject("Error: token could not have been fetched")
        }

    })
}




/** 
 * user's account state : user is signed up and authenticated.
 */
export async function signOutUser(username: string) {


    var cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
    })


    return new Promise((resolve, reject) => {
        cognitoUser.globalSignOut({
            onSuccess: async function (msg) {
                resolve(msg)
            },
            onFailure: function (error) {
                reject(error)
            },
        })
    })
}




















// Cognito attributes editing 


/**
 *  user's account state : user is registered.
 */
export function signUpUser(username: string, password: string, email?: string, country_code_and_phone_mumber?: string) {
    return new Promise((resolve, reject) => {


        var dataEmail = {
            Name: 'email',
            Value: email ?? "",
        }
        var dataPhoneNumber = {
            Name: 'phone_number',
            Value: country_code_and_phone_mumber ?? "",
        }
        var attributeEmail = new CognitoUserAttribute(dataEmail)
        var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber)

        var attributeList = []
        attributeList.push(attributeEmail)
        attributeList.push(attributePhoneNumber)

        userPool.signUp(username, password, attributeList, [], function (error, result) {
            if (error) { reject(error); return }
            resolve(result) // var cognitoUser = result.user
        })


    })

}



/**
 * Usage : checks the user's account and email during sign up 
 * 
 * User's account state : user is registered and its account is checked.
 */
export function confirmRegistration(username: string, code: string) {
    return new Promise((resolve, reject) => {
        var userData = {
            Username: username,
            Pool: userPool,
        };

        var cognitoUser = new CognitoUser(userData)
        cognitoUser.confirmRegistration(code, true, function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}











/**
 * 
 * User's account state : user is registered or signed up.
 */
export function sendConfirmationCode(username: string) {
    return new Promise((resolve, reject) => {
        var userData = {
            Username: username,
            Pool: userPool,
        }
        var cognitoUser = new CognitoUser(userData)
        cognitoUser.resendConfirmationCode(function (error, result) {
            if (error) {
                reject(error); return
            }
            resolve(result)
        })

    })
}




/**
 * On success returns the information about who it was sent to.
 */
export function initiateChangingForgottenPassword(username: string) {
    return new Promise((resolve, reject) => {
        var userData = {
            Username: username,
            Pool: userPool
        }

        let cognitoUser = new CognitoUser(userData)

        cognitoUser.forgotPassword({
            onSuccess: function (data) {
                resolve(data)
            },
            onFailure: function (err) {
                reject(err)
            },
            inputVerificationCode: function (data) {
                resolve(data["CodeDeliveryDetails"]["Destination"]) // sent to ... data
            }
        })
    })
}





/**
 * The step just after "initiateChangingForgottenPassword", to confirm updating the password once the user as received and entered the correct code.
 */
export function updateForgottenPassword(username: string, verificationCode: string, newPassword: string) {
    return new Promise((resolve, reject) => {
        var userData = {
            Username: username,
            Pool: userPool
        }

        let cognitoUser = new CognitoUser(userData)

        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess() {
                resolve('Password changed')
            },
            onFailure(error) {
                reject(error)
            },
        })
    })
}






/**
 * 
 * User's account state : user is signed up and authenticated.
 */
export function verifyAttribute(attributeName: UserAttribute, code: string): Promise<string | Error> {
    return new Promise((resolve, reject) => {

        const cognitoUser = userPool.getCurrentUser()


        // Needed to work
        cognitoUser?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
        })

        cognitoUser?.verifyAttribute(attributeName, code, {
            onSuccess: function (string) { resolve(string) },
            onFailure: function (error) { reject(error) }
        })

    })
}





/**
 * 
 * User's account state : user is registered.
 */
export async function deleteUser(username: string) {
    return new Promise((resolve, reject) => {
        var userData = {
            Username: username,
            Pool: userPool,
        };

        var cognitoUser = new CognitoUser(userData)
        cognitoUser.deleteUser(function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}





/**
 * 
 * User's account state : user is signed up and authenticated.
 */
export async function updatePassword(oldPassword: string, newPassword: string) {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser()


        // Needed to work
        cognitoUser?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
        })


        cognitoUser?.changePassword(oldPassword, newPassword, function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}



export type UserAttribute = 'email' | 'phone_number' | 'preferred_username'
/**
 * 
 * User's account state : user is signed up and authenticated.
 */
export async function updateUserPoolAttribute(userAttribute: UserAttribute, newValue: string) {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser()


        // Needed to work
        cognitoUser?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
            // alert(JSON.stringify("YOYOO"))
        })


        var attributeList = []
        var attributeData = {
            Name: userAttribute,
            Value: newValue,
        }
        var attribute = new CognitoUserAttribute(attributeData)
        attributeList.push(attribute)


        cognitoUser?.updateAttributes(attributeList, function (error, result) {
            if (error) {
                reject(error)
                return;
            }
            resolve(result)
        })


    })
}



/**
 * 
 * User's account state : user is signed up and authenticated.
 */
export async function getUserAttributes(): Promise<CognitoUserAttribute[]> {
    return new Promise((resolve, reject) => {


        const cognitoUser = userPool.getCurrentUser()


        // Needed to work
        cognitoUser?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
        })


        cognitoUser?.getUserAttributes(function (error, result) {
            if (error) {
                reject(error)
                return;
            }
            resolve(result ?? [])
        })


    })
}
