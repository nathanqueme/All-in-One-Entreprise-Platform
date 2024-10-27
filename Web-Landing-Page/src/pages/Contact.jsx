


// @ts-check
import './../App.css'
import React from 'react'
import { BackButton } from '../components/BackButton'
import TextStyles from './../styles/TextStyles.module.css'


function Contact() {
    return (
        <div className="App-header" style={{ backgroundColor: "white", paddingLeft: 40, paddingRight: 40 }}>




            {/* Title */}
            <p className={TextStyles.headlineMedium} >{"EMAIL US"}</p>
            <p style={{ fontSize: 18, fontWeight: "500", color: "gray", textAlign: "center" }}>{"For questions or technical support, please contact us at atsight.app@gmail.com"}</p>




            <BackButton />





        </div>
    )
}


export default Contact

