//
//  Headers.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on the 02/01/22 - 05/31/22.
//

import React, { useRef } from 'react'
import { Text, View, Keyboard, ActivityIndicator, Pressable, Animated, FlatList, Dimensions, FlexAlignType } from 'react-native'
import Divider from './ui/Divider'
import CirclePhoto from './ui/CirclePhoto'
import CapsuleText from './ui/CapsuleText'
import localization from '../utils/localizations'
import { AccountMainData } from '../Data'
import { LoadingBar } from './ui/LoadingBar'
import { ColorsInterface } from './../assets/Colors'
import { HeaderButton, HeaderCloseButton } from './Buttons'
import { CertificationBadge, ChevronLeftSymbol } from './Symbols'
import { HeaderCloseButtonType, HeaderButtonType, getInfoMetada, InformationType } from '../Types'
import { TextStylesInterface } from './styles/TextStyles'



// Classic headers______________________________________________________________________
//
//
//


interface ClassicHeaderInterface {
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   onClose: () => any
   closeButtonType?: HeaderCloseButtonType
   headerText: string
   condition?: boolean
   blueWhenTappable?: boolean
   onPress?: () => any
   editedInfoType?: InformationType
   setEditedInfoType?: any
   buttonType?: HeaderButtonType
   isLoading?: boolean
   displayOkButtonWhenInfoEdited?: boolean
   hideCancelButtonWhenLoading?: boolean
   showDivider?: boolean
   makeTextFit?: boolean
   progress?: Animated.Value
   hideLoadingIndicator?: boolean
   backgroundColor?: string
   textColor?: string
   loadingBarColor?: string
   dividerColor?: string
}
/** 
 * A header with a close button, a title and if needed a button that replaces itself by a OK when the user is typing text.
*/
export function ClassicHeader({
   COLORS,
   TEXT_STYLES,
   onClose,
   closeButtonType = 'chevronLeft',
   headerText,
   condition = true,
   blueWhenTappable = false,
   onPress,
   editedInfoType,
   setEditedInfoType,
   buttonType,
   isLoading,
   displayOkButtonWhenInfoEdited,
   hideCancelButtonWhenLoading = true,
   showDivider = true,
   makeTextFit = false,
   progress,
   hideLoadingIndicator = false,
   backgroundColor = COLORS.whiteToGray2,  // mainly used for changing it to COLORS.whiteToGray
   textColor = COLORS.black,
   loadingBarColor = undefined,
   dividerColor = undefined,
}: ClassicHeaderInterface) {


   // Values
   const showOkButton = (editedInfoType ?? "") !== "" && (displayOkButtonWhenInfoEdited)
   const screenWidth = Dimensions.get('screen').width
   const hasAButton = typeof buttonType !== 'undefined'

   return (
      <View style={{ backgroundColor: backgroundColor, flexDirection: 'column', justifyContent: 'center' }}>
         <View style={{ flexDirection: 'row', height: 44.5, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20 }}>



            {/* 
               It would be nice that when the keyboard is active this button is hidden 
               But doing so does a glitch sometimes
               --> when the user edits an other informations for instance goes from editing a "name" to a "description", the glitch occurs during the transition.
            */}
            {((hideCancelButtonWhenLoading ? (isLoading && !hideLoadingIndicator) : false) || ((closeButtonType ?? "") === "")) ?
               <View
                  // Needed so that the button at the rigth stays at the right 
                  style={{ width: 10 }} />
               :
               <HeaderCloseButton
                  COLORS={COLORS}
                  TEXT_STYLES={TEXT_STYLES}
                  onClose={onClose}
                  closeButtonType={closeButtonType as HeaderCloseButtonType}
                  color={textColor}
               />
            }





            {(hasAButton || showOkButton || (isLoading && !hideLoadingIndicator)) ?
               ((isLoading && !hideLoadingIndicator) ?
                  progress === undefined &&
                  <ActivityIndicator color={textColor} />
                  :
                  <HeaderButton
                     COLORS={COLORS}
                     TEXT_STYLES={TEXT_STYLES}
                     onPress={showOkButton ? () => { Keyboard.dismiss(); if (setEditedInfoType !== undefined) setEditedInfoType(undefined) } : onPress}
                     buttonType={showOkButton ? "okText" : buttonType}
                     blueWhenTappable={blueWhenTappable}
                     condition={condition}
                     color={textColor}
                  />)
               :
               null
            }


         </View>



         <Text
            numberOfLines={1}
            ellipsizeMode='tail'
            adjustsFontSizeToFit={makeTextFit}
            style={[TEXT_STYLES.headerText, { marginHorizontal: 60, minWidth: "47%", color: textColor }]}
         >{editedInfoType ?
            getInfoMetada(editedInfoType)?.name ?? localization.value
            :
            headerText
            }</Text>





         {showDivider &&
            <View style={{ width: screenWidth }}>
               <Divider color={dividerColor} COLORS={COLORS} />
               {(progress !== undefined) &&
                  <LoadingBar
                     isLoading={isLoading}
                     progress={progress}
                     backgroundColor={loadingBarColor}
                     COLORS={COLORS}
                  />
               }
            </View>
         }


      </View >
   )
}






