import React from 'react'
import Colors from '../../assets/Colors'
import CirclePhoto from '../CirclePhoto'
import Divider from '../Divider'
import TextStyles from '../../styles/TextStyles'
import localization from '../../utils/localizations'
import ActivityIndicator from '../ActivityIndicator'
import { AccountMainData } from '../../Data'
import { HeaderCloseButtonType } from '../../Types'
import { HeaderButton, HeaderCloseButton } from '../Buttons'
import { getFileName } from '../functions'
import { CertificationBadgeIcon } from '../Icons'



interface EditablePageHeaderInterface {
    onClose: () => any
    onClick: () => any
    editingMode: boolean
    isUserAccount: boolean
    accountMainData: AccountMainData
    description?: string
    withCancelButton?: boolean
    closeButtonType?: HeaderCloseButtonType
    isLoading?: boolean
    condition?: boolean
    hideEditButtonWhenNotEditing?: boolean // Used for the PdfInfo page 
    sticky?: boolean
}
export function EditablePageHeader({
    onClose,
    onClick,
    editingMode = false,
    isUserAccount,
    accountMainData,
    description,
    withCancelButton = false,
    closeButtonType = "chevronLeft",
    isLoading = false,
    condition = true,
    hideEditButtonWhenNotEditing = false,
    sticky = false
}: EditablePageHeaderInterface) {
    return (
        <div className={`justify-center items-center relative w-full ${sticky ? "sticky top-0 z-50" : ""}`} style={{ backgroundColor: Colors.whiteToGray2 }}>

            {/* Left + Right button */}
            <div
                className='flex items-center justify-between'
                style={{
                    marginLeft: 20,
                    marginRight: 20,
                    height: 45.5
                }}>


                {/* Close button */}
                {(!editingMode || withCancelButton) &&
                    (isLoading ?
                        <div style={{ width: 10, height: 10, backgroundColor: Colors.clear }} />
                        :
                        <HeaderCloseButton onClose={onClose} closeButtonType={editingMode ? "cancelText" : closeButtonType} />
                    )
                }


                {/* Confirm button */}
                {isUserAccount &&
                    (editingMode ?
                        <div style={{ flex: 1, alignItems: 'flex-end' }}>
                            {/* Need to be pushed to the right as the close button disappears */}
                            {isLoading ?
                                <ActivityIndicator />
                                :
                                <HeaderButton
                                    onClick={onClick}
                                    buttonType={'doneText'}
                                    condition={condition}
                                    blueWhenTappable={false}
                                />
                            }
                        </div>
                        :
                        (
                            hideEditButtonWhenNotEditing ?
                                null
                                :
                                <HeaderButton
                                    onClick={onClick}
                                    buttonType={'editText'}
                                    condition={condition}
                                    blueWhenTappable={false}
                                />
                        )
                    )
                }

            </div>



            {/* Headertext */}
            {editingMode ?
                <p
                    className='flex mx-28 items-center justify-center absolute top-0 bottom-0 left-0 right-0 pointer-events-none'
                    style={Object.assign({}, TextStyles.headline, { marginLeft: 60, marginRight: 60, backgroundColor: Colors.clear, color: Colors.black })}
                >{localization.modification}</p>
                :
                <div className='absolute top-0 bottom-0 left-0 right-0 pointer-events-none' style={{ marginLeft: 60, marginRight: 60 }}>
                    <AccountProfilePhotoAndName
                        accountMainData={accountMainData}
                        description={description ?? ""}
                    />
                </div>
            }




            <Divider />


        </div>
    )
}



interface AccountProfilePhotoAndNameInterface {
    accountMainData: AccountMainData
    description: string
}
/** A component for headers that displays the profile photo, name and certification badge of businesses. 
*/
export function AccountProfilePhotoAndName({ accountMainData, description }: AccountProfilePhotoAndNameInterface) {

    const has_photo = accountMainData?.has_photo ?? false
    const short_id = accountMainData?.short_id ?? ""
    const certified = accountMainData?.certified ?? false

    return (
        <div className='flex flex-row justify-start items-center' style={{ height: 44.5 }}>
            <CirclePhoto
                src={has_photo ? `https://www.atsightcdn.com/${getFileName("search_photo", short_id)}`: ""}
                widthAndHeight={34}
                displayLetterIfNoPhoto={accountMainData?.account_name?.slice(0, 1) ?? ""}
            />
            <div style={{ width: 14, opacity: 0 }} />
            <HeaderTextWithDescriptiveText
                headertext={accountMainData?.account_name ?? ''}
                descriptiveText={description}
                alignItems={'flex-start'}
                certificationBadge={certified}
            />
        </div>
    )
}


interface HeaderTextWithDescriptiveTextInterface {
    headertext: string
    descriptiveText: string
    alignItems: "flex-start" | "center"
    certificationBadge?: boolean
}
/**
 * Displays the header with a description at the bottom if any 
 */
function HeaderTextWithDescriptiveText({ headertext, descriptiveText, alignItems, certificationBadge = false }: HeaderTextWithDescriptiveTextInterface) {
    return (
        <div className='flex flex-col justify-center unselectable pointer-events-none' unselectable='on' style={{ alignItems: alignItems }}>

            {/* Header + badge */}
            <div style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
            }}>


                <p
                    style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: Colors.black,
                    }}
                >{headertext}
                </p>


                {certificationBadge &&
                    <div style={{ paddingLeft: 4, paddingRight: 4 }}>
                        <CertificationBadgeIcon />
                    </div>
                }
            </div>





            {/* Gray description */}
            {(descriptiveText ?? "") !== "" &&
                <p
                    style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: Colors.smallGrayText
                    }}>{descriptiveText?.toUpperCase()}
                </p>
            }



        </div>
    )
}



