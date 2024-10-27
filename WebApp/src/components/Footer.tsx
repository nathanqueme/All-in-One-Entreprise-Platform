

import React, { useEffect } from "react"
import '../styles/TextStyles.css'
import Colors from "../assets/Colors"
import localization from "../utils/localizations"
import { ChevronDownIcon } from '../components/Icons'





interface FooterInterface {
    setFooterHeight: (_: number) => any
}
/** 
 * Branding and additional resources 
 */
export default function Footer({ setFooterHeight }: FooterInterface) {


    // Values 
    let locale = localStorage.getItem("locale") ?? "fr"
    let originUrl = window.location.origin // e.g. : "https://atsight.ch"
    const supportedLanguages = {
        en: "English",
        fr: "Français"
    }


    // Initialization
    useEffect(() => {
        let height = getFooterHeight()
        setFooterHeight(height)
    }, [])


    /**
     * Returns the headers height.
    */
    function getFooterHeight() {

        let div = document.getElementById("footer")
        if (div === null) {
            return 78.5
        }
        const { height } = div.getBoundingClientRect()
        if (height === null || height === undefined) {
            return 78.5
        }

        return height
    }


    return (
        <footer id="footer">
            <div className={`w-screen px-5 py-5 leading-8 flex flex-col items-center justify-center`} style={{ backgroundColor: Colors.lightGray, textAlign: "center", minHeight: 100 }}>
                {/* Tabs */}
                <p className='' style={{ textAlign: "center" }}>
                    <FooterOption link={`https://about.atsight.ch`} text={localization.about}/>
                    {/* <FooterOption link={`${originUrl}/help/`} text={localization.help}/> */}
                    <FooterOption link={`https://about.atsight.ch/terms`} text={localization.terms}/>
                    <FooterOption link={`https://about.atsight.ch/privacy/`} text={localization.privacy}/>
                    <FooterOption link={`${originUrl}/`} text={"© 2022 AtSight"}/>
                </p>

                {/* Language selector */}
                <div className="relative top-0 left-0 right-0">
                    <div className='flex items-center'>
                        <div className='gray13'>{(supportedLanguages as any)[locale]}</div>
                        <div className='px-1'>
                            <ChevronDownIcon color={Colors.smallGrayText} />
                        </div>
                    </div>

                    <select className='cursor-pointer absolute top-0 left-0 gray13 opacity-0' value={locale} id="language-selector"
                        onChange={(event) => {

                            let value = event.target.value
                            localStorage.setItem("locale", value)
                            window.location.reload()

                        }}>
                        {Object.keys(supportedLanguages).map(locale => {
                            return (
                                <option key={locale} value={locale} onClick={() => { alert(locale) }}>{(supportedLanguages as any)[locale]}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
        </footer>
    )
}



interface FooterOptionInterface {
    link: string
    text: string
}
function FooterOption({ link, text }: FooterOptionInterface) {
    return (
        <a href={link} target="_blank" className='p-2 hover:text-stone-700 gray13'>{text}</a>
    )
}