interface TitleAndSubTitleInterface {
   title: string
   description: string
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   descriptionButtonText?: string
   onPress?: any
}
/** 
   A large title and a gray explanation at its bottom.
   -> Used in account creation pages.
 */
export function TitleAndSubTitle({ title, description, COLORS, TEXT_STYLES, descriptionButtonText, onPress }: TitleAndSubTitleInterface) {
   return (
      <View>


         <Text style={[
            TEXT_STYLES.titleText, {
               color: COLORS.black
            }]}>{title}</Text>


         <Pressable onPress={onPress}>
            <Text style={[
               TEXT_STYLES.gray13Text, {
                  paddingHorizontal: 40,
                  paddingTop: 10,
                  textAlign: 'center'
               }]}>{description}<Text
                  style={{
                     color: COLORS.darkBlue,
                     fontSize: 15,
                     fontWeight: '500'
                  }}> {descriptionButtonText ? descriptionButtonText : ''}</Text></Text>
         </Pressable>


      </View>
   )
}






interface HeaderWithSelectableCapsuleInterface {
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   onClose: any
   closeButtonType?: HeaderCloseButtonType
   headerText: string
   condition?: boolean
   blueWhenTappable?: boolean
   onPress?: any
   buttonType?: HeaderButtonType
   options: string[]
   setSelectedOption: any
   editedInfoType?: InformationType,
   isLoading?: boolean
}
/**
 * A classic header with an horizontal list of selectable 'CapsuleText'. 
 * 
 * 'HeaderWithSelectableCapsule' height is of 92.
 * 
 */
export function HeaderWithSelectableCapsule({
   COLORS,
   TEXT_STYLES,
   onClose,
   closeButtonType = 'chevronLeft',
   headerText,
   condition = true,
   blueWhenTappable = true,
   onPress,
   buttonType,
   options,
   setSelectedOption,
   editedInfoType,
   isLoading = false,
}: HeaderWithSelectableCapsuleInterface) {

   // Values
   const listRef = useRef(undefined)


   return (
      <View style={{ height: 92 }}>
         <ClassicHeader
            TEXT_STYLES={TEXT_STYLES}
            COLORS={COLORS}
            onClose={onClose}
            closeButtonType={closeButtonType}
            headerText={headerText}
            blueWhenTappable={blueWhenTappable}
            buttonType={buttonType}
            onPress={onPress}
            showDivider={false}
            condition={condition}
            editedInfoType={editedInfoType}
            isLoading={isLoading}
            displayOkButtonWhenInfoEdited
         />



         <FlatList
            ref={listRef}
            data={options}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={Item => { return Item }}
            renderItem={({ item, index }) => (
               <Pressable
                  style={{
                     marginLeft: index === 0 ? 20 : 0,
                     marginRight: index === options.length - 1 ? 20 : 8
                  }}
                  onPress={() => {
                     setSelectedOption(item)
                     listRef.current?.scrollToIndex({ index: index, animated: true, viewOffset: 20 })
                  }}
               >
                  <CapsuleText text={item} marginBottom={8} COLORS={COLORS}  TEXT_STYLES={TEXT_STYLES}/>
               </Pressable>
            )}
         />



         <View style={{ width: Dimensions.get('screen').width }}>
            <Divider COLORS={COLORS} />
         </View>
      </View>
   )
}









