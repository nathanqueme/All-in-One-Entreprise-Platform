//
//  AttributeEditingFunctions.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import { InformationType } from '../Types'
import { AccountMainData, Link, LinkObj, Page } from '../Data'
import { checkLinkValidity, getPhoneNumberDescription, stringInSearchQueryFormat } from '../components/functions'
import { getErrorDescription } from './AlertsAndErrors'
import { queryProfileByEmail, getAccountMainDataAttributesByUsername } from '../aws/dynamodb'
import { getJwtToken, refreshAndUpdateUserJwtToken, updateUserPoolAttribute, UserAttribute } from '../aws/cognito'
import { updateAccountMainData, updateProfile } from '../aws/dynamodb'

// Global data 
import { updateAccountMainDataValue } from '../state/slices/accountsMainDataSlice'
import { updateUiStateValue, UiStatesInterface } from '../state/slices/uiStatesSlice'
import { updateProfileValue } from '../state/slices/profilesSlice'
import { AnyAction, Dispatch } from '@reduxjs/toolkit'




/** A component that haandles updating attributes on user's accountMainData, Profile and UserPool.
 * It updates the UI and checks the new value if needed.
 * Displays an 'ActivityIndicator' on start and stops once process is done.
 

* @returns an rejected Promise when an issue occured and a resolved promise when succeeded.


Process steps : 
   - 1 - Check if the newValue is valid/unique (if needed)
       - A - Attribute is a 'link' : Check its validity 
       - B - Attribute is a 'username' : Check its availability
   - 2 - removed step
   - 3 - Update the attribute's value on :
       - 1 - DynamoDB
       - 2 - User pool (if needed)
       - 3 - Ui 
  
  
  * @param value is a PhoneNumber when the 'infoType' is equal to 'phoneNumber'.
  * @param value is a Link when the 'infoType' is equal to 'website_link',
  * @param value is a Geolocation when the 'infoType' is equal to 'geolocation'.
  * @param value is Timetables when the 'infoType' is equal to 'timetables'.
  
  
 */
export function updateAttribute(dispatch: Dispatch<AnyAction>, page: Page, infoType: InformationType, value: any, username: string, jwtTokenWasRefreshed: boolean, links?: Link[]) {
    return new Promise(async (resolve, reject) => {

        // Preparation 
        // Displays an 'ActivityIndicator'
        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: true }))
        const { page_number, account_id } = page
        console.log(`\ninfoType: ${infoType}, \nValue : ${JSON.stringify(value)}`)
        // console.log(`\ndispatch : ${dispatch},  \nusername: ${username}, \npassword: ${password}, \nlinks: ${links}`)






        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                reject(getErrorDescription(error).message)
                dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
                return
            }
        }






        // Step 1 : Check
        switch (infoType) {
            // A
            case 'website_link':


                let linkUrl = (value as Link).url.trim()


                switch (linkUrl === '') {
                    case true: console.log("Step 1 not needed (User wants to remove the link)"); break
                    case false:
                        try {
                            await checkLinkValidity(linkUrl)
                        } catch (error) {
                            reject(error)
                            return
                        }
                }


                console.log("Step 1.A OK")
                break

            // B
            case 'username':

            
                try {
                    const accountMainDataAttributes = await getAccountMainDataAttributesByUsername(value.toLowerCase().trim(), "account_id")
                    const account_id = accountMainDataAttributes?.account_id ?? ""
                    if (account_id !== "") {
                        reject('Username already in use by another account.')
                        return
                    }
                } catch (error) {
                    reject(getErrorDescription(error))
                    return
                }


                console.log("Step 1.B OK")
                break

            // 
            default: console.log("Step 1 not needed")

        }



        // Step 2 : Sign in




        // Prepare update 
        let attribute: any = infoType
        let newValue: any = value
        switch (infoType as InformationType) {
            case 'website_link':

                // Index
                let index = links?.findIndex(e => { return e.name === value.name })
                let newLink = LinkObj(value.name.trim(), value.url.trim().toLowerCase())

                switch (index) {
                    /**  add the link to the array if not already part of it  
                        --> updates the entire 'links' array when a link is added.
                    */
                    case -1:
                        attribute = 'links'
                        newValue = links.concat([newLink])
                        break

                    default:
                        attribute = `links[${index}]`
                        newValue = newLink
                        break
                }
                break

            case 'username': newValue = newValue.trim().toLowerCase(); break
            case 'account_name': newValue = newValue.trim(); break
            case 'timetables': if (newValue === undefined) newValue = {}; break
        }
        const payload = { page_number: page_number, attribute: attribute, newValue: newValue }
        console.log('\n----> Payload : ' + JSON.stringify(payload))



        // Step 3.1 : dynamoDB
        //   Step 3.1.A : AccountMainData 
        //   Step 3.1.B : Profile 
        let updateProfileUi = false
        try {
            switch (attribute as keyof AccountMainData) {
                case 'account_name':
                case 'account_type':
                case 'geolocation':
                case 'username':
                    const outputA = await updateAccountMainData(account_id, attribute, newValue, jwtToken)
                    console.log('Step 3.1.A OK' + ` (${JSON.stringify(attribute)}, with value : ${JSON.stringify(newValue)})`)
                    if ((attribute as keyof AccountMainData) === "account_name") {
                        const searchName = stringInSearchQueryFormat(newValue as string)
                        const outputA = await updateAccountMainData(account_id, "search_name", searchName, jwtToken)
                        console.log('Step 3.1.A" OK' + ` ("search_name", with value : "${searchName}")`)
                    }
                    break

                default:
                    const ouputB = await updateProfile(account_id, attribute, newValue, jwtToken)
                    updateProfileUi = true
                    console.log('Step 3.1.B OK' + ` (${JSON.stringify(attribute)}, with value : ${JSON.stringify(newValue)})`)
                    break

            }
        } catch (error) {
            reject(getErrorDescription(error).message)
            return
        }



        // Step 3.2 : user pool 
        let userPoolAttribute: UserAttribute
        let userPoolValue: any = newValue
        switch (attribute) {
            case 'phoneNumber':
                userPoolAttribute = 'phone_number'
                userPoolValue = getPhoneNumberDescription(newValue)
                break
            case 'username': userPoolAttribute = 'preferred_username'; break
            default: break
        }
        switch (userPoolAttribute) {
            // case 'email': Email not updated via this function 
            case 'phone_number':
            case 'preferred_username':

                try {
                    const result = await updateUserPoolAttribute(userPoolAttribute, userPoolValue)
                } catch (error) {
                    reject(getErrorDescription(error))
                    return
                }

                console.log('Step 3.2 OK' + `(${JSON.stringify(userPoolAttribute)} with userPoolValue: ${userPoolValue})`)
                break

            default: console.log('Step 3.2 not needed'); break
        }



        // Step 3.3 : UI
        //    Step 3.3.A : AccountMainData
        //    Step 3.3.B : Profile
        switch (updateProfileUi) {
            case false: dispatch(updateAccountMainDataValue(payload)); console.log('Step 3.3.A OK'); break
            case true: dispatch(updateProfileValue(payload)); console.log('Step 3.3.B OK'); break
        }



        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
        resolve('Successfully updated')


    })

}







