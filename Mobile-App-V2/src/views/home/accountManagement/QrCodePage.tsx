//
//  QrCodePage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useRef, useState, useEffect } from 'react'
import QRCodeGenerator from '../../../components/QRCodeGenerator'
import getColors from '../../../assets/Colors'
import Share from "react-native-share"
import localization from '../../../utils/localizations'
import { Text, View, StatusBar, Image, Dimensions, ActivityIndicator, useColorScheme, ScrollView } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ClassicHeader } from '../../../components/Headers'
import { captureRef } from "react-native-view-shot"
import { ClassicButton } from '../../../components/Buttons'


// Global data
import { useSelector } from 'react-redux'
import { selectUiStates } from '../../../state/slices/uiStatesSlice'
import { ScreenViewTracker } from '../../../analytics'
import TextSytlesProvider, { TextStylesInterface } from '../../../components/styles/TextStyles'



const screenWidth = Dimensions.get("screen").width



export default function QrCodePage({ navigation, route }) {


    // States 
    const [transitionEnded, setTransitionEnded]: [boolean, any] = useState(false)
    const [qrCodeBase64, setQrCodeBase64]: [string, any] = useState("")


    // Global data
    const uiStates = useSelector(selectUiStates)


    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const viewShotRef = useRef()
    let isLoaded = qrCodeBase64 !== ""
    let username = uiStates.userAccountMainData?.username ?? ""



    // Initialization
    useEffect(() => {

        // Loads the QR code only once page opened --> better perfomace --> page can be opened without waiting few secs 
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            setTransitionEnded(true)
        })


        return unsubscribe
    }, [navigation])



    async function captureQRCode() {
        const imageUri = await captureRef(viewShotRef, {
            // Would be nice to call it `${username_qr}_code.jpg`
            format: "jpg",
            quality: 1,
        })
        return imageUri
    }



    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"qr"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                {/* Header height : 44.5 */}
                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'chevronLeft'}
                    headerText={localization.qr_code}
                />


                {/* QR code */}
                <QRCodeUi
                    transitionEnded={transitionEnded}
                    isLoaded={isLoaded}
                    qrCodeBase64={qrCodeBase64}
                    setQrCodeBase64={setQrCodeBase64}
                    viewShotRef={viewShotRef}
                    username={username}
                    account_name={uiStates.userAccountMainData.account_name}
                    short_id={uiStates.userAccountMainData.short_id}
                    onPressDownload={async () => {


                        const image_uri = await captureQRCode()
                        let shareResponse = await Share.open({
                            title: localization.qr_code,
                            url: image_uri,
                            filename: `${username} QR code`
                        })

                    }}
                    TEXT_STYLES={TEXT_STYLES}
                />

            </SafeAreaView>
        </SafeAreaProvider >
    )
}





interface QRCodeUiInterface {
    transitionEnded: boolean
    isLoaded: boolean
    qrCodeBase64: string
    setQrCodeBase64: any
    viewShotRef: React.MutableRefObject<undefined>
    username: string
    account_name: string
    short_id: string
    onPressDownload: () => any
    TEXT_STYLES: TextStylesInterface
}
/** 
 * Loads the QR code and display it only after page transition is ended.
*/
export function QRCodeUi({
    transitionEnded,
    isLoaded,
    qrCodeBase64,
    setQrCodeBase64,
    viewShotRef,
    username,
    account_name,
    short_id,
    onPressDownload, 
    TEXT_STYLES
}: QRCodeUiInterface) {


    // Values
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")


    return (
        <ScrollView>
            <View
                style={{
                    width: screenWidth,
                    height: "100%",
                    alignItems: 'center',
                    justifyContent: "center",
                    paddingBottom: insets.bottom
                }}>


                {isLoaded ?
                    <View style={{ height: 20 }} />
                    :
                    <View style={{
                        alignItems: 'center',
                        justifyContent: "center",
                        opacity: isLoaded ? 0 : 1,
                        paddingTop: 80
                    }}>
                        <ActivityIndicator />
                    </View>
                }


                {transitionEnded &&
                    <View
                        ref={viewShotRef}
                        style={{
                            alignItems: "flex-start",
                            justifyContent: "center",
                            opacity: isLoaded ? 1 : 0,
                            backgroundColor: "white",
                            padding: 20,
                        }}>


                        {/* QR code */}
                        {!isLoaded &&
                            <QRCodeGenerator
                                username={username}
                                short_id={short_id}
                                width={screenWidth} // The larger the better the quality is
                                height={screenWidth} // 
                                setQRCodeBase64={async (base64: string) => {
                                    setQrCodeBase64(base64)

                                    //  alert(base64)
                                    // console.log(base64)

                                }}
                            />
                        }




                        {isLoaded &&
                            <Image
                                source={{ uri: qrCodeBase64.slice(1, qrCodeBase64.length - 1) }} // There is a problem with the returned base64 : it has an extraneous " at its begining and at its end.
                                style={{ width: screenWidth - 40, height: screenWidth - 40, resizeMode: 'contain' }}
                            />
                        }


                        {/* Account's name */}
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            style={{
                                alignSelf: "center",
                                color: COLORS.atSightBlue,
                                fontSize: 26,
                                fontWeight: 'bold',
                                paddingVertical: 20,
                                paddingHorizontal: 20
                            }}
                        >{account_name}</Text>


                        {/* First use indications */}
                        <Text
                            style={[{
                                fontSize: 14,
                                color: COLORS.smallGrayText,
                                // paddingHorizontal: 15,
                                paddingTop: 10,
                                textAlign: "left"
                            }]}>{"Scan, open the app or visit www.atsight.ch to access information."}</Text>

                    </View>
                }


                {isLoaded &&
                    <ClassicButton
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        onPress={() => { onPressDownload() }}
                        text={localization.download_qr_code}
                        backgroundColor={COLORS.darkBlue}
                        textColor={"white"}
                        smallAppearance
                        topMargin={30}
                    />
                }

                {/* Large fat header : Using your QR code */}
                {/* Place your QR code so that people can access your information */}
                {/* Swipable Drawing with people or a hand around + description : Placed near a desk (Desk in a hotel), on the wall of a gallery (Exposition)*/}

                {/* Understand how people look at your information */}
                {/* The QR code provides statistics on how people look at your information (when and how much). */}
                {/* "See statistics" button */}

            </View >
        </ScrollView>
    )
}