interface ProfilePageHeaderInterface {
   username: string
   navigationUsername: string
   onClosePress: any
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
}
export function ProfilePageHeader({ username, navigationUsername, onClosePress, COLORS, TEXT_STYLES }: ProfilePageHeaderInterface) {
   return (
      <View
         style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: COLORS.whiteToGray2,
            height: 38.5,
            paddingHorizontal: 20,
         }}>


         <Pressable
            onPress={onClosePress}
            style={{
               justifyContent: "center",
               alignItems: 'center',
               flexDirection: 'row',
            }}>

            <ChevronLeftSymbol COLORS={COLORS} />

            <Text
               numberOfLines={1}
               style={[TEXT_STYLES.bold19, {
                  paddingLeft: 14,
                  color: COLORS.black,
                  marginTop: -2
               }]}
            >{(username !== "") ? username : navigationUsername}</Text>
         </Pressable>


         {/* May have buttons here in futur versions*/}



      </View>
   )
}

















// Content editors headers______________________________________________________________________
// 
// 
// 
interface ProfilePhotoEditorHeaderInterface {
   onClose: any
   onCancelImageChange: any
   onPressEdit: any
   onPress: any
   isLoading: boolean
   isDeleting: boolean
   imageModified: boolean
   progress: Animated.Value
   anImageIsSelected: boolean
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
}
export function ProfilePhotoEditorHeader({
   onClose,
   onCancelImageChange,
   onPressEdit,
   onPress,
   isLoading,
   isDeleting,
   imageModified,
   progress,
   anImageIsSelected,
   COLORS,
   TEXT_STYLES
}: ProfilePhotoEditorHeaderInterface) {

   return (
      <View style={{
         backgroundColor: '#202124', // black color of whiteToGray2
         flexDirection: 'column',
         justifyContent: 'center'
      }}>
         <View style={{ flexDirection: 'row', height: 44.5, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20 }}>



            <View style={{ opacity: !isLoading && !isDeleting ? 1 : 0 }} >
               {imageModified ?
                  <HeaderCloseButton TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} onClose={onCancelImageChange} closeButtonType={'cancelText'} color={"white"} />
                  :
                  <HeaderCloseButton TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} onClose={onClose} closeButtonType={'xmark'} color={"white"} />
               }
            </View>




            {isDeleting || isLoading ?
               <ActivityIndicator />
               :
               (imageModified ?
                  <HeaderButton
                     TEXT_STYLES={TEXT_STYLES}
                     COLORS={COLORS}
                     onPress={onPress}
                     buttonType={'doneText'}
                     condition={anImageIsSelected}
                     color={"white"}
                  />
                  :
                  (anImageIsSelected ?
                     <HeaderButton
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        onPress={onPressEdit}
                        buttonType={'ellipsisSymbol'}
                        color={"white"}
                     />
                     :
                     null
                  )
               )
            }



         </View>

         <Text
            numberOfLines={2}
            ellipsizeMode='tail'
            style={[TEXT_STYLES.headerText, { color: "white" }]}
         >{localization.photo}</Text>




         <Divider COLORS={COLORS} color="white" />


         <LoadingBar
            isLoading={isLoading}
            progress={progress}
            COLORS={COLORS}
            backgroundColor={'#303134'} // dark color of light gray 
         />




      </View >
   )
}














// Pages headers______________________________________________________________________
// 
// 
// 