// Server
/**  
  - 2 - Check email availability
  - 3 - Update user's email on Userpool
  - 4 - Change value on it's profile 
  - 5 - Open confirmation code input view 
*/
export function updateEmailAttribute(dispatch: Dispatch<AnyAction>, page: Page, newEmail: string, username: string, jwtTokenWasRefreshed: boolean, navigation: any) {
    return new Promise(async (resolve, reject) => {


        // Preparation 
        // Displays 'ActivityIndicator'
        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: true }))
        const { page_number, account_id } = page
        console.log(`\nnewEmailValue: ${newEmail}`)






        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                reject(getErrorDescription(error).message)
                return
            }
        }




        // 1 
        // Was deleted




        // Step 2 : Check 
        try {
            const result = await queryProfileByEmail(newEmail.toLowerCase().trim())
            if (result.Items.length > 0) {
                reject('Email address already in use by another account.')
                return
            }
            console.log('Step 2 OK')
        }
        catch (error) {
            reject(getErrorDescription(error))
            return
        }



        // Step 3 : Userpool
        try {
            await updateUserPoolAttribute('email', newEmail.trim().toLowerCase())
            console.log('Step 3 OK')
        } catch (error) {
            reject(getErrorDescription(error))
            return
        }



        // Step 4 : Profile
        try {
            await updateProfile(account_id, "email", newEmail.trim().toLowerCase(), jwtToken)
            console.log('Step 4 OK')
        } catch (error) {
            reject(getErrorDescription(error))
            return
        }



        // Step 5 : Ui
        dispatch(updateProfileValue({ page_number: page_number, attribute: 'email', newValue: newEmail.trim().toLowerCase() }))
        navigation.push('ConfirmationCodeInput', { username: username, newEmail: newEmail })
        console.log('Step 5 OK')


        setTimeout(() => {
            dispatch(updateUiStateValue({ attribute: 'updatedAppearance' as keyof UiStatesInterface, value: true }))
        }, 700)


        dispatch(updateUiStateValue({ attribute: 'isUpdatingInfo' as keyof UiStatesInterface, value: false }))
        resolve('Successfully updated') // --> errors 



    })
}







