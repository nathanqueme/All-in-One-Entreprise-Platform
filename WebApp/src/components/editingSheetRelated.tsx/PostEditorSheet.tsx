//
//  PostEditor.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/15/22
//

import React, { useState, useEffect } from 'react'
import localization from '../../utils/localizations'
import TextStyles from '../../styles/TextStyles'
import Colors from '../../assets/Colors'
import { WindowWidth } from '../WindowWidth'
import { WindowHeight } from '../WindowHeight'
import { getAddressDescription } from '../functions'
import { useNavigate } from 'react-router-dom'
import { LanguageMetadataObj } from '../../assets/LanguagesList'
import { ExclamationMarkTriangleIcon, LanguageIcon } from '../Icons'
import { textHasEmojis } from '../functions/ForContentEditors'
import { SelectablePostCategoryList } from '../selectors/CategorySelector'
import { SelectableCountryList } from '../selectors/CountrySelection'
import { getEditingStepDescription, EditingStepType, getCategoryTypeDescription, InformationType } from '../../Types'
import { LocalizedText, Post, PostCategoryMetadata, Geolocation, LocalizedTextObj, GeolocationObj } from '../../Data'
import { descriptionWasChangedChecker, descriptionLocalizationWasChangedChecker, geolocationWasChangedChecker } from '../functions'
import { MiniSheet, DescriptionTranslationButton, DescriptiveTextButton, EditingSheetControlBar, EditingSheetFileImporterButton, EditingSheetHeader, EditingSheetInputField, InfoInputButton, EditingSheetStepsHeader } from '.'
import { LEFT_WIDTH, RIGHT_WIDTH, OUTER_PADDING, INNER_PADDING, MINI_PADDING, BORDER_RADIUS } from './Constants'

// Global data 
import { useDispatch, useSelector } from 'react-redux'
import { selectUiStates, updateUiStateValue } from '../../state/slices/uiStatesSlice'
import { selectPagesAccountsMainData } from '../../state/slices/accountsMainDataSlice'
import { selectPagesPostCategories } from '../../state/slices/postsSlice'
import { AddressEditorSubSheet, FileImporterSubSheet, LocalizationEditorSubSheet } from './editingSubSheets'
import EditingSubSheetOuterDiv from './EditingSubSheetOuterDiv'
import EditingSheet from './EditingSheet'