interface EditablePageHeaderInterface {
   onClose: () => any
   onPress: () => any
   editingMode: boolean
   isUserAccount: boolean
   accountMainData: AccountMainData
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   description?: string
   withCancelButton?: boolean
   closeButtonType?: HeaderCloseButtonType
   isLoading?: boolean
   condition?: boolean
   hideEditButtonWhenNotEditing?: boolean // Used for the PdfInfo page 
   blackSchemeAppearance?: boolean
}
export function EditablePageHeader({
   onClose,
   onPress,
   editingMode = false,
   isUserAccount,
   accountMainData,
   COLORS,
   TEXT_STYLES,
   description,
   withCancelButton = false,
   closeButtonType = "chevronLeft",
   isLoading = false,
   condition = true,
   hideEditButtonWhenNotEditing = false,
   blackSchemeAppearance = false
}: EditablePageHeaderInterface) {
   return (
      <View style={{ backgroundColor: blackSchemeAppearance ? COLORS.bgDarkGray : COLORS.whiteToGray2, flexDirection: 'column', justifyContent: 'center' }}>
         <View style={{ flexDirection: 'row', height: 44.5, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20 }}>


            {/* Close button */}
            {!editingMode || withCancelButton ?
               (isLoading ?
                  <View style={{ width: 10, height: 10, backgroundColor: COLORS.clear }} />
                  :
                  <HeaderCloseButton TEXT_STYLES={TEXT_STYLES} COLORS={COLORS} onClose={onClose} closeButtonType={editingMode ? "cancelText" : closeButtonType} color={blackSchemeAppearance ? "white" : COLORS.black} />
               )
               :
               null
            }



            {/* Confirm button */}
            {isUserAccount &&
               (editingMode ?
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                     {/* Need to be pushed to the right as the close button disappears */}
                     {isLoading ?
                        <ActivityIndicator />
                        :
                        <HeaderButton
                           TEXT_STYLES={TEXT_STYLES}
                           COLORS={COLORS}
                           onPress={onPress}
                           buttonType={'doneText'}
                           condition={condition}
                           blueWhenTappable={false}
                           color={blackSchemeAppearance ? "white" : COLORS.black}
                        />
                     }
                  </View>
                  :
                  (
                     hideEditButtonWhenNotEditing ?
                        null
                        :
                        <HeaderButton
                           TEXT_STYLES={TEXT_STYLES}
                           COLORS={COLORS}
                           onPress={onPress}
                           buttonType={'editText'}
                           condition={condition}
                           blueWhenTappable={false}
                           color={blackSchemeAppearance ? "white" : COLORS.black}
                        />
                  )
               )
            }


         </View>






         {editingMode ?
            <Text
               numberOfLines={1}
               ellipsizeMode='tail'
               style={[TEXT_STYLES.headerText, { color: blackSchemeAppearance ? "white" : COLORS.black }]}
            >{localization.modification}</Text>
            :
            <View style={{ marginHorizontal: 60, position: 'absolute' }}>
               <AccountProfilePhotoAndName
                  accountMainData={accountMainData}
                  description={description}
                  COLORS={COLORS}
                  TEXT_STYLES={TEXT_STYLES}
                  color={blackSchemeAppearance ? "white" : COLORS.black}
               />
            </View>
         }






         <Divider COLORS={COLORS} />

      </View >
   )
}



