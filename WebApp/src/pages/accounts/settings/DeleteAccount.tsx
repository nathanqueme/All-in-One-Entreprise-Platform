import React, { useState } from 'react'
import localization from '../../../utils/localizations'
import Colors from '../../../assets/Colors'
import TextStyles from '../../../styles/TextStyles'
import Divider from '../../../components/Divider'
import { ClassicButton } from '../../../components/Buttons'




export default function DeleteAccount({ }) {

    // States 
    const [accountDeletionRequested, setAccountDeletionRequested] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)


    function requestAccountDeletion() {
        setAccountDeletionRequested(true)
    }


    function deletAccountAndItsContent() {
        setIsDeletingAccount(true)
    }




    if (!accountDeletionRequested) {
        return (
            <div className='flex flex-col items-start justify-center'>
                <p className='title'>{localization.sure_want_delete_account}</p>

                <p className='mb-10 max-w-md whitespace-pre-wrap' style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}>{localization.deleting_account_will}</p>


                <ClassicButton
                    onClick={() => { requestAccountDeletion() }}
                    text={localization.delete}
                    backgroundColor={Colors.darkBlue}
                    textColor={"white"}
                    smallAppearance
                />
            </div>
        )
    } else {
        return (
            <div className='flex flex-col items-start justify-center'>

                {/* Explanation */}
                <p className='gray13 max-w-lg'>{localization.if_sure_delete_account_enter}</p>

                {/* Email address */}
                <div className='flex justify-start mt-5'>
                    <label className='self-center' style={Object.assign({}, TextStyles.calloutMedium, { width: 140, marginRight: 26, color: Colors.black })}>{localization.email_address_or_username}</label>
                    <input className='h-8 rounded'
                        style={{ color: Colors.black, borderWidth: 1.5, width: 340, paddingLeft: 10, paddingRight: 10 }}
                        type='text'
                        placeholder={localization.email_address_or_username}
                        value={username}
                        onChange={event => { setUsername(event.target.value) }}
                    />
                </div>
                <div className='flex justify-start mt-5'>
                    <label className='self-center' style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black, width: 140, marginRight: 26 })}>{localization.password}</label>
                    <input className='h-8 rounded'
                        style={{ color: Colors.black, borderWidth: 1.5, width: 340, paddingLeft: 10, paddingRight: 10 }}
                        type='text'
                        placeholder={localization.password}
                        value={password}
                        onChange={event => { setPassword(event.target.value) }}
                    />
                </div>



                <Divider marginTop={26} marginBottom={26} />


                <ClassicButton
                    onClick={() => { deletAccountAndItsContent() }}
                    text={localization.next}
                    backgroundColor={Colors.darkBlue}
                    textColor={"white"}
                    isLoading={isDeletingAccount}
                    smallAppearance
                />


            </div>
        )
    }
}



