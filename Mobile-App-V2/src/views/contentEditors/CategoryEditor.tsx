//
//  CategoryTypeSelector.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useState, useEffect, useRef } from 'react'
import getColors, { ColorsInterface } from './../../assets/Colors'
import TextStylesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'
import SelectedCircle from '../../components/ui/SelectedCircle'
import SectionAppearance from '../../components/ui/SectionAppearance'
import localization from '../../utils/localizations'
import { StatusBar, Text, View, LayoutAnimation, Pressable, FlatList, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronSymbol } from '../../components/Symbols'
import { CategoryInfo, getCategoryTypeDescription, CategoryType, InformationType } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { categoryTypesMetadata, getGroupeTypeDescriptiveText } from '../../Types'
import { InfoInput } from '../../components/ui/ForContentEditors'
import { animationCanceler, layoutAnimation } from '../../components/animations'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'
import { getErrorDescription } from '../../components/AlertsAndErrors'
import { Page, PostCategoryMetadata, PostCategoryMetadataObj, PostCategoryObj } from '../../Data'
import { putItem, getPostCategoryMetadataAttributesByCategoryId, updateProfileWithOperation } from '../../aws/dynamodb'
import { generateID } from '../../components/functions'
import { updateProfileValueWithOperation, updateProfileValueWithOperationInterface } from '../../state/slices/profilesSlice'
import { EmojiAlert } from '../../components/ui/AlertUi'

// Global data
import { useDispatch, useSelector } from 'react-redux'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { selectUiStates, updateUiStateValue, updateUiStateValuePayload } from '../../state/slices/uiStatesSlice'
import { appendPostCategories, selectPagesPostCategories, updatePostCategory } from '../../state/slices/postsSlice'



