//
//  LocalizedTextEditor.tsx
//  atSight (Any_id_RN2)
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from '../../assets/Colors'
import RedError from '../../components/ui/RedError'
import TextStylesProvider from '../../components/styles/TextStyles'
import LanguageSelector from '../../views/selectors/LanguageSelector'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import { InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { TriangleBottomSymbol } from '../../components/Symbols'
import { SimpleCenteredButton } from '../../components/Buttons'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { LanguageMetadata, LanguageMetadataObj, LocalizedText, LocalizedTextObj } from '../../Data'
import { StatusBar, View, ScrollView, Keyboard, Modal, TouchableWithoutFeedback, TouchableOpacity, Text, useColorScheme, Dimensions } from 'react-native'
import { EmojiAlert } from '../../components/ui/AlertUi'




const WINDOW_HEIGHT = Dimensions.get("window").height



// A view to edit a value from the information page. (Description, account name, links, ...)
interface LocalizedTextEditorInterface {
    show: boolean
    setShow: any
    isNewLocalizedText: boolean
    originalLocalizedText: LocalizedText
    setLocalizedText: any
    alreadyUsedLanguageLocales: string[]
}
export default function LocalizedTextEditor({ show, setShow, isNewLocalizedText, originalLocalizedText, setLocalizedText, alreadyUsedLanguageLocales }: LocalizedTextEditorInterface) {

    // States
    const [text, setText]: [string, any] = useState("")
    const [languageMetadata, setLanguageMetadata]: [LanguageMetadata, any] = useState(undefined)
    //
    const [error, setError] = useState("")
    const [editedInfoType, setEditedInfoType] = useState('')
    const [languageSelector, setLanguageSelector] = useState(false)



    // Values 
    //
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let hasALanguage = (languageMetadata?.locale ?? "") !== ""
    let metadataFilled =
        text !== "" &&
        hasALanguage
    let metadataWasChanged =
        text !== (originalLocalizedText?.text ?? "") ||
        (languageMetadata?.name ?? "") !== (originalLocalizedText?.language_metadata.name ?? "")

    const descriptionLenght = text?.length ?? 0
    const descriptionIsTooLong = descriptionLenght > 1000


    // Initialization
    useEffect(() => {

        if (!show) return
        setError("")
        setText(originalLocalizedText?.text ?? "")
        setLanguageMetadata(originalLocalizedText?.language_metadata ?? LanguageMetadataObj("", ""))


    }, [show])



    // Clear error
    useEffect(() => {
        setError("")
    }, [editedInfoType, text])




    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={show}
                onRequestClose={() => { setShow(false) }}
            >


                <SafeAreaProvider>
                    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                        <StatusBar
                            barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                            backgroundColor={COLORS.clear}
                            translucent
                        />

                        <ClassicHeader
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            onClose={() => { setShow(false) }}
                            closeButtonType={'cancelText'}
                            headerText={localization.additional_language}
                            condition={(isNewLocalizedText ? metadataFilled : metadataWasChanged && metadataFilled) && !descriptionIsTooLong}
                            onPress={() => {

                                setLocalizedText(LocalizedTextObj(languageMetadata, text))
                                setShow(false)

                            }}
                            editedInfoType={editedInfoType as InformationType}
                            buttonType={'doneText'}
                            isLoading={false}
                            displayOkButtonWhenInfoEdited={true}
                        />




                        <ScrollView
                            style={{ backgroundColor: COLORS.whiteGray }}
                            keyboardDismissMode={'on-drag'}
                            keyboardShouldPersistTaps={'handled'}
                            scrollEnabled={false}
                        >
                            <View style={{ marginTop: 40 }}>






                                {/* Language button + Text */}
                                <View>
                                    <TouchableOpacity
                                        onPress={() => { setLanguageSelector(true) }}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            paddingHorizontal: 20,
                                            paddingBottom: 10,
                                        }}
                                    >

                                        <View style={{ paddingRight: 4 }}>
                                            <TriangleBottomSymbol COLORS={COLORS} color={COLORS.black} />
                                        </View>

                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                TEXT_STYLES.calloutMedium, {
                                                    color: COLORS.black
                                                }
                                            ]}
                                        >{hasALanguage ?
                                            languageMetadata.name
                                            :
                                            localization.select_language
                                            }
                                        </Text>
                                    </TouchableOpacity>



                                    <Divider COLORS={COLORS} />


                                    <View style={{ paddingTop: 12, paddingHorizontal: 20, backgroundColor: COLORS.whiteToGray2 }}>
                                        <InfoInput
                                            text={text ?? ''}
                                            setText={setText}
                                            COLORS={COLORS}
                                            TEXT_STYLES={TEXT_STYLES}
                                            style={'none'}
                                            infoType={'description'}
                                            autoCapitalize={'sentences'}
                                            editedInfoType={editedInfoType as InformationType}
                                            setEditedInfoType={setEditedInfoType}
                                            doneReturnKey={false}
                                            multiline={true}
                                            onSubmitEditing={() => { }}
                                            height={WINDOW_HEIGHT * 0.23}
                                        />

                                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, }}>
                                            <Text style={{ fontSize: 12, color: COLORS.red }}>{descriptionIsTooLong ? localization.description_too_long : ""}</Text>
                                            <Text numberOfLines={1} style={[{ fontSize: 12, color: descriptionIsTooLong ? COLORS.red : COLORS.smallGrayText }]}>{`${descriptionLenght}/1000`}</Text>
                                        </View>
                                    </View>

                                    <Divider COLORS={COLORS} />

                                </View>



                                {/* Error */}
                                {error !== '' ?
                                    <RedError
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        error={error}
                                        marginTop={20}
                                        marginH={20}
                                        alignItems={'flex-start'}
                                        textAlign={'left'}
                                    />
                                    :
                                    null
                                }



                                {/* Delete button */}
                                {isNewLocalizedText ?
                                    null
                                    :
                                    <SimpleCenteredButton
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        text={localization.remove}
                                        onPress={() => {
                                            setLocalizedText(undefined)
                                            setShow(false)
                                        }}
                                        destructiveColor={true}
                                        marginVertical={45}
                                    />
                                }





                            </View>
                        </ScrollView>





                    </SafeAreaView>
                </SafeAreaProvider>




                {/* Modal */}
                <LanguageSelector
                    show={languageSelector}
                    setShow={setLanguageSelector}
                    setSelectedLanguageMetadata={(languageMetadata: LanguageMetadata) => {
                        setLanguageMetadata(languageMetadata)
                    }}
                    alreadyUsedLanguageLocales={alreadyUsedLanguageLocales.filter(e => { return e !== originalLocalizedText?.language_metadata.locale ?? "" }).concat([languageMetadata?.locale ?? ""])}
                />

                <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />


            </Modal>
        </TouchableWithoutFeedback>
    )
}



