//
//  MultiLanguageTextEditor.tsx
//  atSight (Any_id_RN2)
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors from '../../assets/Colors'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import LocalizedTextEditor from './LocalizedTextEditor'
import TextStylesProvider from '../../components/styles/TextStyles'
import LanguageSelector from '../selectors/LanguageSelector'
import { translateText } from '../../aws/translate'
import { ClassicHeader } from '../../components/Headers'
import { detectMainLanguageLocale } from '../../aws/comprehend'
import { getLanguageMetadata } from '../../assets/LanguagesList'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { InfoInputButton } from '../../components/ui/ForContentEditors'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LanguageMetadata, LanguageMetadataObj, LocalizedText, LocalizedTextObj, Page } from '../../Data'
import { StatusBar, View, ScrollView, Keyboard, Modal, TouchableWithoutFeedback, Text, TextInput, Dimensions, useColorScheme } from 'react-native'
import { descriptionWasChangedChecker, generateSimplifiedLocalizedText, textHasEmojis, generateSimplifiedTextLocalization } from '../../components/functions'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'
import { updateProfile } from '../../aws/dynamodb'
import { EmojiAlert } from '../../components/ui/AlertUi'


// Global data
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { updateProfileValue } from '../../state/slices/profilesSlice'
import { LanguageSymbol, TextSymbol } from '../../components/Symbols'



const WINDOW_HEIGHT = Dimensions.get("window").height



interface MultiLanguageTextEditorInterface {
    show: boolean
    setShow: (_: boolean) => any
    originalLocalizedText: LocalizedText
    originalTextLocalization: LocalizedText[]
    setLocalizedText?: (_: any) => any
    setTextLocalization?: (_: any) => any
    updatesProfileDescription?: boolean
    page?: Page
    username?: string
}
/**
 * A view with text in its main language and the ability to add support for other ones
 */