// A list of the selectable built in categories types. 
export default function CategoryEditor({ navigation, route }) {


    // States 
    const [originalCategoryMetadata, setOriginalCategoryMetadata]: [PostCategoryMetadata | undefined, any] = useState(undefined)
    //
    const [selectedCategoryInfo, setSelectedCategoryInfo]: [CategoryInfo, any] = useState(new CategoryInfo("custom", 0.5, []))
    const [selectedSubCategoryInfo, setSelectedSubCategoryInfo]: [CategoryInfo, any] = useState(undefined)
    const [scrollToIndex, setScrollToIndex]: [number, any] = useState(undefined)
    const [customCategoryType, setCustomCategoryType]: [string, any] = useState("")
    // 
    const [editedInfoType, setEditedInfoType]: [InformationType, any] = useState()
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)



    // Navigation values
    const { page } = route.params
    const { page_number, account_id } = page as Page
    const category_id = route.params.category_id



    // Values 
    const listRef = useRef(undefined)
    const insets = useSafeAreaInsets()
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)
    let useCustomCategoryTypeField = (selectedCategoryInfo?.categoryType) === "custom"
    let categoriesTypes = categoryTypesMetadata.flatMap(e => getGroupeTypeDescriptiveText(e.groupType))
    let metadataFilled =
        selectedCategoryInfo?.categoryType === "custom" ?
            customCategoryType !== ""
            :
            (selectedCategoryInfo?.categoryType ?? "") !== ""



    // Global data
    const dispatch = useDispatch()
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? '' })
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.page_number === page_number })


    let isNewCategory = (originalCategoryMetadata?.category_id ?? "") === ""

    // Initialization
    useEffect(() => {


        // custom category type 
        let oCategoryMetadata = pagePostCategories?.post_categories?.find(e => { return e.metadata.category_id === category_id })?.metadata
        let originalCategoryType = oCategoryMetadata?.type ?? ""
        setOriginalCategoryMetadata(oCategoryMetadata)




        if ((oCategoryMetadata?.type ?? "") === "custom") {
            setSelectedCategoryInfo(new CategoryInfo('custom', 0.5))
            setCustomCategoryType(oCategoryMetadata.custom_type ?? "")
            return
        }


        // Get and selct original category Info 
        let mainCategory
        let subCategory
        if ((originalCategoryType) !== "") {
            categoryTypesMetadata.forEach(categoryGroup => {

                categoryGroup.types.forEach(categoryInfo => {
                    if (categoryInfo.categoryType === originalCategoryType) { // 
                        // The 'originalCategoryType' was a 'main category' for instance 'Restauration'.
                        mainCategory = categoryInfo

                    } else { // 
                        categoryInfo.subCategoriesTypes.forEach(subCategoryInfo => {
                            if (subCategoryInfo.categoryType === originalCategoryType) {
                                // The 'originalCategoryType' was a 'sub category' nested into a 'mnain category' for instance 'casual_restaurants' from 'Restauration'.
                                mainCategory = categoryInfo
                                subCategory = subCategoryInfo

                            }
                        })
                    }
                })

            })

            setSelectedCategoryInfo(mainCategory)
            setSelectedSubCategoryInfo(subCategory)

        }





    }, [])



    // Reset
    useEffect(() => {
        if (useCustomCategoryTypeField === false) setEditedInfoType()
    }, [useCustomCategoryTypeField])



    /** Related item editing process
      *
      * - 1 - Generate a unique category_id       (if needed : category is new)
      * - 2 - Save category metadata              (if needed : category is new or its metadata has been changed)
      * - 3 - Update category_count
      * - 4 - Update UI   
      * 
      * N.B. : Checking if updates are needed avoids updating data unnecessarily which frees some bandwidth on the servers and makes the platform's operation cost lower. That could be even more improved by only updating the updated attributes rather than over writting the entire item. 
      *
    */
    async function publishCategoryMetadata() {

        // Preparation
        LayoutAnimation.configureNext(animationCanceler)
        setIsLoading(true)
        let currentDate = new Date().toISOString()
        let category_id = originalCategoryMetadata?.category_id ?? ''
        let created_date = originalCategoryMetadata?.created_date ?? currentDate
        let post_count = originalCategoryMetadata?.post_count ?? 0
        // 
        let categoryType
        let score
        if (selectedSubCategoryInfo?.categoryType !== undefined) {
            categoryType = selectedSubCategoryInfo.categoryType
            score = selectedSubCategoryInfo.score
        } else {
            categoryType = selectedCategoryInfo.categoryType
            score = selectedCategoryInfo.score
        }
        // 
        let indexesByAscendingOrder = pagePostCategories.post_categories.slice()
            // Sorted by most important index
            .sort(function (a, b) {
                if (a.metadata.c_index > b.metadata.c_index) { return -1 }
                if (a.metadata.c_index < b.metadata.c_index) { return 1 }
                return 0
            }).flatMap(e => { return e.metadata.c_index })
        let largerIndex = indexesByAscendingOrder[0] ?? 0
        let c_index = isNewCategory ? (largerIndex + 1) : originalCategoryMetadata?.c_index






        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
                // alert(JSON.stringify(jwtToken))
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }





        // Step 1 : category_id
        /**    */
        switch (isNewCategory) {
            case true:
                try {
                    category_id = await generateUniqueCategoryId()
                    console.log('Step 1 done')
                } catch (error) {
                    alert(getErrorDescription(error).message)
                    setIsLoading(false)
                    return
                }
                break
            case false: console.log('Step 1 not needed'); break
        }




        // Step 2 : save metadata 
        let postCategoryMetadata = PostCategoryMetadataObj(account_id, category_id, categoryType, score, post_count, c_index, created_date, currentDate, customCategoryType !== "" ? customCategoryType.trim() : undefined)
        /**    */
        try {
            await putItem('postCategories', postCategoryMetadata, jwtToken)
            console.log('Step 2 done')
        } catch (error) {
            alert(getErrorDescription(error).message)
            console.log('Step 2 error')
            setIsLoading(false)
            return
        }




        // Step 3 : Category_count
        if (isNewCategory) {
            await updateProfileWithOperation(account_id, "category_count", "+", 1, jwtToken)
            console.log('Step 3 done (append to UI)')
        } else {
            console.log('Step 3 not needed (append to UI)')
        }




        // Step 4 : UI
        switch (isNewCategory) {
            case true:
                dispatch(appendPostCategories({ page: page, postCategories: [PostCategoryObj(postCategoryMetadata, false, [])] })); console.log('Step 4.A done (append to UI)')
                // Only scroll to the category when she just got created --> otherwise would be too complicated to make sure that scrolling to the last ones would not push upd the scroll view 


                break
            case false: dispatch(updatePostCategory({ page: page, postCategoryMetadata: postCategoryMetadata })); console.log('Step 4.B done (update UI)'); break
        }
        // 
        if (isNewCategory) {
            // Scroll to new category
            let payload: updateUiStateValuePayload = { attribute: "editedCategoryId", value: category_id }
            dispatch(updateUiStateValue(payload))

            let payload2: updateProfileValueWithOperationInterface = { page_number: page_number, attribute: "category_count", operation: "+", ofValue: 1 }
            dispatch(updateProfileValueWithOperation(payload2))


        }





        console.log('\n-------PostCategoryMetadata succesfully published-------')
        navigation.goBack()


    }



    function generateUniqueCategoryId(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const category_id = generateID(9)

            try {
                const postCategoryMetadataAttributes = await getPostCategoryMetadataAttributesByCategoryId(category_id, "category_id")
                resolve(postCategoryMetadataAttributes === undefined ? category_id : generateUniqueCategoryId())
            } catch (error) {
                reject(error)
            }

        })
    }



    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />




                {/* 
                <HeaderWithSelectableCapsule
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'cancelText'}
                    headerText={localization.categories}
                    condition={metadataFilled}
                    buttonType={'doneText'}
                    blueWhenTappable={false}
                    onPress={() => { publishCategoryMetadata() }}
                    options={categoriesTypes}
                    setSelectedOption={(option: string) => {

                        let index = categoriesTypes.findIndex(e => e === option)
                        setScrollToIndex(index)

                        listRef.current?.scrollToIndex({ index: index, animated: true })

                    }}
                    editedInfoType={editedInfoType}
                    isLoading={isLoading}
                />
                */}
                <ClassicHeader
                    TEXT_STYLES={TEXT_STYLES}
                    COLORS={COLORS}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'cancelText'}
                    headerText={localization.categories}
                    condition={metadataFilled}
                    displayOkButtonWhenInfoEdited
                    buttonType={'doneText'}
                    blueWhenTappable={false}
                    onPress={() => { publishCategoryMetadata() }}
                    editedInfoType={editedInfoType}
                    isLoading={isLoading}
                />


                <FlatList
                    ref={listRef as any}
                    data={categoryTypesMetadata}
                    keyExtractor={e => { return e.groupType }}
                    style={{ backgroundColor: COLORS.whiteGray }}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 35 }}
                    keyboardDismissMode={"on-drag"}
                    keyboardShouldPersistTaps={"always"}
                    // Scrolls to index
                    onScrollToIndexFailed={info => {
                        // Scrolls to the post when the page appears as it does not works the first time.
                        const wait = new Promise(resolve => setTimeout(resolve, 1));
                        wait.then(() => {
                            (listRef.current as any)?.scrollToIndex({ index: scrollToIndex, animated: false })
                        })
                    }}
                    renderItem={({ item, index }) => (
                        <SectionAppearance
                            TEXT_STYLES={TEXT_STYLES}
                            COLORS={COLORS}
                            text={getGroupeTypeDescriptiveText(item.groupType)}
                            marginTop={35}
                            backgroundColor={COLORS.whiteGray}
                            children={
                                item.types
                                    // Sorted by most relevant 
                                    .sort(function (a, b) {
                                        if (a.score > b.score) { return -1 }
                                        if (a.score < b.score) { return 1 }
                                        return 0
                                    })
                                    .map((categoryInfo) => {
                                        return (
                                            <View key={categoryInfo.categoryType}>
                                                <SelectionGroup
                                                    categoryInfo={categoryInfo}
                                                    selectedCategoryInfo={selectedCategoryInfo}
                                                    selectedSubCategoryInfo={selectedSubCategoryInfo}
                                                    setSelectedCategoryInfo={setSelectedCategoryInfo}
                                                    setSelectedSubCategoryInfo={setSelectedSubCategoryInfo}
                                                    COLORS={COLORS}
                                                    TEXT_STYLES={TEXT_STYLES}
                                                />

                                                {((categoryInfo.categoryType === "custom") && useCustomCategoryTypeField) &&
                                                    <View style={{ backgroundColor: COLORS.whiteToGray2, paddingHorizontal: 20 }}>
                                                        <InfoInput
                                                            TEXT_STYLES={TEXT_STYLES}
                                                            COLORS={COLORS}
                                                            text={customCategoryType}
                                                            setText={setCustomCategoryType}
                                                            style={"none"}
                                                            infoType={"custom_category"}
                                                            editedInfoType={editedInfoType}
                                                            setEditedInfoType={setEditedInfoType}
                                                            doneReturnKey={false}
                                                            autoCapitalize={"sentences"}
                                                            focusOnAppear={true}
                                                            focusDelay={400}
                                                        />
                                                    </View>
                                                }
                                            </View>
                                        )
                                    })
                            }
                        />
                    )}
                />




            </SafeAreaView>


            {/* Modals */}
            <EmojiAlert TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} />


        </SafeAreaProvider>
    )
}









