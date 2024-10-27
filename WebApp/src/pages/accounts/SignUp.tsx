import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import '../../styles/TextStyles.css'
import Colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import TitleAndSubTitle from '../../components/TitleAndSubTitle'
import SelectedCircle from '../../components/SelectedCircle'
import RedError from '../../components/RedError'
import CountryAndCallingCode from '../../components/CountryAndCallingCode'
import CirclePhoto from '../../components/CirclePhoto'
import CountrySelector from '../../components/selectors/CountrySelector'
import TextStyles from '../../styles/TextStyles'
import { ClassicButton } from '../../components/Buttons'
import { Dispatch } from 'react'
import { SetStateAction } from 'react'
import { accountTypeDescritpions } from '../../utils/typesLocalizations'
import { EyeIcon, ArrowUpDownIcon, XMarkCircleIcon } from '../../components/Icons'
import { ParentDivId } from '../../Types'
import { getMainDivMinHeight, isMobileHook } from '../../components/functions'


const isMobile = isMobileHook()



type AccountCreationStep =
    "account_type" |
    "email" |
    "confirmation_code" |
    "password" |
    "address" |
    "phone_number" |
    "account_name" |
    "username" |
    "main_photo"



interface SignUpInterface {
    footerHeight: number
}
/** 
  * Account creation (Sign up) steps : 
  * 1 : Account type
  * 2 : Email address
  * 3 : Confirmation code
  * 4 : Password
  * 5 : Address
  * 6 : Account name (place's name)
  * 7 : Username
  * 8 : Phone number 
  * 9 : Page main photo (Main photo displayed on the page of the place, can be their logo or a photo of their store) 
 */
