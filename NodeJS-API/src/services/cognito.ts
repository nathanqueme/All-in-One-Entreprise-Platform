//
//  cognito.ts
//  atsight_apis
//
//  Created by Nathan Queme the 10/04/22
//

import { userPool } from '../configs/main-config'
import {
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserSession,
    CognitoRefreshToken,
} from "amazon-cognito-identity-js" // --> this sdk allows : sign-up users, authenticate users, view, delete, and update user attributes within the Amazon Cognito Identity service. 


/**
 *  user's account state : user is registered.
 */
 export function signUpUser(username: string, password: string, email?: string, formatted_phone_mumber?: string) {
    return new Promise((resolve, reject) => {

        var email_data = {
            Name: 'email',
            Value: email ?? "",
        }
        var phone_number_data = {
            Name: 'phone_number',
            Value: formatted_phone_mumber ?? "",
        }
        var email_attribute = new CognitoUserAttribute(email_data)
        var phone_number_attribute = new CognitoUserAttribute(phone_number_data)

        var attributeList = []
        attributeList.push(email_attribute)
        attributeList.push(phone_number_attribute)

        userPool.signUp(username, password, attributeList, [], function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })

    })
}

/**
 * Usage : checks the user's account and email during sign up 
 * 
 * User's account state : user is registered and its account is checked.
 */
 export function confirmSignUp(username: string, code: string) {
    return new Promise((resolve, reject) => {
        var user_data = {
            Username: username,
            Pool: userPool,
        };

        var cognito_user = new CognitoUser(user_data)
        cognito_user.confirmRegistration(code, true, function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}
 
interface SignInOutput {
    session: CognitoUserSession
    cognito_user: CognitoUser
}
// sign_in
/** 
 * @returns a "CognitoUserSession" from the "user pool". 
 * Usage : some of the "CognitoUserSession" metadata is cached (this is done outside of this function) in order to use sdks as an authenticated user.
 * 
 * 
 * user's account state : user is registered and its account is checked.
 */
export async function signInUser(username: string, password: string): Promise<SignInOutput> {
    var auth_details = new AuthenticationDetails({
        Username: username,
        Password: password,
    })
    var cognito_user = new CognitoUser({
        Username: username,
        Pool: userPool,
    })

    return new Promise((resolve, reject) => {
        cognito_user.authenticateUser(auth_details, {
            onSuccess: async function (session) {
                cognito_user.getSession(function callback() { })
                resolve({ session: session, cognito_user: cognito_user })
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

// refresh_session
export function refreshUserSession(username: string, refresh_token: string): Promise<CognitoUserSession> {
    return new Promise(async (resolve, reject) => {

        var cognito_user = new CognitoUser({
            Username: username,
            Pool: userPool,
        })

        let cognito_refresh_token = new CognitoRefreshToken({ "RefreshToken": refresh_token })

        // Crashes here when trying to refresh tokens without an internet connection
        cognito_user.refreshSession(cognito_refresh_token, function callback(error, result) {
            if (error !== undefined && error !== null) {
                reject(error)
            } else {
                resolve(result)
            }
        })

    })
}

// sign_out
/** 
 * user's account state : user is signed up and authenticated.
 */
export async function signOutUser(username: string) {

    var cognito_user = new CognitoUser({
        Username: username,
        Pool: userPool,
    })

    return new Promise((resolve, reject) => {
        cognito_user.globalSignOut({
            onSuccess: async function (msg) {
                resolve(msg)
            },
            onFailure: function (error) {
                reject(error)
            },
        })
    })
}

// change_password 
/**
 * On success returns the information about who it was sent to.
 */
export function initiateChangingForgottenPassword(username: string) {
    return new Promise((resolve, reject) => {
        var user_data = {
            Username: username,
            Pool: userPool
        }

        let cognito_user = new CognitoUser(user_data)

        cognito_user.forgotPassword({
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

// change_password 
/**
 * The step just after "initiateChangingForgottenPassword", to confirm updating the password once the user as received and entered the correct code.
 */
export function updateForgottenPassword(username: string, verification_code: string, new_password: string) {
    return new Promise((resolve, reject) => {
        var user_data = {
            Username: username,
            Pool: userPool
        }

        let cognito_user = new CognitoUser(user_data)

        cognito_user.confirmPassword(verification_code, new_password, {
            onSuccess() {
                resolve('Password changed')
            },
            onFailure(error) {
                reject(error)
            },
        })
    })
}

// change_password 
/**
 * 
 * User's account state : user is signed up and authenticated.
 */
 export async function updatePassword(old_password: string, new_password: string) {
    return new Promise((resolve, reject) => {
        const cognito_user = userPool.getCurrentUser()

        // Needed to work
        cognito_user?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
        })

        cognito_user?.changePassword(old_password, new_password, function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}

// send_code
/**
 * 
 * User's account state : user is registered or signed up.
 */
 export function sendConfirmationCode(username: string) {
    return new Promise((resolve, reject) => {
        var user_data = {
            Username: username,
            Pool: userPool,
        }
        var cognito_user = new CognitoUser(user_data)
        cognito_user.resendConfirmationCode(function (error, result) {
            if (error) {
                reject(error); return
            }
            resolve(result)
        })

    })
}

// user_info/check
/**
 * Checks that the email or phone number belongs to the user with the code received by e-mail/SMS.
 * User's account state : user is signed up and authenticated.
*/
export function verifyAttribute(user_attribute: UserAttribute, code: string): Promise<string | Error> {
    return new Promise((resolve, reject) => {

        let cognito_user = userPool.getCurrentUser()

        // Needed to work
        cognito_user?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
        })

        cognito_user?.verifyAttribute(user_attribute, code, {
            onSuccess: function (string) { resolve(string) },
            onFailure: function (error) { reject(error) }
        })

    })
}

export type UserAttribute = 'email' | 'phone_number' | 'preferred_username'
// user_info/change
/**
 * 
 * User's account state : user is signed up and authenticated.
 */
export async function updateUserPoolAttribute(user_attribute: UserAttribute, new_value: string) {
    return new Promise((resolve, reject) => {
        const cognito_user = userPool.getCurrentUser()

        // Needed to work
        cognito_user?.getSession(function (error: Error, session: any) {
            // alert(JSON.stringify(session))
            // alert(JSON.stringify("YOYOO"))
        })

        var attributes = []
        var attribute_data = {
            Name: user_attribute,
            Value: new_value,
        }
        var attribute = new CognitoUserAttribute(attribute_data)
        attributes.push(attribute)

        cognito_user?.updateAttributes(attributes, function (error, result) {
            if (error) {
                reject(error)
                return;
            }
            resolve(result)
        })

    })
}

// delete_user
/**
 * 
 * User's account state : user is registered.
 */
 export async function deleteUser(username: string) {
    return new Promise((resolve, reject) => {
        var user_data = {
            Username: username,
            Pool: userPool,
        };

        var cognito_user = new CognitoUser(user_data)
        cognito_user.deleteUser(function (error, result) {
            if (error) { reject(error); return }
            resolve(result)
        })
    })
}
