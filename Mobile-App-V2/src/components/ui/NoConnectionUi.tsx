import React from "react"
import localization from "../../utils/localizations"
import { ColorsInterface } from "../../assets/Colors"
import { View, Text } from "react-native"
import { ClassicButton } from "../Buttons"
import { NoConnectionSymbol } from "../Symbols"
import { TextStylesInterface } from "../styles/TextStyles"



interface NoConnectionUiInterface {
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * Displays a no connection symbol, ad description of the connection issue and a try again symbol.
 */
export default function NoConnectionUi({ onPress, COLORS, TEXT_STYLES }: NoConnectionUiInterface) {
    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <NoConnectionSymbol color={COLORS.smallGrayText} size={70} />
            <Text style={[TEXT_STYLES.noContentFont, { paddingHorizontal: 40, textAlign: 'center', paddingTop: 10 }]}>{localization.please_confirm_that_you_have_an_internet_connection}</Text>
            <ClassicButton
                TEXT_STYLES={TEXT_STYLES}
                COLORS={COLORS}
                onPress={() => {
                    onPress()
                }}
                text={localization.try_again}
                backgroundColor={COLORS.darkBlue}
                textColor={"white"}
                topMargin={30}
                smallAppearance
            />
        </View>
    )
}


