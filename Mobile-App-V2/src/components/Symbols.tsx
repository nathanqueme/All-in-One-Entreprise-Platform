//
//  Symbols.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React from 'react'
import Octicons from 'react-native-vector-icons/Octicons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import SymbolTapGesturesFacilitator from './TapGesturesFacilitators'
import { View, Pressable } from 'react-native'



export function SearchSymbol({ COLORS, size = 22, color = COLORS.smallGrayText }) {
    return (
        <Ionicons name="search" size={size} color={color} />
    )
}



export function CameraSymbol({ size = 22, color = "white" }) {
    return (
        <Feather name="camera" size={size} color={color} />
    )
}



export function ArrowUpAndDownSymbol() {
    return (
        <View style={{ transform: [{ rotate: "90deg" }] }}>
            <Octicons name="arrow-switch" size={14} color={'gray'} />
        </View>
    )
}


export function CertificationBadge({ COLORS, small = false }) {
    return (
        <MaterialCommunityIcons name="check-decagram" size={small ? 14 : 16} color={COLORS.darkBlue} />
    )
}


export function ChevronSymbol({ color = 'gray', size = 18, left = false }) {
    return (
        <Octicons name={`chevron-${left ? "left":"right"}`} size={size} color={color} />
    )
}



export function ChevronRightFatSymbol({ color = 'gray' }) {
    return (
        <Octicons name="chevron-right" size={15} color={color} />
    )
}



export function EllipsisSymbol({ COLORS, size = 20, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 5 + 25 * 0.3}
            content={
                <Ionicons name="ellipsis-horizontal" size={size} color={color} />
            }
        />
    )
}


export function CategorySymbol({ COLORS, color = COLORS.black, size = 26 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={25 + 25 * 0.3}
            content={
                <Ionicons name="copy-outline" size={size} color={color} />
            }
        />
    )
}




export function ChevronLargeSymbol({ COLORS, handleCloseView, hide = false }) {
    return (
        <View style={{
            paddingHorizontal: 20,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'flex-start',
        }}>
            <Pressable onPress={handleCloseView} disabled={hide} style={{ opacity: hide ? 0 : 1 }}>
                <SymbolTapGesturesFacilitator
                    widthAndHeight={35 + 35 * 0.15}
                    content={
                        <Feather name="chevron-left" size={35} color={COLORS.black} />
                    } />
            </Pressable>
        </View>

    )
}


export function MenuSymbol({ COLORS, size = 23 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size * 0.4}
            content={
                <Feather name="menu" size={size} color={COLORS.black} />
            }
        />
    )
}


export function XMarkSymbol({ COLORS, color = COLORS.black, size = 28 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 12}
            content={
                <AntDesign name="close" size={size} color={color} />
            }
        />
    )
}


export function WebsiteSymbol({ COLORS, size = 26, color =  COLORS.black  }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={26 + 13}
            content={
                <MaterialCommunityIcons name="web" size={size} color={color} />
            }
        />
    )
}




export function HandDragSymbol({ COLORS, size = 26, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={26 + 13}
            content={
                <Entypo name="hand" size={size} color={color} />
            }
        />
    )
}






export function MapPinSymbol({ COLORS, size = 24, color =  COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 15}
            content={
                <Feather name="map-pin" size={size} color={color} />
            }
        />
    )
}


export function PhoneSymbol({ COLORS, size = 25, color = COLORS.black }) {
    return (
        <Feather name="phone" size={size} color={color} />
    )
}


export function TextSymbol({ COLORS, size = 25, color =  COLORS.black }) {
    return (
        <MaterialIcons name="short-text" size={size} color={color} />
    )
}


export function EmailSymbol({ COLORS, color = COLORS.black }) {
    return (
        <MaterialCommunityIcons name="email-outline" size={25} color={color} />
    )
}


export function PencilSymbol({ COLORS, color = COLORS.black, size = 23 }) {
    return (
        <Octicons name="pencil" size={size} color={color} />
    )
}


export function PersonSymbol({ COLORS, size = 28, color = COLORS.black }) {
    return (
        <View style={{
            marginLeft: -size * 0.1 // removes badly cropped space
        }}>
            <MaterialIcons name="person-outline" size={size} color={color} />
        </View>
    )
}


export function InfoCircleSymbol({ COLORS, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={23 + 13}
            content={
                <Octicons name='info' size={23} color={color} />
            }
        />
    )
}


export function PlusSymbol({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.4}
            content={
                <Feather name='plus' size={size} color={color} />
            }
        />
    )
}


export function OrderedListSymbol({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.4}
            content={
                <Octicons name='list-ordered' size={size} color={color} />
            }
        />
    )
}


export function SelectableList({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.4}
            content={
                <Ionicons name='list' size={size} color={color} />
            }
        />
    )
}



