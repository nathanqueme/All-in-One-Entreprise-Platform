
// @ts-check
import React from "react"
import { Link } from "react-router-dom"
import TextStyles from './../styles/TextStyles.module.css'
import LinkSeperator from './../components/LinkSeperator'
import { Logo } from "./Logo"


/** 
 * Branding and additional resources 
 */
function Footer() {
    return (
        <div style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            paddingTop: 15,
            paddingBottom: 15,
            backgroundColor: "#F8F8F8" // whiteGray
        }}>



       



            {/*  Copyright © 2022 atSight Inc. All rights reserved. */}
         
            <p
                className={TextStyles.grayText}
                style={{ lineHeight: 0.5 }}
            >atSight app 2022</p>
         




            <div
                style={{
                    textAlign: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    display: "inline-block",
                }}>


                <Link to={"/contact"}>
                    <p
                        className={TextStyles.link}
                        style={{ display: "inline-block" }}
                    >Contact</p>
                </Link>



                <LinkSeperator />



                <Link to={"/terms"}>
                    <p
                        className={TextStyles.link}
                        style={{ display: "inline-block" }}
                    >Terms of Use</p>
                </Link>



                <LinkSeperator />


                <Link to={"/privacy"}>
                    <p
                        className={TextStyles.link}
                        style={{ display: "inline-block" }}
                    >Privacy policy</p>
                </Link>


            </div>

        </div>

    )
}


export default Footer