export default function SignUp({ footerHeight }: SignUpInterface) {


    // Step 1 values 
    const account_types = [
        {
            account_type: "hotel",
            description: accountTypeDescritpions.hotel,
        },
        {
            account_type: "palace",
            description: accountTypeDescritpions.palace,
        },
    ]


    // States 
    // Step 1  
    const [accountType, setAccountType] = useState(account_types[0].account_type)
    // Step 2 
    const [email, setEmail] = useState("")
    // Step 3 
    const [code, setCode] = useState("")
    // Step 4 
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    // Step 5 
    const [street, setStreet] = useState("")
    const [city, setCity] = useState("")
    const [country_name, setCountryName] = useState("")
    const [country_code, setCountryCode] = useState("")
    const [showCountrySelector, setShowCountrySelector] = useState(false)
    // Step 6 
    const [name, setName] = useState("")
    // Step 7 
    const [username, setUsername] = useState("") // --> N.B. : the username can be the user's "email" or "preferred_username" 
    // Step 8  
    const [showCallingCodesSelector, setShowCallingCodesSelector] = useState(false)
    const [calling_code, setCallingCode] = useState('33')
    const [calling_country_code, setCallingCountryCode] = useState('FR')
    const [number, setNumber] = useState('')
    // Step 9 
    const [imageUri, setImageUri] = useState("")
    // 
    const [step, setStep]: [AccountCreationStep, Dispatch<SetStateAction<AccountCreationStep>>] = useState("account_type" as AccountCreationStep)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)


    // Values 
    let originUrl = window.location.origin // e.g. : "https://atsight.ch"
    let metadataFilledStep2 = (email !== "")
    let metadataFilledStep3 = (code.length >= 6)
    let metadataFilledStep4 = (password.length >= 6)
    let metadataFilledStep5 = (street !== "" && city !== "" && country_code !== "" && country_name !== "")
    let metadataFilledStep6 = (name !== "")
    let metadataFilledStep7 = (username !== "")
    let metadataFilledStep8 = (number !== '')


    async function logInUser() {



    }


    function step1To2() {
        setStep("email")
    }

    function step2To3() {
        setStep("confirmation_code")
    }

    function step3To4() {
        setStep("password")
    }

    function step4To5() {
        setStep("address")
    }

    function step5To6() {
        setStep("account_name")
    }

    function step6To7() {
        setStep("username")
    }

    function step7To8() {
        setStep("phone_number")
    }

    function step8To9() {
        setStep("main_photo")
    }

    function createAccount() {

    }










    return (
        <div id={"SignUpPageDiv" as ParentDivId} className='bg-white flex flex-col items-center justify-start' style={{
            minHeight: getMainDivMinHeight()
        }}>
            {
                (() => {
                    switch (step) {
                        // Step 1 
                        case "account_type": return (
                            <div className='bg-white flex flex-col items-center justify-start'>
                                {/* Gray cell on Web */}
                                <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 w-96`}>
                                    <div className='flex py-10'>
                                        <TitleAndSubTitle title={localization.account_type} subtitle={localization.select_account_type} />
                                    </div>

                                    {/* Account types */}
                                    <div className='flex flex-col mb-5'>
                                        {account_types.map((item) => {
                                            return (
                                                <SelectableItemUI key={item.account_type} account_type={item.account_type} description={item.description} selectedType={accountType} onClick={() => { setAccountType(item.account_type) }} />
                                            )
                                        })
                                        }
                                    </div>

                                    {/* Next button */}
                                    <ClassicButton
                                        onClick={() => { step1To2() }}
                                        text={localization.next}
                                        backgroundColor={Colors.darkBlue}
                                        textColor={"white"}
                                        isLoading={isLoading}
                                    />
                                </div>

                                {/* Already have an account ? sign in */}
                                <div className={`flex flex-col items-center justify-center w-96 ${isMobile ? "" : "border-2 my-5"} rounded mx-5`}>
                                    <p className='py-5 text-center'>{localization.already_have_an_account}{
                                        <a href={originUrl + "/accounts/sign_in/"} className='blueTappableText whitespace-pre'>{" "}{localization.sign_in}.</a>
                                    }</p>
                                </div>
                            </div>
                        )
                        // Step 2
                        case "email": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.email_address} subtitle={localization.email_input_description} />
                                </div>

                                {/* Email input */}
                                <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
                                    <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                                        autoComplete='off'
                                        spellCheck={false}
                                        style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                        type='email'
                                        placeholder={localization.email_address}
                                        value={email}
                                        onChange={event => { setEmail(event.target.value) }}
                                    />
                                </div>

                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step2To3() }}
                                    condition={metadataFilledStep2}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />
                            </div>
                        )
                        // Step 3
                        case "confirmation_code": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle
                                        title={localization.confirmation_code}
                                        subtitle={localization.formatString(localization.enter_code_sent_to, email) as string}
                                        descriptionButtonText={localization.resend_code}
                                        onClick={() => { }}
                                    />
                                </div>

                                {/* Code input */}
                                <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
                                    <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                                        autoComplete='off'
                                        spellCheck={false}
                                        style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                        type='text'
                                        placeholder={localization.code}
                                        value={code}
                                        onChange={event => { setCode(event.target.value) }}
                                    />
                                </div>


                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step3To4() }}
                                    condition={metadataFilledStep3}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />

                                {/* Change Email */}
                                <div className='py-2 mt-5'>
                                    <button onClick={() => {
                                        setStep("email")
                                    }}>
                                        <p
                                            className='blueTappableText px-16 py-3' // px-16 and p-2 makes it easier to touch 
                                        >{localization.change_email_address}</p>
                                    </button>
                                </div>

                            </div>
                        )
                        // Step 4
                        case "password": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle
                                        title={localization.password}
                                        subtitle={localization.password_input_description}
                                    />
                                </div>


                                {/* Password input */}
                                <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
                                    <div className='flex items-center justify-between'>
                                        <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none flex-grow'
                                            autoComplete='off'
                                            spellCheck={false}
                                            style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={localization.password}
                                            value={password}
                                            onChange={event => { setPassword(event.target.value) }}
                                        />
                                        {/* Show password button */}
                                        <button className='pr-4 hover:opacity-70' onClick={() => { setShowPassword(!showPassword) }}>
                                            <EyeIcon color={Colors.smallGrayText} size={"1.4em"} striked={!showPassword} />
                                        </button>
                                    </div>
                                </div>




                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }


                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step4To5() }}
                                    condition={metadataFilledStep4}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />


                            </div>
                        )
                        // Step 5
                        case "address": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.address} subtitle={localization.address_input_description} />
                                </div>

                                {/* Multiple inputs (Street + city) */}
                                <div className='grayInputContainer mb-3' style={{ backgroundColor: Colors.lightGray }}>
                                    <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none'
                                        autoComplete='off'
                                        autoCapitalize='words'
                                        spellCheck={false}
                                        style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                        type='text'
                                        placeholder={localization.street}
                                        value={street}
                                        onChange={event => { setStreet(event.target.value) }}
                                    />
                                    <div className='bg-white h-1' />
                                    <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none flex-grow'
                                        autoComplete='off'
                                        autoCapitalize='words'
                                        spellCheck={false}
                                        style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                        type='text'
                                        placeholder={localization.city}
                                        value={city}
                                        onChange={event => { setCity(event.target.value) }}
                                    />
                                </div>

                                <div className='grayInputContainer mb-5' style={{ backgroundColor: Colors.lightGray }}>
                                    <button onClick={() => { setShowCountrySelector(true) }}>
                                        <div className='flex items-center justify-between'>
                                            <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none cursor-pointer pointer-events-none'
                                                style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                                placeholder={localization.country}
                                                type='text'
                                                value={country_name}
                                            />
                                            {/* Icon */}
                                            <div className='pr-4'>
                                                <ArrowUpDownIcon color={Colors.smallGrayText} size={"1.1em"} />
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step5To6() }}
                                    condition={metadataFilledStep5}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />

                                <CountrySelector
                                    displayCallingCodes={false}
                                    showSelector={showCountrySelector}
                                    setShowSelector={setShowCountrySelector}
                                    handleSelection={(Country) => {
                                        setCountryName(Country.name)
                                        setCountryCode(Country.country_code)
                                        setShowCountrySelector(false)
                                    }}
                                />
                            </div>
                        )
                        // Step 6
                        case "account_name": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.name} subtitle={localization.name_input_description} />
                                </div>

                                {/* Account name input */}
                                <div className='grayInputContainer mb-3' style={{ backgroundColor: Colors.lightGray }}>
                                    <div className='flex items-center justify-between'>
                                        <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none cursor-pointer flex-grow'
                                            autoComplete='off'
                                            autoCapitalize='words'
                                            spellCheck={false}
                                            style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                            type='text'
                                            placeholder={localization.name}
                                            value={name}
                                            onChange={event => { setName(event.target.value) }}
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step6To7() }}
                                    condition={metadataFilledStep6}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />
                            </div>
                        )
                        // Step 7
                        case "username": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.username} subtitle={localization.username_input_description} />
                                </div>

                                {/* Username input */}
                                <div className='grayInputContainer mb-3' style={{ backgroundColor: Colors.lightGray }}>
                                    <div className='flex items-center justify-between'>
                                        <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none cursor-pointer flex-grow'
                                            autoComplete='off'
                                            autoCapitalize='words'
                                            spellCheck={false}
                                            style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                            type='text'
                                            placeholder={localization.username}
                                            value={username}
                                            onChange={event => { setUsername(event.target.value) }}
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step7To8() }}
                                    condition={metadataFilledStep7}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />
                            </div>
                        )
                        // Step 8
                        case "phone_number": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.phone_number} subtitle={localization.phone_input_description} />
                                </div>

                                {/* Phone number input */}
                                <div className='grayInputContainer mb-3' style={{ backgroundColor: Colors.lightGray }}>
                                    <div className='flex items-center justify-between'>
                                        <CountryAndCallingCode
                                            country_code={calling_country_code}
                                            calling_code={calling_code}
                                            onClick={() => { setShowCallingCodesSelector(true) }}
                                        />
                                        <input className='h-12 px-4 bg-transparent rounded-xl outline-none border-none flex-grow'
                                            autoComplete='off'
                                            autoCapitalize='words'
                                            spellCheck={false}
                                            style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}
                                            type='text'
                                            placeholder={localization.phone_number}
                                            value={number}
                                            onChange={event => { setNumber(event.target.value) }}
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {(error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { step8To9() }}
                                    condition={metadataFilledStep8}
                                    text={localization.next}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />


                                <CountrySelector
                                    displayCallingCodes
                                    showSelector={showCallingCodesSelector}
                                    setShowSelector={setShowCallingCodesSelector}
                                    handleSelection={(Country) => {
                                        setCallingCode(Country.country_code)
                                        setCallingCountryCode(Country.calling_code)
                                        setShowCallingCodesSelector(false)
                                    }}
                                />

                            </div>
                        )
                        // Step 9
                        case "main_photo": return (
                            <div className={`bg-white flex flex-col items-center justify-center border-${isMobile ? "0" : "2"} rounded pb-10 mt-10 mb-10 w-96`}>
                                <div className='flex py-10'>
                                    <TitleAndSubTitle title={localization.profile_photo} subtitle={localization.photo_input_description} />
                                </div>

                                <div className='pb-10'>
                                    <input
                                        className='overflow-hidden absolute pointer-events-none opacity-0' style={{ height: 0.1, width: 0.1 }} // Hidden input as it can not be styled 
                                        type="file"
                                        id="notStylableFileInput"
                                        onChange={(event) => {
                                            // https://stackoverflow.com/a/43992687
                                            if (event.target.files && event.target.files[0]) {
                                                let uri = URL.createObjectURL(event.target.files[0])
                                                setImageUri(uri)
                                            }
                                        }}
                                        accept=".png, .jpg, .jpeg"
                                    />
                                    {/* Opens file selector on click */}
                                    <div className='relative'>
                                        <label htmlFor="notStylableFileInput">
                                            <div className='cursor-pointer active:brightness-95'>
                                                <CirclePhoto
                                                    src={imageUri}
                                                    widthAndHeight={100}
                                                />
                                            </div>
                                        </label>

                                        {(imageUri !== "") &&
                                            <button onClick={() => { setImageUri("") }}>
                                                <div className='absolute top-0 right-0 bg-white rounded-full' style={{ padding: "1.6px" }}>
                                                    <XMarkCircleIcon size={"1.7em"} color={Colors.smallGrayText} />
                                                </div>
                                            </button>
                                        }
                                    </div>
                                </div>

                                {/* Error */}
                                {
                                    (error !== "") &&
                                    <RedError error={error} marginTop={20} />
                                }

                                {/* Next button */}
                                <ClassicButton
                                    onClick={() => { createAccount() }}
                                    text={localization.done}
                                    backgroundColor={Colors.darkBlue}
                                    textColor={"white"}
                                    isLoading={isLoading}
                                />
                            </div>
                        )
                    }
                })()
            }

        </div >
    )
}








// Step 1 component
interface SelectableItemUiInterface {
    account_type: string
    description: string
    selectedType: string
    onClick: () => any
}
function SelectableItemUI({ account_type, description, selectedType, onClick }: SelectableItemUiInterface) {
    return (
        <button key={account_type} onClick={() => { onClick() }}>
            <div className='flex w-72 justify-between h-12 items-center'>
                <p style={Object.assign({}, TextStyles.calloutMedium, { color: Colors.black })}>{description}</p>
                <SelectedCircle isSelected={account_type === selectedType} />
            </div>
        </button >
    )
}