export function PlusSquareSymbol({ COLORS, size = 24, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={24 + 13}
            content={
                <Feather name='plus-square' size={size} color={color} />
            }
        />
    )
}




export function ReorderSymbol({ COLORS, size = 24, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={24 + 13}
            content={
                <Ionicons name='reorder-two-outline' size={size} color={color} />
            }
        />
    )
}




export function SettingsSymbol({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.4}
            content={
                <Feather name='settings' size={size} color={color} />
            }
        />
    )
}


export function QRCodeSymbol({ COLORS, size = 25, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.4}
            content={
                <MaterialIcons name='qr-code' size={size} color={color} />
            }
        />
    )
}


export function LanguageSymbol({ COLORS, color = COLORS.black, size = 23 }) {
    return (
        <Ionicons name='language' size={size} color={color} />
    )
}


export function LogOut({ COLORS }) {
    return (
        <Feather name='log-out' size={23} color={COLORS.black} />
    )
}


export function ArrowUpRight({ COLORS, size = 23 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + size * 0.15}
            content={
                <View style={{
                    marginLeft: -size * 0.1 // removes badly cropped space
                }}>
                    <MaterialCommunityIcons name='arrow-top-right' size={size} color={COLORS.black} />
                </View>
            } />
    )
}


export function FlashlightSymbol({ color }) {
    return (
        <Ionicons name='ios-flashlight-outline' size={28} color={color} />
    )
}


export function CheckMarkCircleSymbol({ size = 26, color }) {
    return (
        <AntDesign name='checkcircleo' size={size} color={color} />
    )
}




export function ExclamationMarkCircleSymbol({ size = 26, color }) {
    return (
        <AntDesign name='exclamationcircleo' size={size} color={color} />
    )
}



export function NoConnectionSymbol({ size = 22, color }) {
    return (
        <Feather name='wifi-off' size={size} color={color} />
    )
}



export function ClockSymbol({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 13}
            content={
                <Octicons name='clock' size={size} color={color} />
            }
        />
    )
}


export function AnalyticsSymbol({ COLORS, size = 23, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
        widthAndHeight={size + 5}
        content={
            <MaterialIcons name={'show-chart'} size={size} color={color} />
        }
    />
    )
}


export function PdfSymbol({ COLORS, size = 23, color = COLORS.black }) {
    {/*  <MaterialCommunityIcons name={'text-box-outline'} size={size} color={COLORS} /> */ }
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 5}
            content={
                <Feather name={'file-text'} size={size} color={color} />
            }
        />
    )
}



export function MapSymbol({ COLORS, size = 23 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={size + 5}
            content={
                <MaterialCommunityIcons name={'map-outline'} size={size} color={COLORS.black} />
            }
        />
    )
}


export function ChevronLeftSymbol({ COLORS, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={35}
            content={
                <Octicons name="chevron-left" size={30} color={color} />
            }
        />
    )
}


export function TriangleBottomSymbol({ COLORS, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={14}
            content={
                <View style={{ transform: [{ rotate: "180deg" }] }}>
                    <Ionicons name="triangle" size={10} color={color} />
                </View>
            }
        />
    )
}





export function TrashSymbol({ COLORS, color = COLORS.black }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={26}
            content={
                <Ionicons name="trash-outline" size={24} color={color} />
            }
        />
    )
}



export function PhotoSymbol({ COLORS, color = COLORS.smallGrayText, size = 24 }) {
    return (

        <Ionicons
            name="image-outline"
            size={size}
            color={color}
        />
    )
}



export function ReloadSymbol({ COLORS, color = COLORS.black, size = 24 }) {
    return (
        <AntDesign
            name="reload1"
            size={size}
            color={color}
        />
    )
}



export function ExclamationMarkCircle({ COLORS, color = COLORS.black, size = 24 }) {
    return (
        <AntDesign
            name="exclamationcircleo"
            size={size}
            color={color}
        />
    )
}


export function ExclamationMarkTriangleSymbol({ COLORS, color = COLORS.black, size = 24 }) {
    return (
        <Ionicons
            name="warning-outline"
            size={size}
            color={color}
        />
    )
}




export function EyeSymbol({ COLORS, color = COLORS.black, size = 24, outlined }) {
    return (
        <Ionicons
            name={outlined ? "ios-eye-off-outline" : "eye-outline"}
            size={size}
            color={color}
        />
    )
}


export function EraseCircle({ COLORS, color = COLORS.capsuleGray, size = 16 }) {
    return (
        <SymbolTapGesturesFacilitator
            widthAndHeight={30}
            content={
                <AntDesign name={"closecircle"} size={size} color={color} />
            } />
    )
}



export function ArrowBackSymbol({ COLORS, color = COLORS.black, size = 16 }) {
    return (
        <Octicons name="arrow-left" size={size} color={color} />
    )
}

