//
//  QrScannerModal.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//


// @ts-check
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import getColors from './../../assets/Colors'
import localization from '../../utils/localizations'
import QRCodeScanner from 'react-native-qrcode-scanner'
import TextStylesProvider from '../../components/styles/TextStyles'
import { RNCamera } from 'react-native-camera'
import { ClassicHeader } from '../../components/Headers'
import { check, PERMISSIONS, request } from 'react-native-permissions'
import { Modal, View, StatusBar, Text, Dimensions, Platform, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenViewTracker } from '../../analytics'




const WINDOW_HEIGHT = Dimensions.get("window").height
const WINDOW_WIDTH = Dimensions.get("window").width
const QR_OVERLAY_WIDTH = WINDOW_WIDTH * 0.6




export default function QrScannerModal({ show, setShow, onSuccessScan }) {


    // States
    const [cameraIsEnabled, setCameraIsEnabled] = useState(undefined)


    // Values 
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)


    useEffect(() => {
        if (show) {

            checkIfCameraIsEnabled()
        }
    }, [show])
    async function checkIfCameraIsEnabled() {

        check(Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
            .then(async (result) => {

                const camera_permission_requested = JSON.parse(await AsyncStorage.getItem("@camera_permission_requested"))
                if (camera_permission_requested) { setCameraIsEnabled(result === "granted") }

            })
            .catch((error) => {
                setCameraIsEnabled(false)
            })

    }
    async function requestCameraAccess() {
        request(Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
            .then((result) => {
                setCameraIsEnabled(result === "granted")
                AsyncStorage.setItem("@camera_permission_requested", "true")
            }).catch(e => {
                setCameraIsEnabled(false)
            })
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={show}
            onRequestClose={() => { setShow(false) }}
        >
            <SafeAreaProvider>
                <ScreenViewTracker screen_name={"scanner"} />
                <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={['top', 'right', 'left']}>
                    <StatusBar
                        barStyle={"light-content"}
                        backgroundColor={"black"}
                    />



                    {/* Header */}
                    <View style={{ flex: 1, position: "absolute", top: Platform.OS === "ios" ? insets.top : 0, zIndex: 50, width: "100%" }}>
                        <ClassicHeader
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            closeButtonType={"closeText"}
                            onClose={() => { setShow(false) }}
                            headerText={localization.scanner}
                            backgroundColor={COLORS.clear}
                            textColor={"white"}
                            showDivider={false}
                        />
                    </View>



                    <View style={{ backgroundColor: "black", flex: 1, height: Dimensions.get("window").height, width: "100%", position: "absolute" }}>
                        {/* Full screen scanner */}
                        {cameraIsEnabled &&
                            <QRCodeScanner
                                onRead={onSuccessScan}
                                vibrate={true}
                                fadeIn={false}
                                flashMode={false ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                                cameraStyle={{ height: "100%", width: "100%" }}
                                containerStyle={{ height: "100%", width: "100%" }}
                                permissionDialogTitle={localization.camera_access}
                                permissionDialogMessage={localization.atsight_needs_access_to_camera_for_scanner}
                            />
                        }
                    </View>


                    <Overlay TEXT_STYLES={TEXT_STYLES} cameraIsEnabled={cameraIsEnabled} COLORS={COLORS} handlePress={() => {
                        if (cameraIsEnabled === false) {
                            Linking.openSettings()
                        } else {
                            requestCameraAccess()
                        }
                    }} />


                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    )
}




function Overlay({ cameraIsEnabled, handlePress, COLORS, TEXT_STYLES }) {
    return (
        < View style={{
            marginTop: 0,
            zIndex: 10,
            display: "flex",
            position: "absolute",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: Dimensions.get("window").height,
            backgroundColor: "black",
            opacity: cameraIsEnabled ? 0.4 : 1
        }
        }>
            {cameraIsEnabled ?
                <>
                    <QrCodeOverlay key={"1"} />
                    <Text key={"2"} style={{ marginTop: 10, color: "white", fontSize: 14, marginLeft: 20, marginRight: 20, maxWidth: QR_OVERLAY_WIDTH, textAlign: "center" }}>{localization.how_scanner_works}</Text>
                </>
                :
                <View style={{ margin: 20, justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                    <Text style={[{ textAlign: "center", color: "white", marginBottom: 10, fontSize: 20, fontWeight: "600", marginHorizontal: 40 }]}>{localization.access_information_on_places_by_scanning_qr_codes}</Text>
                    <Text style={[TEXT_STYLES.gray13Text, { textAlign: "center", marginHorizontal: 0 }]}>{localization.atsight_needs_access_to_camera_for_scanner}</Text>
                    <TouchableOpacity style={{ marginTop: 30 }} onPress={() => { handlePress() }} ><Text style={[TEXT_STYLES.medium15, { color: COLORS.darkBlue, margin: 12, marginHorizontal: 8 }]}>{localization.allow_camera_access}</Text></TouchableOpacity>
                </View>
            }
        </View >
    )
}




{/* A white symbol of a qr code */ }
function QrCodeOverlay() {
    return (
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: 12, borderWidth: 8, borderColor: "white", borderRadius: 24, width: QR_OVERLAY_WIDTH, height: QR_OVERLAY_WIDTH, maxWidth: 384, maxHeight: 384 }}>
            {[1, 2].map(row => {

                const BOX_WIDTH_AND_HEIGHT = 50
                const boxUi =
                    <View style={{ height: BOX_WIDTH_AND_HEIGHT, width: BOX_WIDTH_AND_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, borderWidth: 4, borderColor: "white" }}>
                        <View style={{ width: "80%", height: "80%", backgroundColor: "white", borderRadius: 2 }} />
                    </View>

                return (
                    /* Row with qr codes */
                    <View key={row} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
                        {[1, 2].map(box => {
                            return (
                                ((row === 2) && (box === 2)) ?
                                    <View style={{ height: 18, width: 18, marginRight: BOX_WIDTH_AND_HEIGHT - 18, borderRadius: 4, borderWidth: 4, borderColor: "white" }} />
                                    :
                                    boxUi
                            )
                        })}
                    </View>
                )
            })}
        </View>
    )
}



