import React from "react"
import Colors from "../../assets/Colors"
import localization from "../../utils/localizations"
import TextStyles from "../../styles/TextStyles"
import { ClassicButton } from "../Buttons"
import { NoConnectionIcon } from "../Icons"




interface NoConnectionUiInterface {
    paddingTop?: number 
    onClick: () => any
}
/**
 * Displays a no connection symbol, ad description of the connection issue and a try again symbol.
 */
export default function NoConnectionUi({ paddingTop = 0, onClick }: NoConnectionUiInterface) {
    return (
        <div className='flex flex-col items-center justify-center' style={{ paddingTop: paddingTop }}>
            <NoConnectionIcon color={Colors.smallGrayText} size={"4em"} />
            <p className='text-center mx-5' style={Object.assign({}, TextStyles.noContentFont, { paddingTop: 10, marginBottom: 30 })}>{localization.please_confirm_that_you_have_an_internet_connection}</p>
            <ClassicButton
                onClick={() => {
                    onClick()
                }}
                text={localization.try_again}
                backgroundColor={Colors.darkBlue}
                textColor={"white"}
                smallAppearance
            />
        </div>
    )
}