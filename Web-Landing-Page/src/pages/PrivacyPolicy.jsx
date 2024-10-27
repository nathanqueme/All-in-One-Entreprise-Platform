


// @ts-check
import './../App.css'
import React from 'react'
import { BackButton } from '../components/BackButton'
import TextStyles from './../styles/TextStyles.module.css'
import { GrayDescription, Section } from './../components/TextRelated'


function PrivacyPolicy() {
    return (
        <div className="App-header" style={{ backgroundColor: "white", paddingLeft: 40, paddingRight: 40, paddingTop: "14%", paddingBottom: "14%" }}>




            {/* Title */}
            <div style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                <p className={TextStyles.headlineMedium} >{"PRIVACY POLICY"}</p>


                {/* Presentation */}
                <GrayDescription
                    text={"Nathan Queme built the AtSight app as a free to use app. This SERVICE is provided by Nathan Queme at no cost and is intended for use as is. This page is used to inform visitors regarding my policies with the collection, use, and disclosure of Personal Information if anyone decided to use my Service. If you choose to use my Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that I collect is used for providing and improving the Service. I will not use or share your information with anyone except as described in this Privacy Policy. The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible at www.atsight.app/terms unless otherwise defined in this Privacy Policy."}
                />




                {/* Poliy by section */}
                <Section
                    paddingTop={20}
                    title={"Information Collection and Use For a better experience."}
                    text={"While using our Service, I may require you to provide us with certain personally identifiable information, including but not limited to email address, address and phone number. The information that I request is used to let your personalize your experience, manage your account and improve security. Note that collected information is not shared with any third parties."}
                />
                <Section
                    paddingTop={2}
                    title={"Log Data"}
                    text={"I want to inform you that whenever you use my Service, in a case of an error in the app I collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing my Service, the time and date of your use of the Service, and other statistics. This log data is used to improve and maintain the service."}
                />
                <Section
                    paddingTop={2}
                    title={"Cookies"}
                    text={"Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory. This Service does not use these “cookies” explicitly. However, the app may use third-party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service."}
                />
                <Section
                    paddingTop={2}
                    title={"Service Providers"}
                    text={"Part of the application uses open source libraries and the technology of a third party to facilitate our Service, improve its security and make it more accessible."}
                />
                <Section
                    paddingTop={2}
                    title={"Security"}
                    text={"I value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is completely secure and reliable, and I cannot guarantee its absolute security. This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by me. Therefore, I strongly advise you to review the Privacy Policy of these websites. I have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services."}
                />
                <Section
                    paddingTop={2}
                    title={"Children’s Privacy"}
                    text={"I do not knowingly collect personally identifiable information from children. I encourage all children to never submit any personally identifiable information through the Application and/or Services. I encourage parents and legal guardians to monitor their children's Internet usage and to help enforce this Policy by instructing their children never to provide personally identifiable information through the Application without their permission. If you have reason to believe that a child has provided personally identifiable information to us through the Application, please contact us. You must also be at least 16 years of age to consent to the processing of your personally identifiable information in your country (in some countries we may allow your parent or guardian to do so on your behalf)."}
                />
                <Section
                    paddingTop={2}
                    title={"Contact"}
                    text={"If you have any questions upon the Privacy Policy, please contact atsight.app@gmail.com"}
                />



                {/* Business mention + date */}
                <GrayDescription
                    text={"This policy is effective as of 2022-06-08. \nNote that the AtSight application is subject to change therefore the privacy policy may be updated in the future."}
                />



            </div>




            <BackButton />





        </div>
    )
}








export default PrivacyPolicy