interface SelectionGroup {
    categoryInfo: CategoryInfo
    selectedCategoryInfo: CategoryInfo
    selectedSubCategoryInfo: CategoryInfo
    setSelectedCategoryInfo: any
    setSelectedSubCategoryInfo: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
function SelectionGroup({ categoryInfo, selectedCategoryInfo, selectedSubCategoryInfo, setSelectedCategoryInfo, setSelectedSubCategoryInfo, COLORS, TEXT_STYLES }: SelectionGroup) {


    // Values
    let selectedCategoryType = selectedCategoryInfo?.categoryType ?? ""



    function handlePress(type, score, isSubtype) {

        LayoutAnimation.configureNext(layoutAnimation)


        if (isSubtype) {
            // Reset / Select value
            let selectedCategoryType = selectedSubCategoryInfo?.categoryType ?? ""
            let isSelected = selectedCategoryType !== ""
            let isSameType = selectedCategoryType === type


            if (isSelected && isSameType) {
                setSelectedSubCategoryInfo(null)
            } else {
                setSelectedSubCategoryInfo(new CategoryInfo(type, score))
            }

        } else {
            let selectedCHasSameType = selectedCategoryType === type


            // Reset / Select value
            setSelectedSubCategoryInfo(null)


            if (selectedCHasSameType) {
                // The user closes the opened type.
                setSelectedCategoryInfo(null)
            }
            else {
                setSelectedCategoryInfo(new CategoryInfo(type, score)) // The user selects an other type or  // The user selects a type (from initially no selection)
            }

        }
    }



    return (
        <View style={{ backgroundColor: COLORS.whiteToGray2 }}>
            <SelectableCategoryType
                categoryType={categoryInfo.categoryType}
                score={categoryInfo.score}
                selectedCategoryInfo={selectedCategoryInfo}
                selectedSubCategoryInfo={selectedSubCategoryInfo}
                hasSubCategoriesTypes={categoryInfo.subCategoriesTypes.length > 0}
                handlePress={handlePress}
                isSubtype={false}
                marginLeft={20}
                COLORS={COLORS}
                TEXT_STYLES={TEXT_STYLES}
            />



            {/* Subtypes */}
            {categoryInfo.categoryType === selectedCategoryType &&
                <CategorySubtypes
                    key={categoryInfo.categoryType}
                    categoryInfo={categoryInfo}
                    selectedCategoryInfo={selectedCategoryInfo}
                    selectedSubCategoryInfo={selectedSubCategoryInfo}
                    handlePress={handlePress}
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                />
            }
        </View>
    )
}






interface CategorySubtypesInterface {
    categoryInfo: CategoryInfo
    selectedCategoryInfo: CategoryInfo
    selectedSubCategoryInfo: CategoryInfo
    handlePress: any
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
function CategorySubtypes({ categoryInfo, selectedCategoryInfo, selectedSubCategoryInfo, handlePress, COLORS, TEXT_STYLES }: CategorySubtypesInterface) {
    return (
        <View>
            {categoryInfo.subCategoriesTypes
                // Sorted by most relevant 
                .sort(function (a, b) {
                    if (a.score > b.score) { return -1 }
                    if (a.score < b.score) { return 1 }
                    return 0
                })
                .map((item) => {
                    return (
                        <View key={item.categoryType}>
                            <SelectableCategoryType
                                categoryType={item.categoryType}
                                score={item.score}
                                selectedCategoryInfo={selectedCategoryInfo}
                                selectedSubCategoryInfo={selectedSubCategoryInfo}
                                hasSubCategoriesTypes={false}
                                handlePress={handlePress}
                                isSubtype={true}
                                marginLeft={40}
                                COLORS={COLORS}
                                TEXT_STYLES={TEXT_STYLES}
                            />
                        </View>
                    )
                })
            }
        </View>
    )
}





// A selectable category with its name and selectedCircle.
interface SelectableCategoryTypeInterface {
    categoryType: CategoryType,
    score: number,
    selectedCategoryInfo: CategoryInfo,
    selectedSubCategoryInfo: CategoryInfo,
    handlePress: any,
    hasSubCategoriesTypes: boolean
    isSubtype: boolean,
    marginLeft: number,
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
const SelectableCategoryType = ({ categoryType, score, selectedCategoryInfo, selectedSubCategoryInfo, handlePress, hasSubCategoriesTypes, isSubtype, marginLeft, COLORS, TEXT_STYLES }: SelectableCategoryTypeInterface) => {

    // UI States values
    let isSelected = categoryType === (selectedCategoryInfo?.categoryType ?? "")
    let isSubtypeSelected = categoryType === (selectedSubCategoryInfo?.categoryType ?? "")


    return (
        <Pressable
            onPress={() => { handlePress(categoryType, score, isSubtype, hasSubCategoriesTypes) }}
            style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                paddingRight: 20,
            }}>




            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    flex: 1,
                    paddingRight: 20,
                    height: 60,
                }}>

                {/* Category */}
                <Text
                    numberOfLines={1}
                    // adjustsFontSizeToFit issues on android : makes (really) small even when not needed
                    style={[TEXT_STYLES.callout, { color: COLORS.black, marginLeft: marginLeft }]}
                >{getCategoryTypeDescription(categoryType, "")}</Text>



                {/* Chevron */}
                {hasSubCategoriesTypes &&
                    <View style={{
                        marginLeft: 14,
                        transform: [{ rotate: isSelected ? "90deg" : "0deg" }]
                    }}>
                        <ChevronSymbol />
                    </View>
                }

            </View>


            <SelectedCircle isSelected={isSubtype ? isSubtypeSelected : isSelected} COLORS={COLORS} />


        </Pressable>
    )
}
