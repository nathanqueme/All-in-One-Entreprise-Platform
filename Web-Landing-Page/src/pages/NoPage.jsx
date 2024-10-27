


// @ts-check
import './../App.css'
import React from 'react'
import { BackButton } from '../components/BackButton'
import TextStyles from './../styles/TextStyles.module.css'


function Contact() {
    return (
        <div className="App-header" style={{ backgroundColor: "white", marginLeft: 40, marginRight: 40 }}>




            {/* Title */}
            <p style={{ fontSize: 24, fontWeight: "900", color: "gray", textAlign: "center" }}>{"NO PAGE FOUND"}</p>
            <p style={{ fontSize: 18, fontWeight: "500", color: "gray", textAlign: "center" }}>{"Sorry this page does not exists anymore, please go back on home screen. "}<a href="https://www.atsight.app" style={{ color: "#17A6FF" }}>{"Go back home"}</a></p>






        </div>
    )
}


export default Contact

