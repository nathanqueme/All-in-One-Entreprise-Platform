//
//  PdfPage.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import TextSytlesProvider, { TextStylesInterface } from '../../../components/styles/TextStyles'
import Pdf from 'react-native-pdf'
import localization from '../../../utils/localizations'
import Divider from '../../../components/ui/Divider'
import { ClockSymbol, PencilSymbol } from '../../../components/Symbols'
import { StatusBar, ScrollView, Dimensions, Text, Linking, Animated, View, TouchableOpacity } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ClassicHeader } from '../../../components/Headers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Page } from '../../../Data'
import { getContent } from '../../../aws/s3'
import { animateAnimatableValue, awaitXMilliSeconds, call, getFileName, openLinkWithInAppWeb } from '../../../components/functions'
import { SlidingAlert } from '../../../components/SlidingAlert'
import { SlidingAlertType } from '../../../Types'
import { ReloadPageButton } from '../../../components/Buttons'


// Global data 
import { useSelector } from 'react-redux'
import { selectUiStates } from '../../../state/slices/uiStatesSlice'
import { selectPagesProfiles } from '../../../state/slices/profilesSlice'
import { ScreenViewTracker } from '../../../analytics'
import getColors from './../../../assets/Colors'



const screenWidth = Dimensions.get('screen').width



