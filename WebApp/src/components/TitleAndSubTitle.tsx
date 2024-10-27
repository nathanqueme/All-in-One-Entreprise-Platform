import React from "react"
import TextStyles from "../styles/TextStyles"
import '../styles/TextStyles.css'




interface TitleAndSubTitleInterface {
    title: string
    subtitle: string
    descriptionButtonText?: string
    onClick?: () => any
    link?: string
}
/** 
   A large title and a gray explanation at its bottom.
   -> Used in account creation pages.
 */
export default function TitleAndSubTitle({ title, subtitle, descriptionButtonText, onClick = () => { }, link }: TitleAndSubTitleInterface) {

    let clickableLinkUi = <span className='blueTappableText whitespace-pre'>{" "}{descriptionButtonText}</span>

    return (
        <div>
            <p className='title' style={{ textAlign: "center" }}>{title}</p>
            <p className='pt-1 px-12 mx-4 text-center' style={TextStyles.gray13Text}>{subtitle}{
                descriptionButtonText ?
                    (link ?
                        <a href={link}>{clickableLinkUi}</a>
                        :
                        <button onClick={() => { onClick() }}>{clickableLinkUi}</button>
                    )
                    :
                    null
            }</p>
        </div>
    )
}