interface PostEditorSheetInterface {
    username: string
}
/**
 * (LARGE DEVICES ONLY)
 * 
 * A sheet that lets the user create and edit a post.
 * Has three steps : "Details", "Actions", "Upload".
*/
export default function PostEditorSheet({ username }: PostEditorSheetInterface) {


    // States 
    // 
    const [originalPost, setOriginalPost] = useState<Post | undefined>(undefined)
    const [originalDescription, setOriginalDescription] = useState<LocalizedText | undefined>()
    const [originalDescriptionLocalization, setOriginalDescriptionLocalization] = useState<LocalizedText[]>([])

    //
    const [name, setName] = useState<string>("")
    const [imageUri, setImageUri] = useState<string>('')
    const [imageFilename, setImageFilename] = useState<string>('')
    const [wrongFileType, setWrongFileType] = useState(false)
    const [description, setDescription] = useState<LocalizedText | undefined>()
    const [descriptionLocalization, setDescriptionLocalization] = useState<LocalizedText[] | undefined>([])
    const [linkUrl, setLinkUrl] = useState<string>('')
    const [geolocation, setGeolocation] = useState<Geolocation | undefined>(undefined)
    const [postCategoryMetadata, setPostCategoryMetadata] = useState<PostCategoryMetadata | undefined>(undefined)
    //
    //
    const [imageWasChanged, setImageWasChanged] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading]: [boolean, any] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [editedInfoType, setEditedInfoType]: [InformationType | undefined, any] = useState(undefined)
    const [missingMetadata, setMissingMetadata] = useState<(InformationType | "image")[]>([])
    // 
    //
    const [selectedEditingStep, setSelectedEditingStep] = useState<EditingStepType>("details")
    const [linkEditor, setLinkEditor] = useState<boolean>(false)
    const [postCategorySelector, setPostCategorySelector] = useState<boolean>(false)
    //
    // SUB EDITORS
    // - HIDE/SHOW
    const [localizationEditor, setLocalizationEditor] = useState<boolean>(false)
    const [addressEditor, setAddressEditor] = useState<boolean>(false)
    // LOCALIZATION EDITOR
    const [selectedLocalization, setSelectedLocalization] = useState<LocalizedText | undefined>()
    const [originalLanguageIsSet, setOriginalLanguageIsSet] = useState(false)
    const [descriptionInTargetLanguage, setDescriptionInTargetLanguage] = useState<LocalizedText | undefined>()
    // ADDRESS EDITOR 
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState("")
    const [countryCode, setCountryCode] = useState('')
    //
    // MINI SHEETS
    // HIDE/SHOW
    const [categorySheet, setCategorySheet] = useState(false)
    const [countrySheet, setCountrySheet] = useState(false)
    const [originalLanguageSheet, setOriginalLanguageSheet] = useState(false)
    const [targetLanguageSheet, setTargetLanguageSheet] = useState(false)
    // Global data
    const jwtTokenWasRefreshed = useSelector(selectUiStates).jwtTokenWasRefreshed
    const pageAccountMainData = useSelector(selectPagesAccountsMainData).find(e => { return e.page.username === username })
    const pagePostCategories = useSelector(selectPagesPostCategories).find(e => { return e.page.username === username })
    const dispatch = useDispatch()


    // Values 
    const navigate = useNavigate()
    const WINDOW_WIDTH = WindowWidth()
    const WINDOW_HEIGHT = WindowHeight()
    let description_text = description?.text ?? ""
    let addressDescription = getAddressDescription(geolocation)
    // 
    // MAIN + CHECKS
    let isNewPost = (originalPost?.post_id ?? '') === ''
    let metadataFilled =
        (name ?? "").replace(/\s+/g, '') !== ""
    // && (postCategoryMetadata?.category_id ?? '') !== ''
    // 
    const hasAnImage = imageUri !== ""
    const hasAnAddress = (geolocation !== undefined) && ((geolocation?.auto_generated ?? false) === false)
    let descriptionWasChanged = descriptionWasChangedChecker(description, originalDescription)
    let descriptionLocalizationWasChanged = descriptionLocalizationWasChangedChecker(descriptionLocalization, originalDescriptionLocalization)
    let addressWasChanged = geolocationWasChangedChecker(geolocation, originalPost?.geolocation)
    let categoryWasChanged = (postCategoryMetadata?.category_id ?? '') !== (originalPost?.category_id ?? '') && !isNewPost // to avoid it to be true when post is new, important for the publishPost() function so it properly does each steps if needed.
    let metadataWasChanged =
        name !== (originalPost?.name ?? '') ||
        descriptionWasChanged ||
        descriptionLocalizationWasChanged ||
        addressWasChanged ||
        linkUrl !== (originalPost?.link_url ?? '') ||
        categoryWasChanged

    // 
    let nameLenghtOk = name.length <= 80
    let descriptionLenghtOk = description_text.length <= 1000




    /**
     * Handles updating the localized description text.
     */
    function handleDescriptionText(text: string, isDescriptionTranslation = false) {

        const hasEmojis = textHasEmojis(text)
        if (hasEmojis) {
            dispatch(updateUiStateValue({ attribute: "emojiAlert", value: true }))
            return
        }

        if (isDescriptionTranslation) {
            setDescriptionInTargetLanguage((prevV) => {
                return LocalizedTextObj(prevV?.language_metadata ?? LanguageMetadataObj("", ""), text)
            })
        } else {
            setDescription((prevV) => {
                return LocalizedTextObj(prevV?.language_metadata ?? LanguageMetadataObj("", ""), text)
            })
        }

    }



    // UI
    const scrollViewDiv = document.getElementById("editor_scrollview")
    function resetScroll() {
        if (scrollViewDiv === null) { return }
        scrollViewDiv.scrollTo(0, 0)
    }
    useEffect(() => {
        resetScroll()
    }, [selectedEditingStep])

    const hasDescription = description_text.length > 0

    function closeSubEditor() {
        setAddressEditor(false); setLocalizationEditor(false)
    }

    function getHeaderSubEditorDescription() {
        if (localizationEditor) {
            if ((targetLanguage !== "") && (originalLanguage !== "")) {
                return `(${originalLanguage} → ${targetLanguage})`
            } else return undefined
        } else if ((addressEditor) && (editedAddressDescription !== "")) {
            return `(${editedAddressDescription})`
        } else return undefined
    }
    function displayHeaderDeleteButton() {
        if (addressEditor && hasAnAddress) {
            return true
        } else if (localizationEditor && (selectedLocalization !== undefined)) {
            return true
        } else {
            return false
        }
    }
    function displayHeaderButton() {
        return addressEditor || localizationEditor
    }



    // SUB EDITORS

    // - INITIALIZATION
    // ADDRESS EDITOR
    const editedAddressDescription = getAddressDescription(GeolocationObj(city, country, "", "", street, ""))
    function initializeAddressEditor() {
        setError("")
        setStreet(geolocation?.street ?? '')
        setCity(geolocation?.city ?? '')
        setCountryCode(geolocation?.iso ?? '')
        // use user's acccount country as the default value so the user does not have to enter it each time.
        setCountry(geolocation?.country ?? (pageAccountMainData?.account_main_data.geolocation.country ?? ''))
    }
    useEffect(() => {
        if (addressEditor) initializeAddressEditor()
    }, [addressEditor])

    // LOCALIZATION EDITOR
    const descriptionInTargetLanguageText = descriptionInTargetLanguage?.text ?? ""
    const originalLanguage = description?.language_metadata.name ?? ""
    const targetLanguage = descriptionInTargetLanguage?.language_metadata.name ?? ""
    function initializeLocalizationEditor() {
        setOriginalLanguageIsSet(originalLanguage !== "")
        setDescriptionInTargetLanguage(selectedLocalization)
    }
    useEffect(() => {
        if (localizationEditor) initializeLocalizationEditor()
    }, [localizationEditor])
    // RESET
    useEffect(() => {
        if ((descriptionLocalization?.length ?? 0) === 0) {
            setDescription((prevV) => {
                return LocalizedTextObj(LanguageMetadataObj("", ""), prevV?.text ?? "")
            })
        }
    }, [descriptionLocalization?.length])

    // - 
    function handleSubEditorInfoDeletion() {
        if (addressEditor) {
            setGeolocation(undefined)
        } else if (localizationEditor) {
            setDescriptionLocalization(prevV => {
                // Delete
                let index = descriptionLocalization?.findIndex(e => { return e.language_metadata.locale === descriptionInTargetLanguage?.language_metadata.locale ?? "" }) ?? -1
                if (index !== -1) { prevV?.splice(index, 1) }
                return prevV
            })
        }

        closeSubEditor()
    }
    function handleSubEditorValidation() {
        if (addressEditor) {
            const new_geolocation = GeolocationObj(city, country, '', '', street, '')
            setGeolocation(new_geolocation)
        } else if (localizationEditor) {

            let index = descriptionLocalization?.findIndex(e => { return e.language_metadata.locale === descriptionInTargetLanguage?.language_metadata.locale ?? "" }) ?? -1
            if (descriptionInTargetLanguage === undefined) return

            setDescriptionLocalization(prevV => {
                if ((index === -1) || (prevV === undefined)) {    // ADD 
                    prevV?.push(descriptionInTargetLanguage)
                } else { // UPDATE
                    prevV[index] = descriptionInTargetLanguage
                }
                return prevV
            })
        }

        closeSubEditor()
    }



    return (
        <EditingSheet
            helmetTitle={`${localization.new_content} - AtSight`}
            headerTitle={addressEditor ? localization.address : (localizationEditor ? localization.translation : localization.post)}
            headerDescription={getHeaderSubEditorDescription()}
            headerCloseButton={!displayHeaderDeleteButton() && !displayHeaderButton()}
            headerDeleteButton={displayHeaderDeleteButton()}
            headerCancelButton={(addressEditor && !hasAnAddress) || (localizationEditor && !(selectedLocalization !== undefined))}
            headerButton={displayHeaderButton()}
            onHeaderClose={() => {
                if (addressEditor || localizationEditor) {
                    closeSubEditor()
                } else {
                    //if (selectedEditingStep === "details" && imageUri !== "") {
                    //setImageFilename('')
                    //setImageUri('')
                    //} else {
                    navigate(-1)
                    // Are you sure you want to leave ? 
                    //}
                }
            }}
            onHeaderClickCancel={() => {
                closeSubEditor()
            }}
            onHeaderClick={() => { handleSubEditorValidation() }}
            onHeaderClickDelete={() => { handleSubEditorInfoDeletion() }}
            headerButtonCondition={addressEditor || ((targetLanguage !== "") && ((descriptionInTargetLanguage?.text ?? "") !== "") && (originalLanguage !== ""))}
            // STEPS MINI HEADER
            showEditingSteps={(!localizationEditor && !addressEditor && hasAnImage)}
            selectedEditingStep={selectedEditingStep}
            setSelectedEditingStep={setSelectedEditingStep}
            uploadProgress={uploadProgress}
            isLoading={isLoading}
            // CONTENT
            mainContent={
                <>
                    {
                        hasAnImage ?
                            (
                                localizationEditor ?
                                    <LocalizationEditorSubSheet
                                        originalLanguage={originalLanguage}
                                        originalLanguageIsSet={originalLanguageIsSet}
                                        targetLanguage={targetLanguage}
                                        setDescription={setDescription}
                                        descriptionText={description_text}
                                        handleDescriptionText={handleDescriptionText}
                                        descriptionInTargetLanguage={descriptionInTargetLanguage}
                                        setDescriptionInTargetLanguage={setDescriptionInTargetLanguage}
                                        descriptionInTargetLanguageText={descriptionInTargetLanguageText}
                                        descriptionLenghtOk={descriptionLenghtOk}
                                        originalLanguageSheet={originalLanguageSheet}
                                        setOriginalLanguageSheet={setOriginalLanguageSheet}
                                        targetLanguageSheet={targetLanguageSheet}
                                        setTargetLanguageSheet={setTargetLanguageSheet}
                                    />
                                    :
                                    (
                                        addressEditor ?
                                            /* ADDRESS EDITOR */
                                            <AddressEditorSubSheet
                                                street={street}
                                                setStreet={setStreet}
                                                city={city}
                                                setCity={setCity}
                                                country={country}
                                                setCountrySheet={setCountrySheet}
                                            />
                                            :
                                            /* POST SUB SHEETS (details + actions) */
                                            <EditingSubSheetOuterDiv paddingInline={OUTER_PADDING}>
                                                <div className='flex flex-col justify-start items-start w-full' style={{ paddingBottom: OUTER_PADDING }}>
                                                    <>
                                                        {/* MAIN HEADER */}
                                                        <div className='flex flex-col items-start justify-start' style={{ width: LEFT_WIDTH, paddingTop: 10, marginBottom: 14 }}>
                                                            <h1 className='self-start' style={Object.assign({}, TextStyles.editorSectionTitle, { color: Colors.black })}>{getEditingStepDescription(selectedEditingStep)}</h1>
                                                            {selectedEditingStep === "actions" &&
                                                                <p className='' style={Object.assign({}, TextStyles.gray13Text, { marginTop: 6, marginBottom: 10 })}>{localization.convert_visibility_into_actions}</p>
                                                            }
                                                        </div>

                                                        {/* NAME + DESCRIPTION + DESCRIPTION's LOCALIZATION + FILE (IMAGE, ...) */}
                                                        <div id="row" className='flex items-start justify-start w-full relative'>

                                                            {/* FIELDS */}
                                                            {selectedEditingStep === "details" ?
                                                                <div id={"left"} style={{ width: LEFT_WIDTH }} className='flex flex-col justify-start items-start h-full'>

                                                                    <EditingSheetInputField
                                                                        infoType="name"
                                                                        value={name}
                                                                        setValue={setName}
                                                                        valuePlaceholder={localization.formatString(localization.add_name_to_x, localization.post) as string}
                                                                        invalidAppearance={!nameLenghtOk}
                                                                        extraInfo={`${name.length}/80`}
                                                                        avoidLineBreaks
                                                                    />
                                                                    <EditingSheetInputField
                                                                        infoType="description"
                                                                        value={description_text}
                                                                        setValue={(text) => { handleDescriptionText(text) }}
                                                                        valuePlaceholder={localization.describe_your_post}
                                                                        extraInfo={`${description_text.length}/1000`}
                                                                        invalidAppearance={!descriptionLenghtOk}
                                                                        marginTop={INNER_PADDING}
                                                                        minHeight={90}
                                                                        icon={hasDescription ? <LanguageIcon color={Colors.placeholderGray} fontSize={14} /> : undefined}
                                                                    />
                                                                    {/* TRANSLATION */}
                                                                    <div className='flex flex-col items-start justify-start w-full' style={{ marginTop: MINI_PADDING }}>
                                                                        <>
                                                                            {/* SMALL HEADER */}
                                                                            <p className='text-left' style={Object.assign({}, TextStyles.gray13Text, {})}>{localization.atsight_translates_auto_way_but_you} {<DescriptiveTextButton text={localization.provide_your_translation} onClick={() => { setSelectedLocalization(undefined); setLocalizationEditor(true) }} />}</p>
                                                                            <ul className='overflow-hidden border' style={{ borderRadius: BORDER_RADIUS, marginTop: MINI_PADDING, backgroundColor: Colors.lightGray }}>
                                                                                {descriptionLocalization?.map((e, index) => {
                                                                                    return (
                                                                                        <DescriptionTranslationButton key={index} translation={e} onClickEdit={() => { setSelectedLocalization(e); setLocalizationEditor(true) }} isLastItem={index === descriptionLocalization?.length - 1} />
                                                                                    )
                                                                                })}
                                                                            </ul>
                                                                        </>
                                                                    </div>


                                                                    {/* CATEGORY */}
                                                                    <div className='flex flex-col items-start justify-start w-full' style={{ marginTop: INNER_PADDING }}>
                                                                        {/* SMALL HEADER */}
                                                                        <p style={Object.assign({}, TextStyles.medium15, {})}>{localization.category}</p>
                                                                        <p onClick={() => { }} className='text-left' style={Object.assign({}, TextStyles.gray13Text, { paddingTop: MINI_PADDING, paddingBottom: MINI_PADDING })}>{localization.select_category_for_post}</p>
                                                                        <InfoInputButton infoType={"category"} label={localization.category} infoValue={`${getCategoryTypeDescription(postCategoryMetadata?.type, postCategoryMetadata?.custom_type)}`} onClick={() => { setCategorySheet(true) }} />
                                                                    </div>

                                                                </div>
                                                                :
                                                                <div id={"main"} className='flex flex-col justify-start items-start h-full w-full'>
                                                                    <p style={Object.assign({}, TextStyles.medium15, {})}>{localization.link}</p>
                                                                    <p onClick={() => { }} className='text-left' style={Object.assign({}, TextStyles.gray13Text, { paddingTop: MINI_PADDING, paddingBottom: MINI_PADDING })}>{localization.redirect_people_to_website}</p>
                                                                    <EditingSheetInputField
                                                                        infoType="url"
                                                                        value={linkUrl}
                                                                        setValue={setLinkUrl}
                                                                        valuePlaceholder={localization.enter_a_url}
                                                                        avoidLineBreaks
                                                                        preAddedCharacters="https://"
                                                                    />

                                                                    <p style={Object.assign({}, TextStyles.medium15, { paddingTop: INNER_PADDING })}>{localization.address}</p>
                                                                    <p onClick={() => { }} className='text-left' style={Object.assign({}, TextStyles.gray13Text, { paddingTop: MINI_PADDING, paddingBottom: MINI_PADDING })}>{localization.empower_people_to_use_address}</p>
                                                                    <InfoInputButton infoType={"geolocation"} label={localization.address} infoValue={getAddressDescription(geolocation)} onClick={() => { setAddressEditor(true) }} />

                                                                </div>
                                                            }



                                                            {/* FILE */}
                                                            {selectedEditingStep === "details" &&
                                                                <div id={"right"} className="sticky flex flex-col justify-start items-start" style={{ width: RIGHT_WIDTH, top: INNER_PADDING, marginLeft: INNER_PADDING }}>
                                                                    <EditingSheetFileImporterButton imageUri={imageUri} setImageUri={setImageUri} imageFilename={imageFilename} setImageFilename={setImageFilename} wrongFileType={wrongFileType} setWrongFileType={setWrongFileType} disabled />

                                                                    <div className='flex items-center justify-center' style={{ marginTop: MINI_PADDING, opacity: wrongFileType ? 1 : 0 }}>
                                                                        <ExclamationMarkTriangleIcon color={Colors.red} fontSize={15} />
                                                                        <p style={{ fontSize: 13, color: Colors.red, marginLeft: 3 }}>{localization.wrong_file_type}</p>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </>
                                                </div>
                                            </EditingSubSheetOuterDiv>
                                    )

                            )
                            :
                            /* FILE INPUT (SELECTION and DRAG & DROP) */
                            <FileImporterSubSheet setFileName={setImageFilename} setImageUri={setImageUri} />
                    }
                </>
            }
            miniSheets={
                <>
                    {categorySheet &&
                        <MiniSheet marginLeft={OUTER_PADDING} setShow={setCategorySheet} condition={(postCategoryMetadata !== undefined)} content={
                            <SelectablePostCategoryList postCategoriesMetadata={(pagePostCategories?.post_categories?.flatMap(e => { return e.metadata }) ?? [])} setPostCategoryMetadata={setPostCategoryMetadata} selectedPostCategoryMetadata={postCategoryMetadata} />
                        } />
                    }
                    {countrySheet &&
                        <MiniSheet marginLeft={OUTER_PADDING} setShow={setCountrySheet} condition={country !== ""} displayControlBar={false} content={
                            <SelectableCountryList selectedCountryName={country} setSelectedCountry={(country) => { setCountry(country.name); setCountrySheet(false) }} />
                        } />
                    }
                </>
            }
            // CONTROL BAR={}
            showControlBar={(!localizationEditor && !addressEditor && hasAnImage)}
            controlBarButtonText={(selectedEditingStep === "actions" ? localization.save : localization.next)}
            showControlBarCancelButton={selectedEditingStep === "actions"}
            showControlBarDeleteButton={((localizationEditor) && (selectedLocalization !== undefined))}
            controlBarButtonCondition={!isLoading}
            onControlBarButtonClick={() => {

                setUploadProgress(100)

                // if (selected_editing_step === "actions") { } else { setSelectedEditingStep("actions") }

            }}
            onControlBarCancelButtonClick={() => {
                setSelectedEditingStep("details")
            }}
        />
    )
}

