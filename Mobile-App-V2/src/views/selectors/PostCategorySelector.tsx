//
//  PostCategoryList.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect } from 'react'
import localization from '../../utils/localizations'
import getColors, { ColorsInterface } from '../../assets/Colors'
import SelectedCircle from '../../components/ui/SelectedCircle'
import TextAndDescription from '../../components/ui/TextAndDescription'
import TextSytlesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'
import { StatusBar, Text, FlatList, Modal, Pressable, View, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { getCategoryTypeDescription } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { PostCategoryMetadata } from '../../Data'
import { SelectableList } from '../../components/Symbols'



interface PostCategorySelectorInterface {
    show: boolean
    setShow: any
    setSelectedPostCategory: any
    originalSelection: PostCategoryMetadata
    postCategoriesMetadata: PostCategoryMetadata[]
}
/**
 * A list of all the user's custom categories.
 */
export default function PostCategorySelector({ show, setShow, setSelectedPostCategory, originalSelection, postCategoriesMetadata }: PostCategorySelectorInterface) {


    // States 
    const [selectedPostCategoryMetadata, setSelectedPostCategoryMetadata]: [PostCategoryMetadata, any] = useState(undefined)


    // Values 
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextSytlesProvider.getStyles(COLORS)
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    let metadataFilled = (selectedPostCategoryMetadata?.category_id ?? '') !== ''


    // Initialization
    useEffect(() => {

        if (!show) return
        setSelectedPostCategoryMetadata(originalSelection)


    }, [show])


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={show}
            onRequestClose={() => { setShow(false) }}
        >

            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left', 'bottom']}>
                    <StatusBar
                        barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                        backgroundColor={COLORS.clear}
                        translucent
                    />



                    <ClassicHeader
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        onClose={() => { setShow(false) }}
                        closeButtonType={'closeText'}
                        headerText={localization.categories}
                        condition={metadataFilled}
                        buttonType={'selectText'}
                        onPress={() => {

                            setSelectedPostCategory(selectedPostCategoryMetadata)
                            setShow(false)

                        }}
                    />



                    <FlatList
                        data={
                            postCategoriesMetadata
                                /**
                                  * Sorted by most descending order
                                  * See on "ProfilePage" for explanations
                                */
                                .sort(function (a, b) {
                                    if (a.c_index > b.c_index) { return -1; }
                                    if (a.c_index < b.c_index) { return 1; }
                                    return 0;
                                })
                        }
                        keyboardDismissMode={"on-drag"}
                        keyboardShouldPersistTaps={"always"}
                        keyExtractor={e => { return e.category_id }}
                        ListHeaderComponent={
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 20 }}>
                                <Text style={[TEXT_STYLES.gray12Text, { flexShrink: 1, alignItems: 'flex-start', marginRight: 20 }]}>{localization.select_category_for_post}</Text>
                                <View style={{ transform: [{ rotate: "180deg" }] }}>
                                    <SelectableList COLORS={COLORS} color={COLORS.smallGrayText} size={20} />
                                </View>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <SelectableCategoryInfoUi
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                                postCategoryMetadata={item}
                                isSelected={(selectedPostCategoryMetadata?.category_id ?? '') === item.category_id}
                                onPress={() => { setSelectedPostCategoryMetadata(item) }}
                            />
                        )}
                    />



                </SafeAreaView>
            </SafeAreaProvider>


        </Modal>
    )
}




interface SelectableCategoryInfoUiInterface {
    postCategoryMetadata: PostCategoryMetadata
    isSelected: boolean
    onPress: () => any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
/**
 * A selectable category with its name, post count and selectedCircle.
 * 
 * Could have categorie's view count later on & if hidden by user.
 */
const SelectableCategoryInfoUi = ({ postCategoryMetadata, isSelected, onPress, COLORS, TEXT_STYLES }: SelectableCategoryInfoUiInterface) => {
    return (
        <Pressable onPress={onPress}>
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',

                }}>

                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    minHeight: 60,
                    paddingVertical: 20,
                    flex: 1,
                    marginLeft: 20,
                    marginRight: 10
                }}>
                    <TextAndDescription
                        COLORS={COLORS}
                        TEXT_STYLES={TEXT_STYLES}
                        text={getCategoryTypeDescription(postCategoryMetadata.type, postCategoryMetadata.custom_type)}
                        description={postCategoryMetadata.post_count + " " + localization.posts}
                    />
                </View>

                <View
                    style={{
                        paddingRight: 20
                    }}>
                    <SelectedCircle COLORS={COLORS} isSelected={isSelected} />
                </View>

            </View>

        </Pressable>
    )
}

