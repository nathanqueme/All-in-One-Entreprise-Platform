//
//  LinkEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import getColors from './../../assets/Colors'
import SectionAppearance from '../../components/ui/SectionAppearance'
import RedError from '../../components/ui/RedError'
import Divider from '../../components/ui/Divider'
import localization from '../../utils/localizations'
import { StatusBar, StyleSheet, Modal, View, ScrollView, Keyboard, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { Link, LinkObj } from '../../Data'
import { checkLinkValidity } from '../../components/functions'
import { SimpleCenteredButton } from '../../components/Buttons'
import { EmojiAlert } from '../../components/ui/AlertUi'
import TextSytlesProvider from '../../components/styles/TextStyles'




interface LinkEditorInterface {
    show: boolean
    setShow: any
    originalLink: Link
    setLink: any
    justUrlInput?: boolean
}

// A view to edit a link.
function LinkEditor({ show, setShow, originalLink, setLink, justUrlInput = false }: LinkEditorInterface) {

    // States 
    const [name, setName]: [string, any] = useState('')
    const [url, setUrl]: [string, any] = useState('')
    const [editedInfoType, setEditedInfoType]: [InformationType, any] = useState(null)
    const [error, setError]: [string, any] = useState('')
    const [isChecking, setIsChecking]: [boolean, any] = useState(false)



    // Values 
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    let isNewLink = (originalLink?.url ?? '') === ''
    let metadataFilled = justUrlInput ?
        url !== '' :
        (name !== '') && (url !== '')
    let metadataWasChanged = justUrlInput ?
        url !== (originalLink?.url ?? '') :
        name !== (originalLink?.name ?? '') ||
        url !== (originalLink?.url ?? '')



    // Initialization
    useEffect(() => {

        if (!show) return
        setName(originalLink?.name ?? '')
        setUrl(originalLink?.url ?? '')
        setError('')
        setIsChecking(false)

    }, [show])


    // Clear error
    useEffect(() => {
        setError("")
    }, [editedInfoType])



    return (

        <Modal
            animationType="slide"
            transparent={true}
            visible={show}
            onRequestClose={() => {
                setShow(false)
            }}
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
                        headerText={localization.link}
                        condition={isNewLink ? metadataFilled : metadataFilled && metadataWasChanged}
                        onPress={async () => {

                            setError('')
                            Keyboard.dismiss()


                            let newLink = LinkObj(name, url)


                            try {
                                new URL(url)
                            } catch (error) {
                                setError(localization.empty_url)
                                return
                            }





                            try {
                                setIsChecking(true)
                                await checkLinkValidity(newLink.url)
                                setLink(LinkObj(name, url))
                                setShow(false)
                            } catch (error) {
                                setError(error)
                                setIsChecking(false)
                            }


                        }}
                        editedInfoType={editedInfoType}
                        setEditedInfoType={setEditedInfoType}
                        buttonType={'doneText'}
                        displayOkButtonWhenInfoEdited={true}
                        isLoading={isChecking}
                        hideCancelButtonWhenLoading={false}
                    />





                    <ScrollView
                        style={{ backgroundColor: COLORS.whiteGray }}
                        keyboardDismissMode={'on-drag'}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <View style={{ marginTop: -StyleSheet.hairlineWidth + 40 }}>




                            {/* Name and link */}
                            <SectionAppearance COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} text={localization.link_information} children={
                                <View>

                                    <InfoInput
                                        text={url}
                                        COLORS={COLORS}
                                        TEXT_STYLES={TEXT_STYLES}
                                        setText={(text) => {
                                            setUrl(text)
                                            setError('')
                                        }}
                                        style={'with_name'}
                                        infoType={'link_url' as InformationType}
                                        editedInfoType={editedInfoType}
                                        setEditedInfoType={setEditedInfoType}
                                        doneReturnKey={false}
                                        autoCorrect={false}
                                        onSubmitEditing={() => { }}
                                        focusOnAppear={true}
                                    />

                                    {!justUrlInput &&
                                        <View>
                                            <Divider COLORS={COLORS} marginLeft={110} />

                                            <InfoInput
                                                text={name}
                                                COLORS={COLORS}
                                                TEXT_STYLES={TEXT_STYLES}
                                                setText={(text) => {
                                                    setName(text)
                                                    setError('')
                                                }}
                                                style={'with_name'}
                                                autoCapitalize={'sentences'}
                                                infoType={'link_name' as InformationType}
                                                editedInfoType={editedInfoType}
                                                setEditedInfoType={setEditedInfoType}
                                                doneReturnKey={false}
                                                onSubmitEditing={() => { }}
                                            />
                                        </View>
                                    }


                                </View>
                            } />



                            {/* Error */}
                            {error ?
                                <RedError
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    error={error}
                                    marginTop={20}
                                    marginH={20}
                                    alignItems={'flex-start'}
                                    textAlign={'left'}
                                /> : null
                            }


                            {/* Delete button */}
                            {((originalLink?.url ?? "") !== "") ?
                                <SimpleCenteredButton
                                    COLORS={COLORS}
                                    TEXT_STYLES={TEXT_STYLES}
                                    text={localization.delete}
                                    onPress={() => {
                                        setLink(undefined)
                                        setShow(false)
                                    }}
                                    destructiveColor={true}
                                    marginVertical={35}
                                />
                                : null
                            }


                        </View>
                    </ScrollView>
                </SafeAreaView>


                {/* Modals */}
                <EmojiAlert COLORS={COLORS} TEXT_STYLES={TEXT_STYLES} />


            </SafeAreaProvider>
        </Modal>

    )
}


export default LinkEditor