function PdfPage({ navigation, route }) {


    // States 
    const progress = useRef(new Animated.Value(-screenWidth)).current
    //
    const [pdfBase64, setPdfBase64]: [string, any] = useState("")
    const [transitionEnded, setTransitionEnded]: [boolean, any] = useState(false)
    const [failedLoading, setFailedLoading] = useState(false)
    const [slidingAlertType, setSlidingAlertType]: [SlidingAlertType, any] = useState("" as any)
    const [isLoading, setIsLoading] = useState(false)


    // Navigation values
    const { page, isMenuViewer } = route.params
    const { page_number, short_id } = page as Page


    // Global data
    const uiStates = useSelector(selectUiStates)
    const profile = useSelector(selectPagesProfiles).find(e => { return e.page.page_number === page_number })?.profile


    // Values 
    const insets = useSafeAreaInsets()
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const account_id = profile.account_id ?? ""
    const menuPhoneNumber = profile?.menu_phone_number
    const menuHasPhoneNumber = ((profile?.menu_phone_number?.number ?? "").replace(/\s+/g, '') !== "")
    const menuHasTimetables = (profile?.menu_timetables ?? []).length > 0
    let hasAPdf = (profile.additional_resources ?? []).includes(isMenuViewer ? "menu" : "map")
    let isUserAccount = account_id === uiStates.account_id && account_id !== ""



    // Initialization + update 
    useEffect(() => {

        if (hasAPdf) loadPdf()

    }, [uiStates.refreshPdfPage])
    // Update (needed to reflect the pdf deletion properly)
    useEffect(() => {
        if (!hasAPdf) setPdfBase64("")
    }, [hasAPdf])



    async function loadPdf() {

        // Ui
        setIsLoading(true)
        animateAnimatableValue(progress, -screenWidth, 0)
        animateAnimatableValue(progress, -screenWidth * 0.85, 300)

        await awaitXMilliSeconds(300)
        animateAnimatableValue(progress, -screenWidth * 0.15, 4300)


        try {
            let file_name = getFileName("pdf", short_id, "", isMenuViewer)
            let base64 = await getContent("anyid-eu-west-1", file_name)
            setPdfBase64(base64)
        } catch (error) {
            console.log("ERRORRRR")
            console.log(`short_id : ${short_id}`)

            handlePDFLoadingFailure()
        }


        // Ui
        animateAnimatableValue(progress, 0, 100)
        const _ = await awaitXMilliSeconds(100)
        setIsLoading(false)
        animateAnimatableValue(progress, -screenWidth, 10)


    }


    function handlePDFLoadingFailure() {
        setSlidingAlertType("no_connection" as SlidingAlertType)
        animateAnimatableValue(progress, -screenWidth, 0)
        setFailedLoading(true)
        setIsLoading(false)
    }



    // Transition ended 
    useEffect(() => {

        const unsubscribe = navigation.addListener('transitionEnd', () => {
            setTransitionEnded(true)
        })

        return unsubscribe;
    }, [navigation])






    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"pdf_viewer"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgDarkGray }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={"light-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />



                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'xmark'}
                    headerText={isMenuViewer ? localization.menu : localization.map}
                    onPress={() => { call(menuPhoneNumber.number, menuPhoneNumber.calling_code) }}
                    buttonType={menuHasPhoneNumber && isMenuViewer ? "phoneSymbol" : undefined} // if has a phone number phone number button 
                    isLoading={isLoading}
                    hideLoadingIndicator={true}
                    progress={progress}
                    backgroundColor={COLORS.bgDarkGray}
                    textColor={"white"}
                    loadingBarColor={COLORS.bgGray}
                    dividerColor={"white"}
                />




                {hasAPdf ?
                    (transitionEnded && pdfBase64 !== "" ?
                        <Pdf
                            source={{ uri: pdfBase64.replace("data:application/octet-stream", "data:application/pdf"), cache: false }}
                            onLoadComplete={(numberOfPages, filePath) => {
                                // console.log(`Number of pages: ${numberOfPages}`);
                            }}
                            onPageChanged={(page, numberOfPages) => {
                                // console.log(`Current page: ${page}`);
                            }}
                            onError={(error) => {
                                console.log(error);
                            }}
                            onPressLink={(uri) => {
                                if (Linking.canOpenURL(uri)) openLinkWithInAppWeb(uri)
                            }}
                            style={{ flex: 1, width: '100%', height: '100%', backgroundColor: COLORS.bgDarkGray }}
                        />
                        :
                        <ScrollView contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            paddingBottom: insets.bottom
                        }}>
                            {failedLoading &&
                                <ReloadPageButton
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    textColor={"white"}
                                    onPress={() => {
                                        setFailedLoading(false)
                                        setTimeout(async () => {
                                            loadPdf()
                                        }, 120)
                                    }}
                                />
                            }
                        </ScrollView>
                    )

                    :

                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: insets.bottom }}>
                        <Text style={[TEXT_STYLES.noContentFont, { paddingHorizontal: 40, textAlign: 'center' }]}>
                            {isMenuViewer ? localization.no_menu_to_display : localization.no_map_to_display}
                        </Text>
                    </ScrollView>
                }


                {/* Buttons */}
                {(isUserAccount || (isMenuViewer && menuHasTimetables)) &&
                    <View>
                        <Divider COLORS={COLORS} color='white' />
                        <View
                            style={{
                                width: "100%",
                                paddingBottom: insets.bottom,
                                flexDirection: "row"
                            }}>

                            {(isMenuViewer && menuHasTimetables) &&
                                <PdfButtonUi
                                    symbol={<ClockSymbol COLORS={COLORS} size={18} color={"white"} />}
                                    text={localization.see_timetables}
                                    onPress={() => {
                                        navigation.navigate('PdfInfo', { page: page, isMenuViewer: isMenuViewer, editingMode: false })
                                    }}
                                    TEXT_STYLES={TEXT_STYLES}
                                />
                            }

                            {isUserAccount &&
                                <PdfButtonUi
                                    symbol={<PencilSymbol COLORS={COLORS} size={18} color={"white"} />}
                                    text={localization.edit}
                                    onPress={() => {
                                        navigation.navigate('PdfInfo', { page: page, isMenuViewer: isMenuViewer, editingMode: true })
                                    }}
                                    TEXT_STYLES={TEXT_STYLES}
                                />
                            }

                        </View>
                    </View>
                }


            </SafeAreaView>


            {/* Modals */}
            <SlidingAlert
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
                topInset={insets.top}
                bottomInset={insets.bottom}
                slidingAlertType={slidingAlertType}
                resetSlidingAlertType={() => { setSlidingAlertType("") }}
                slideFromBottom={true}
            />


        </SafeAreaProvider>
    )
}


export default PdfPage





interface PdfButtonUiInterface {
    symbol: any
    text: string
    onPress: () => any
    TEXT_STYLES: TextStylesInterface
}
function PdfButtonUi({ symbol, text, onPress, TEXT_STYLES }: PdfButtonUiInterface) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 20,
                height: 44.5
            }}>
            {symbol}
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit style={[TEXT_STYLES.calloutMedium, { paddingLeft: 10, color: "white" }]}>{text}</Text>
        </TouchableOpacity>
    )
}