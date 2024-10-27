import React from "react"
import { ColorsInterface } from "../../assets/Colors"
import { View } from 'react-native'
import { CameraSymbol } from "../Symbols"


interface CameraCircleInterface {
    widthAndHeight: number
    COLORS: ColorsInterface
}
export function CameraCircle({ widthAndHeight, COLORS } :CameraCircleInterface) {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: "center",
            width: widthAndHeight,
            height: widthAndHeight,
            borderColor: '#DDDCDD',
            borderRadius: widthAndHeight,
            borderWidth: 0.75,
            backgroundColor: COLORS.white,
        }}>
            <CameraSymbol
                size={32 * widthAndHeight / 80}
                color={COLORS.black}
            />
        </View>
    )
}