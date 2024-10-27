


// @ts-check
import './../App.css'
import React from 'react'
import { BackButton } from '../components/BackButton'
import TextStyles from './../styles/TextStyles.module.css'
import { GrayDescription, Section } from './../components/TextRelated'


function Terms() {
    return (
        <div className="App-header" style={{ backgroundColor: "white", paddingLeft: 40, paddingRight: 40, paddingTop: "14%", paddingBottom: "14%" }}>




            {/* Title */}
            <div style={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                <p className={TextStyles.headlineMedium} >{"TERMS OF USE"}</p>



                {/* Presentation */}
                <GrayDescription
                    text={"By downloading and using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app. You’re not allowed to copy or modify the app, any part of the app, or our trademarks in any way. You’re not allowed to attempt to extract the source code of the app. The app itself, and all the trademarks, copyright, database rights, and other intellectual property rights related to it, still belong to the creator of AtSight, Nathan Queme."}
                />




                {/* Poliy by section */}
                <Section
                    paddingTop={20}
                    title={"Terms and Conditions"}
                    text={"AtSight is committed to ensuring that the app is as useful and efficient as possible. For that reason, we reserve the right to make changes to the app or to charge for its services, at any time and for any reason. We will never charge you for the app or its services without making it very clear to you exactly what you’re paying for. The AtSight app stores and processes personal data that you have provided to us, to provide our Service. It’s your responsibility to keep your phone and access to the app secure. ilbreak or root your phone. You should be aware that there are certain things that AtSight will not take responsibility for. Certain functions of the app will require the app to have an active internet connection. The connection can be Wi-Fi or provided by your mobile network provider, but AtSight cannot take responsibility for the app not working at full functionality if you don’t have access to Wi-Fi, and you don’t have any of your data allowance left. If you’re using the app outside of an area with Wi-Fi, you should remember that the terms of the agreement with your mobile network provider will still apply. As a result, you may be charged by your mobile provider for the cost of data for the duration of the connection while accessing the app, or other third-party charges. In using the app, you’re accepting responsibility for any such charges, including roaming data charges if you use the app outside of your home territory (i.e. region or country) without turning off data roaming. If you are not the bill payer for the device on which you’re using the app, please be aware that we assume that you have received permission from the bill payer for using the app. Along the same lines, AtSight cannot always take responsibility for the way you use the app i.e. With respect to AtSight’s responsibility for your use of the app, when you’re using the app, it’s important to bear in mind that although we endeavor to ensure that it is updated and correct at all times, we do rely on third parties to provide information to us so that we can make it available to you. AtSight accepts no liability for any loss, direct or indirect, you experience as a result of relying wholly on this functionality of the app. At some point, we may wish to update the app. The app is currently available on Android & iOS – the requirements for the both systems(and for any additional systems we decide to extend the availability of the app to) may change, and you’ll need to download the updates if you want to keep using the app. AtSight does not promise that it will always update the app so that it is relevant to you and/or works with the Android & iOS version that you have installed on your device. However, you promise to always accept updates to the application when offered to you, We may also wish to stop providing the app, and may terminate use of it at any time without giving notice of termination to you. Unless we tell you otherwise, upon any termination, (a) the rights and licenses granted to you in these terms will end; (b) you must stop using the app, and (if needed) delete it from your device."}
                />
                <Section
                    paddingTop={2}
                    title={"Contact"}
                    text={"If you have any questions upon the Terms and Conditions, please contact atsight.app@gmail.com"}
                />



                {/* Business mention + date */}
                <GrayDescription
                    text={"We may update our Terms and Conditions from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Terms and Conditions on this page. These terms and conditions are effective as of 2022-06-08"}
                />








            </div>





            <BackButton />





        </div>
    )
}


export default Terms

