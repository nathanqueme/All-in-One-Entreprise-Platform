//
//  PostCategoriesOrderEditor.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import getColors, { ColorsInterface } from './../../assets/Colors'
import TextStylesProvider, { TextStylesInterface } from '../../components/styles/TextStyles'
import TextAndDescription from '../../components/ui/TextAndDescription'
import localization from '../../utils/localizations'
import SortableList from 'react-native-sortable-list'
import { updatePostCategoryIndex } from '../../aws/dynamodb'
import { HandDragSymbol, ReorderSymbol } from '../../components/Symbols'
import { StatusBar, Text, View, Animated, Easing, Platform, useColorScheme } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { getCategoryTypeDescription } from '../../Types'
import { ClassicHeader } from '../../components/Headers'
import { ItemIndex, ItemIndexObj, PostCategoryMetadata } from '../../Data'
import { getJwtToken, refreshAndUpdateUserJwtToken } from '../../aws/cognito'
import { getErrorDescription } from '../../components/AlertsAndErrors'

// Global data
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates } from '../../state/slices/uiStatesSlice'
import { selectPagesPostCategories, updatePostCategoryMetadataAttribute, UpdatePostCategoryMetadataAttributePayload } from '../../state/slices/postsSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { ScreenViewTracker } from '../../analytics'



/**
 * A list of all the user's custom categories that can be dragged to be ordered.
 */
const PostCategoriesOrderEditor = ({ navigation, route }) => {

    /** 
     * An array with the position of each item 
     * 
     * starts with [0, 1, 2, 3]
     * can end like [2, 3, 0, 1]
     * 
     * with the number as the original index of the item.
     * 
    */
    const [newIndexes, setNewIndexes]: [number[], any] = useState([])
    const [sortedPostCategoriesMetadata, setSortedPostCategoriesMetadata]: [PostCategoryMetadata[], any] = useState([])
    // 
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)



    // Navigation values
    const page = route.params.page


    // Values
    const color_scheme = useColorScheme()
    const is_in_dark_color_scheme = color_scheme === "dark"
    const COLORS = getColors("detect_and_handle_scheme_changes")
    const TEXT_STYLES = TextStylesProvider.getStyles(COLORS)


    // Global data 
    const dispatch = useDispatch()
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.page_number === page?.page_number ?? "" })
    const pagePostCategoriesMetadata = useSelector(selectPagesPostCategories).find(e => { return e.page.page_number === page?.page_number ?? "" })?.post_categories?.flatMap(e => { return e.metadata })?.slice()
        /**
         * Sorted by most descending index
         * See on "ProfilePage" for explanations
        */
        .sort(function (a, b) {
            if (a.c_index > b.c_index) { return -1; }
            if (a.c_index < b.c_index) { return 1; }
            return 0;
        })



    // Arrays of account_id + index 
    let categoriesIndexes = sortedPostCategoriesMetadata.reverse() // See "ProfilePage" descending order explanation
        .flatMap((e: PostCategoryMetadata, index: number) => {
            return ItemIndexObj(e.category_id, index)
        })
    //
    let metadataWasChanged = (sortedPostCategoriesMetadata.length > 0)






    const renderRow = useCallback(({ data, active }) => {
        return <DraggablePostCategoryUi data={data} active={active} COLORS={COLORS} TEXT_STYLES={TEXT_STYLES}/>
    }, [])



    // Gets the new order of the array 
    useEffect(() => {

        let updatedArray: PostCategoryMetadata[] = []
        newIndexes.forEach((e: number) => {
            let item = pagePostCategoriesMetadata[e]
            updatedArray.push(item)

            if (updatedArray.length === pagePostCategoriesMetadata.length) setSortedPostCategoriesMetadata(updatedArray)

        }, [newIndexes])

    }, [newIndexes])






    /**
     * - 1 - Batch save the the indexes
     * - 2 - Batch update Ui
     */
    async function updateCategoriesOrders() {

        // Preparation
        setIsLoading(true)
        let account_id = pagePostCategoriesMetadata[0].account_id




        // Makes sure the token was refreshed 
        let jwtToken = ""
        if (jwtTokenWasRefreshed) {
            jwtToken = await getJwtToken()
        } else {
            try {
                jwtToken = await refreshAndUpdateUserJwtToken(pageAccountMainData.account_main_data.username, dispatch)
            } catch (error) {
                alert(getErrorDescription(error).message)
                setIsLoading(false)
                return
            }
        }



        // 1
        // Try with the first one --> tests that there is no internet connection issues 
        let firstCategory = categoriesIndexes[0]
        try {
            await updatePostCategoryIndex(account_id, firstCategory.unique_id, firstCategory.index, jwtToken)
        } catch (error) {
            alert(getErrorDescription(error).message)
            setIsLoading(false)
            return
        }


        // All others 
        let otherCategoriesIndexes = [...categoriesIndexes] // Shallow copy 
        otherCategoriesIndexes.splice(0, 1)
        otherCategoriesIndexes.forEach(async (e: ItemIndex) => {
            try {
                await updatePostCategoryIndex(account_id, e.unique_id, e.index, jwtToken)
            } catch (error) {
                console.log(error)
            }
        })
        console.log("Step 1 done")




        // 2 
        categoriesIndexes.forEach((e: ItemIndex) => {
            let playload: UpdatePostCategoryMetadataAttributePayload = { page: page, category_id: e.unique_id, attribute: "c_index", value: e.index }
            dispatch(updatePostCategoryMetadataAttribute(playload))
        })
        setIsLoading(false)
        navigation.goBack()
        console.log("Step 2 done")



    }




    return (
        <SafeAreaProvider>
            <ScreenViewTracker screen_name={"post_categories_sorter"} />
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.whiteToGray2 }} edges={['top', 'right', 'left', 'bottom']}>
                <StatusBar
                    barStyle={is_in_dark_color_scheme ? "light-content" : "dark-content"}
                    backgroundColor={COLORS.clear}
                    translucent
                />


                <ClassicHeader
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    onClose={() => { navigation.goBack() }}
                    closeButtonType={'closeText'}
                    headerText={localization.yout_categories}
                    buttonType={'doneText'}
                    onPress={() => { updateCategoriesOrders() }}
                    condition={metadataWasChanged}
                    isLoading={isLoading}
                />




                <SortableList
                    data={pagePostCategoriesMetadata}
                    contentContainerStyle={{
                        height: "100%"
                    }}
                    renderHeader={() => {
                        return (
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 20 }}>
                                <Text style={[TEXT_STYLES.gray12Text, { flexShrink: 1, alignItems: 'flex-start', marginRight: 20 }]}>{localization.drag_categories_in_order_you_want}</Text>
                                <HandDragSymbol COLORS={COLORS} color={COLORS.smallGrayText} size={18} />
                            </View>
                        )
                    }}
                    renderRow={renderRow}
                    onReleaseRow={(key, currentOrder: number[]) => {
                        setNewIndexes(currentOrder)
                    }}
                />




            </SafeAreaView>
        </SafeAreaProvider>
    )
}