interface AccountProfilePhotoAndNameInterface {
   accountMainData: AccountMainData
   description: string
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   color?: string
}
/** A component for headers that displays the profile photo, name and certification badge of businesses. 
*/
export function AccountProfilePhotoAndName({ accountMainData, description, COLORS, TEXT_STYLES, color = COLORS.black }: AccountProfilePhotoAndNameInterface) {

   let base64 = accountMainData?.image_data?.base64 ?? ''
   let certified = accountMainData?.certified ?? false

   return (
      <View style={[{ alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row' }]}>
         <CirclePhoto
            base64={base64}
            widthAndHeight={34}
            displayLetterIfNoPhoto={accountMainData?.account_name?.slice(0, 1) ?? ""}
            COLORS={COLORS}
            TEXT_STYLES={TEXT_STYLES}
         />
         <View style={{ width: 14, opacity: 0 }} />
         <HeaderTextWithDescriptiveText
            COLORS={COLORS}
            headertext={accountMainData?.account_name ?? ''}
            descriptiveText={description}
            alignItems={'flex-start'}
            certificationBadge={certified}
            color={color}
         />
      </View>
   )
}











interface PostsPageHeaderInterface {
   onClose: any
   headertext: string
   percentageOfCategoryMainInfoHidden: any
   isUserAccount: boolean
   isDeleting: boolean
   COLORS: ColorsInterface
   TEXT_STYLES: TextStylesInterface
   onAddPostPress?: any
   onPress?: any
}
export function PostsPageHeader({
   onClose,
   headertext,
   percentageOfCategoryMainInfoHidden,
   isUserAccount,
   isDeleting,
   COLORS,
   TEXT_STYLES,
   onAddPostPress,
   onPress,
}: PostsPageHeaderInterface) {
   return (
      <View
         style={{
            backgroundColor: COLORS.whiteToGray2,
            justifyContent: 'center'
         }}>
         <View
            style={{
               flexDirection: 'row',
               height: 44.5,
               alignItems: 'center',
               justifyContent: 'space-between',
               marginHorizontal: 20
            }}>


            {/* ChevronLeft */}
            {isDeleting ?
               <View style={{ // Done so that the buttons at the right stay when the go back button disappears
                  width: 10,
                  height: 10,
                  backgroundColor: COLORS.clear
               }} />
               :
               <HeaderCloseButton
                  TEXT_STYLES={TEXT_STYLES}
                  COLORS={COLORS}
                  onClose={onClose}
                  closeButtonType={'chevronLeft'}
               />
            }




            {/* Add post + Ellipsis symbol */}
            {isUserAccount &&
               <View
                  style={{
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}>

                  <View style={{ paddingRight: 18 }}>
                     <HeaderButton
                        TEXT_STYLES={TEXT_STYLES}
                        COLORS={COLORS}
                        onPress={onAddPostPress}
                        buttonType={'addSymbol'}
                     />
                  </View>


                  <View>
                     <View style={{ opacity: isDeleting ? 0 : 1 }}>
                        <HeaderButton
                           TEXT_STYLES={TEXT_STYLES}
                           COLORS={COLORS}
                           onPress={onPress}
                           buttonType={'ellipsisSymbol'}
                           condition={isDeleting === false}
                        />
                     </View>


                     <View
                        pointerEvents="none"
                        style={{ opacity: isDeleting ? 1 : 0, position: "absolute" }}>
                        <ActivityIndicator />
                     </View>
                  </View>


               </View>
            }
         </View>



         <Animated.View
            pointerEvents={'none'}  // Avoids the view to disable gestures 
            style={{
               opacity: percentageOfCategoryMainInfoHidden,
               justifyContent: 'center',
               alignContent: 'center',
               position: 'absolute',
               left: 0,
               right: 0,
               height: 44.5,
               paddingHorizontal: isUserAccount ? 70 : 50
            }}>
            {
               <Text
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  style={[TEXT_STYLES.headerText, { color: COLORS.black }]}
               >{headertext}</Text>
            }
         </Animated.View>


      </View >
   )
}







interface HeaderTextWithDescriptiveTextInterface {
   headertext: string
   descriptiveText: string
   alignItems: FlexAlignType
   COLORS: ColorsInterface
   certificationBadge?: boolean
   color?: string
}
/**
 * Displays the header with a description at the bottom if any 
 */
function HeaderTextWithDescriptiveText({ headertext, descriptiveText, alignItems, COLORS, certificationBadge = false, color = COLORS.black }: HeaderTextWithDescriptiveTextInterface) {
   return (
      <View style={{ alignItems: alignItems }}>

         {/* Header + badge */}
         <View style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
         }}>

            <Text
               numberOfLines={1}
               ellipsizeMode='tail'
               style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: color,
               }}
            >{headertext}
            </Text>


            {certificationBadge &&
               <View style={{ paddingLeft: 4 }}>
                  <CertificationBadge small={true} COLORS={COLORS} />
               </View>
            }
         </View>


         {/* Gray description */}
         {(descriptiveText ?? "") !== "" &&
            <Text
               numberOfLines={1}
               ellipsizeMode='tail'
               style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: COLORS.smallGrayText
               }}>{descriptiveText?.toUpperCase()}
            </Text>
         }


      </View>
   )
}