export default function MultiLanguageTextEditor({ show, setShow, originalLocalizedText, originalTextLocalization, setLocalizedText = () => { }, setTextLocalization = () => { }, updatesProfileDescription = false, page, username }: MultiLanguageTextEditorInterface) {


    // States
    const [localizedTextValues, setLocalizedTextValues]: [LocalizedText, any] = useState()
    const [textLocalizationValues, setTextLocalizationValues]: [LocalizedText[], any] = useState([])
    const [selectedLocalizedText, setSelectedLocalizedText]: [LocalizedText, any] = useState()
    // 
    //     
    const [isTyping, setIsTyping] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingText, setIsLoadingText] = useState(false)
    const [languageSelector, setLanguageSelector] = useState(false)
    const [localizedTexEditor, setLocalizedTexEditor] = useState(false)
    const [isNewLocalizedText, setIsNewLocalizedText] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)


    // Values 
    const textInputRef = useRef("textInput")
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let defaultLanguageName = localizedTextValues?.language_metadata?.name ?? "" // Can be Spanish (Brazil)
    let defaultLanguageLocale = localizedTextValues?.language_metadata?.locale ?? ""
    let additionalLanguageLocales = textLocalizationValues.flatMap(e => { return e.language_metadata.locale })
    let alreadyUsedLanguageLocales = (defaultLanguageLocale !== "" ? [defaultLanguageLocale] : []).concat(additionalLanguageLocales)

    const descriptionLenght = localizedTextValues?.text?.length ?? 0
    const descriptionIsTooLong = descriptionLenght > 1000

    // Initialization
    useEffect(() => {

        if (!show) return
        setIsLoadingText(false)
        // Shallow copies see (1) in the "PostEditor" for explanations
        setLocalizedTextValues(Object.assign({}, originalLocalizedText))
        setTextLocalizationValues([...originalTextLocalization])

        if ((originalLocalizedText?.text ?? "") === "") {
            setTimeout(() => {
                (textInputRef.current as any).focus()
            }, 400)
        }

    }, [show])






    function handleText(text: string) {

        const hasEmojis = textHasEmojis(text)
        if (hasEmojis) {
            let updateUiStateValuePayload: updateUiStateValuePayload = { attribute: "emojiAlert", value: true }
            dispatch(updateUiStateValue(updateUiStateValuePayload))
            return
        }

        // Creates item
        if (localizedTextValues.text === undefined) {
            let dummyLanguageMetadata = LanguageMetadataObj("", "")
            setLocalizedTextValues(LocalizedTextObj(dummyLanguageMetadata, text))
        }
        // 
        else {
            setLocalizedTextValues((prevV: LocalizedText) => {
                return LocalizedTextObj(prevV.language_metadata, text)
            })
        }
    }


    function getDescriptionWithItsLocale(): Promise<LocalizedText> {
        return new Promise(async (resolve, reject) => {

            const text = localizedTextValues?.text ?? ""

            try {
                const language_locale = await detectMainLanguageLocale(text)
                const language_metadata = getLanguageMetadata(language_locale)
                resolve(LocalizedTextObj(language_metadata, text))
            } catch (error) {
                let err = getErrorDescription(error)
                reject(err.message)
            }

        })
    }


    async function handleWriteInOtherLanguage() {

        Keyboard.dismiss()

        // The text's language may have been changed since then.
        // e.g. : the user hits "translate" closes the view without adding any translation and completely change the text.
        // However stops detecting the language if one translation was provided because the user at that point is not going the original text language anymore.
        if ((defaultLanguageLocale === "") || textLocalizationValues.length === 0) {
            setIsLoadingText(true)
            try {
                const updatedDescription = await getDescriptionWithItsLocale()
                setLocalizedTextValues(updatedDescription)
                setIsLoadingText(false)
            } catch (error) {
                setIsLoadingText(false)
                alert(error)
                return
            }
        }

        setSelectedLocalizedText(undefined)
        setLanguageSelector(true)

    }


    async function handleSubmit() {


        Keyboard.dismiss()
        const trimmedDescriptionText = (localizedTextValues?.text ?? "").replace(/\s+/g, '')
        let descriptionToUse = trimmedDescriptionText !== "" ? localizedTextValues : undefined


        if ((originalLocalizedText?.text ?? "").replace(/\s+/g, '') !== trimmedDescriptionText && trimmedDescriptionText.length > 0) {
            try {
                setIsLoading(true)
                descriptionToUse = await getDescriptionWithItsLocale()
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                alert(error)
            }
        }


        setLocalizedText(descriptionToUse)
        setTextLocalization(trimmedDescriptionText !== "" ? textLocalizationValues : [])
        setShow(false)


    }



    //______________________________________________
    const dispatch = useDispatch()
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    async function updateProfileDescription() {


        // Preparation
        setIsLoading(true)
        let simplifiedDescrtiption = {}
        let simplifiedDescriptionLocalization = {}
        if ((localizedTextValues.text ?? "") !== "") {
            let descriptionWasChanged = descriptionWasChangedChecker(localizedTextValues, originalLocalizedText)
            try {
                simplifiedDescrtiption = await generateSimplifiedLocalizedText(descriptionWasChanged, localizedTextValues)
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
            if (textLocalizationValues.length > 0) simplifiedDescriptionLocalization = await generateSimplifiedTextLocalization(textLocalizationValues)
        }



        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }






        // Step 1 : dynamoDB
        try {
            await updateProfile(page.account_id, "description", simplifiedDescrtiption, jwtToken)
        } catch (error) {
            alert(error)
            setIsLoading(false)
            return
        }
        try {
            await updateProfile(page.account_id, "description_localization", simplifiedDescriptionLocalization, jwtToken)
        } catch (error) {
            alert(error)
            setIsLoading(false)
            return
        }
        console.log("Step 1 done")




        // Step 2 : Ui
        dispatch(updateProfileValue({ page_number: page.page_number, attribute: "description", newValue: simplifiedDescrtiption }))
        dispatch(updateProfileValue({ page_number: page.page_number, attribute: "description_localization", newValue: simplifiedDescriptionLocalization }))
        setIsLoading(false)
        setShow(false)
        console.log("Step 2 done")

    }
    //______________________________________________




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
                            COLORS={COLORS}
                            TEXT_STYLES={TEXT_STYLES}
                            onClose={() => { setShow(false) }}
                            closeButtonType={'cancelText'}
                            headerText={localization.description}
                            onPress={async () => { updatesProfileDescription ? updateProfileDescription() : handleSubmit() }}
                            isLoading={isLoading}
                            buttonType={'doneText'}
                            displayOkButtonWhenInfoEdited={true}
                            condition={!descriptionIsTooLong}
                        />



                        <ScrollView
                            keyboardDismissMode={"interactive"}
                            keyboardShouldPersistTaps={"handled"}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                marginBottom: insets.bottom,
                                paddingBottom: (isTyping ? WINDOW_HEIGHT / 2.3 : 0),

                            }}
                        >


                            {/* Default language */}
                            <View style={{ backgroundColor: COLORS.whiteToGray2, paddingVertical: 10, paddingHorizontal: 20, }}>
                                <TextInput
                                    ref={textInputRef as any}
                                    style={[
                                        TEXT_STYLES.calloutMedium, {
                                            color: COLORS.black,
                                            height: WINDOW_HEIGHT * 0.3,
                                            width: '100%',  // Does sort of that not only the textinput's placeholder is tappable.
                                            flexShrink: 1,  // flexShrink: 1 makes the text clipped inside the gray capsule + (on iOS makes the clearButton visible)
                                        }]}
                                    onFocus={() => { setIsTyping(true) }}
                                    onEndEditing={() => { setIsTyping(false) }}
                                    value={localizedTextValues?.text ?? ''}
                                    onChangeText={text => { handleText(text) }}
                                    placeholder={localization.enter_description}
                                    placeholderTextColor={COLORS.placeholderGray}
                                    onSubmitEditing={() => { Keyboard.dismiss() }}
                                    returnKeyType={"done"}
                                    clearButtonMode="always" // iOS only 
                                    autoCapitalize={"sentences"}
                                    autoCorrect
                                    multiline
                                    focusable

                                />
                            </View>

                            {/* Characters counter */}
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20, paddingBottom: 10, }}>
                                {descriptionIsTooLong ?
                                    <Text style={{ fontSize: 12, color: COLORS.red }}>{localization.description_too_long}</Text>
                                    :
                                    <LanguageSymbol COLORS={COLORS} color={descriptionLenght > 0 ? COLORS.smallGrayText : COLORS.clear} size={13} />
                                }

                                <Text numberOfLines={1} style={[{ fontSize: 12, color: descriptionIsTooLong ? COLORS.red : COLORS.smallGrayText }]}>{`${descriptionLenght}/1000`}</Text>
                            </View>

                            {/* User's translations */}
                            {descriptionLenght > 0 &&
                                <View style={{}}>
                                    <Divider COLORS={COLORS} />

                                    <View style={{ flexDirection: "row", display: "flex", justifyContent: "flex-start", alignItems: "flex-start", marginHorizontal: 20, marginTop: 10, marginBottom: 10 }}>
                                        <Text style={[TEXT_STYLES.gray12Text, { paddingRight: 10, flexShrink: 1 }]}>{localization.atsight_translates_auto_way_but_you}<Text onPress={() => { handleWriteInOtherLanguage() }} style={{ color: COLORS.darkBlue }}>{isLoadingText ? ` ${localization.loading.toLowerCase()}...` : localization.provide_your_translation}</Text></Text>
                                    </View>

                                    {textLocalizationValues.map((e) => {

                                        let hasText = (e?.text ?? "") !== ""

                                        return (
                                            <InfoInputButton
                                                infoType='translation'
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                description={e.language_metadata.name}
                                                infoValue={hasText ? e.text : localization.write_text}
                                                onPress={() => {
                                                    Keyboard.dismiss()
                                                    setSelectedLocalizedText(e)
                                                    setIsNewLocalizedText(false)
                                                    setLocalizedTexEditor(true)
                                                }}
                                            />
                                        )
                                    })}
                                </View>
                            }
                        </ScrollView>

                    </SafeAreaView>
                </SafeAreaProvider>






                {/* Modal */}
                <LocalizedTextEditor
                    show={localizedTexEditor}
                    setShow={setLocalizedTexEditor}
                    isNewLocalizedText={isNewLocalizedText}
                    originalLocalizedText={selectedLocalizedText}
                    setLocalizedText={(localizedText: LocalizedText | undefined) => {

                        // Values 
                        let locale = selectedLocalizedText?.language_metadata.locale ?? ""
                        let index = textLocalizationValues.findIndex(e => { return e.language_metadata.locale === locale })

                        // Updates 
                        if (index === -1) {
                            return
                        } else {

                            setTextLocalizationValues(prevV => {

                                // Update 
                                if (localizedText !== undefined) {
                                    prevV[index] = localizedText
                                }
                                // Delete
                                else {
                                    prevV.splice(index, 1)
                                }

                                return prevV

                            })

                        }

                    }}
                    alreadyUsedLanguageLocales={alreadyUsedLanguageLocales}
                />


                <LanguageSelector
                    show={languageSelector}
                    setShow={setLanguageSelector}
                    comment={localization.select_language_for_translation}
                    setSelectedLanguageMetadata={async (languageMetadata: LanguageMetadata) => {

                        // 
                        setIsTranslating(true)
                        let text = ""
                        let newLocalizedText
                        try {
                            text = await translateText(localizedTextValues.text, "en", languageMetadata.locale)
                            newLocalizedText = LocalizedTextObj(languageMetadata, text)
                        } catch (error) {
                            setIsTranslating(false)
                            let err = getErrorDescription(error)
                            alert(err.message)
                            return
                        }


                        // Updates 
                        setTextLocalizationValues(prevV => {
                            return [...prevV, newLocalizedText]
                        })


                        // Ui
                        setLanguageSelector(false)
                        setIsTranslating(false)
                        setIsNewLocalizedText(true)
                        setSelectedLocalizedText(newLocalizedText)

                        setTimeout(() => {
                            setLocalizedTexEditor(true)
                        }, 160)


                    }}
                    alreadyUsedLanguageLocales={alreadyUsedLanguageLocales}
                    isLoading={isTranslating}
                    doNotCloseWhenSelect={true}
                />

                <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />


            </Modal>
        </TouchableWithoutFeedback >
    )
}