export default PostCategoriesOrderEditor





interface DraggablePostCategoryUiInterface {
    active: any
    data: PostCategoryMetadata
    COLORS: ColorsInterface
    TEXT_STYLES: TextStylesInterface
}
const DraggablePostCategoryUi = ({ active, data, COLORS, TEXT_STYLES }: DraggablePostCategoryUiInterface) => {



    const activeAnim = useRef(new Animated.Value(0));
    const scaleUpStyle = useMemo(
        () => ({
            transform: [
                {
                    scale: activeAnim.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.07],
                    }),
                }
            ],
        }),
        [],
    )



    // Animation
    useEffect(() => {
        Animated.timing(activeAnim.current, {
            duration: 300,
            easing: Easing.ease,
            toValue: Number(active),
            useNativeDriver: true,
        }).start();
    }, [active])



    return (
        <Animated.View style={[
            scaleUpStyle,
            {
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 60,
                padding: 20,
                width: "100%",
                backgroundColor: COLORS.whiteToGray2,

                // Shadow
                shadowOffset: { height: 5, width: 5 },
                shadowRadius: 15,
                ...Platform.select({
                    ios: {
                        shadowColor: 'rgba(0,0,0,0.1)',
                        shadowOpacity: active ? 1 : 0,
                    },
                    android: {
                        elevation: active ? 15 : 0,
                    },
                }),
            }
        ]}>
            <View style={{ flex: 1, marginRight: 20 }}>
                <TextAndDescription
                    COLORS={COLORS}
                    TEXT_STYLES={TEXT_STYLES}
                    text={getCategoryTypeDescription(data.type, data.custom_type)}
                    description={data.post_count + " " + localization.posts}
                />
            </View>


            <ReorderSymbol COLORS={COLORS} color={COLORS.smallGrayText} />

        </Animated.View >
    )
}

