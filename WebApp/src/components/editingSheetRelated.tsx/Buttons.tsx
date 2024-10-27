//
//  Buttons.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/17/22
//

import React, { useState } from "react"
import Divider from "../Divider"
import Colors from "../../assets/Colors"
import TextStyles from "../../styles/TextStyles"
import localization from "../../utils/localizations"
import { LocalizedText } from "../../Data"
import { InfoSymbol } from "../InfoDisplay"
import { BORDER_RADIUS, BUTTONS_INNER_PADDING, BUTTONS_WIDTH_HEIGHT, MINI_PADDING } from "./Constants"
import { EditingStepType, getEditingStepDescription, getInfoMetada, InformationType } from "../../Types"
import { ArrowTopIcon, CheckMark, ChevronRightIcon, ExclamationMarkIcon, LanguageIcon, PencilIcon, PhotoIcon } from "../Icons"



// BUTTONS
interface EditingStepButtonInterface {
    editingStep: EditingStepType
    selectedAppearance: boolean
    isDone: boolean
    setEditingStep: (_: EditingStepType) => any
    invalidAppearance?: boolean
    disabled?: boolean
}
/**
 * A button that represents an editing step.
 * Has an hover effect and a blue/red color
 */
export function EditingStepButton({ editingStep, selectedAppearance = false, isDone, setEditingStep, invalidAppearance = false, disabled = false }: EditingStepButtonInterface) {

    // States 
    const [is_hovered, setIsHovered] = useState(false)

    // Values
    const text = getEditingStepDescription(editingStep)
    const CIRCLE_WIDTH_HEIGHT = 20

    const alignment = getHorizontalAlignment()
    function getHorizontalAlignment() {
        switch (editingStep) {
            case 'details': return "left-0" // left
            case 'actions': return "" // center
            case 'upload': return "right-0" // right 
        }
    }


    return (
        <button className={`${alignment} absolute moveOfHalfOfItsHeight`} disabled={disabled} onClick={() => { setEditingStep(editingStep) }} onMouseOver={() => { setIsHovered(true) }} onMouseLeave={() => { setIsHovered(false) }}>
            <div className={`relative flex flex-col items-center justify-center`}>
                <div className='absolute -z-10 -top-6' style={{ borderRadius: BORDER_RADIUS, height: 58, width: 128, background: "gray", opacity: is_hovered && !disabled ? 0.15 : 0 }} />
                <p className='absolute -top-5' style={Object.assign({}, { color: selectedAppearance ? Colors.darkBlue : Colors.black, fontSize: 13, fontWeight: "600" })}>{text}</p>
                <div className={`rounded-full content-end flex items-center justify-center`} style={{ borderWidth: invalidAppearance ? 1 : 4, borderColor: invalidAppearance ? Colors.red : (selectedAppearance || isDone ? Colors.darkBlue : Colors.borderGray), width: CIRCLE_WIDTH_HEIGHT, height: CIRCLE_WIDTH_HEIGHT, backgroundColor: isDone ? Colors.darkBlue : Colors.whiteToGray2 }}>
                    {isDone && <CheckMark color={"white"} />}
                    {invalidAppearance && <ExclamationMarkIcon color={Colors.red} />}
                </div>
            </div>
        </button>

    )
}


interface DescriptionTranslationButtonInterface {
    translation: LocalizedText
    onClickEdit: () => any
    isLastItem: boolean
}
/**
 * (WIDE DEVICES ONLY)
 * 
 * Lets the user preview it's translation and lets him open a sheet to edit it.
*/
export function DescriptionTranslationButton({ translation, onClickEdit, isLastItem }: DescriptionTranslationButtonInterface) {

    // States 
    const [is_hovered, setIsHovered] = useState(false)

    return (
        <li className='flex flex-col items-start justify-start' style={{ width: 320 }} onMouseOver={() => { setIsHovered(true) }} onMouseLeave={() => { setIsHovered(false) }}>
            <div className='flex items-center justify-start'>
                <div style={{ width: BUTTONS_WIDTH_HEIGHT, height: BUTTONS_WIDTH_HEIGHT }} className='flex items-center justify-center'>
                    <LanguageIcon color={Colors.smallGrayText} fontSize={20} />
                </div>

                <div className='flex flex-col items-start justify-start overflow-hidden text-start' style={{ width: 220 }}>
                    <p className='line-clamp-1' style={Object.assign({}, TextStyles.gray12Text)}>{translation.language_metadata.name}</p>
                    <p className='line-clamp-1' style={Object.assign({}, TextStyles.default15, { color: Colors.black })}>{translation.text}</p>
                </div>

                <div className='flex flex-col items-center justify-center' style={{ opacity: is_hovered ? 1 : 0, width: BUTTONS_WIDTH_HEIGHT }}>
                    <EditButton onClick={() => { onClickEdit() }} />
                </div>

            </div>

            {!isLastItem && <Divider />}
        </li>
    )
}


interface InfoInputButtonInterface {
    infoType: InformationType
    label?: string
    infoValue: string
    invalidAppearance?: boolean
    onClick: () => any
    marginTop?: number
    marginBottom?: number
    marginInLine?: number
    displayIcon?: boolean
    width?: number | string
    miniSheet?: any
    disabled?: boolean
}
/**
 * A gray rounded cell that lets the user see a selection and open a SelectionSheet.
 */
export function InfoInputButton({ infoType, label, infoValue, onClick, invalidAppearance, marginTop, marginBottom, marginInLine, displayIcon = true, width = 320, miniSheet, disabled = false }: InfoInputButtonInterface) {


    // States
    const [isHovered, setIsHovered] = useState(false)


    // Values 
    const infoMetada = getInfoMetada(infoType)
    const has_a_value = infoValue !== ""
    const placeholder_color = invalidAppearance ? Colors.red : Colors.smallGrayText
    const border_color = isHovered && !invalidAppearance ? Colors.smallGrayText : (invalidAppearance ? Colors.red : Colors.borderGray)


    const styling = { marginTop: marginTop, marginBottom: marginBottom, width: width === 320 ? 320 : width }


    return (
        <div className="relative overflow-visible" style={styling}>
            <div role={"button"} onClick={() => { if (disabled === false) onClick() }} className='flex items-center justify-between border' style={{ borderColor: border_color, borderRadius: BORDER_RADIUS, backgroundColor: disabled ? Colors.lightGray : Colors.whiteToGray2, }} onMouseOver={() => { if (disabled === false) setIsHovered(true) }} onMouseLeave={() => { if (disabled === false) setIsHovered(false) }}>
                <div className='flex items-center flex-grow justify-start'>
                    {displayIcon &&
                        <div className='flex items-center justify-center' style={{ width: BUTTONS_WIDTH_HEIGHT, height: BUTTONS_WIDTH_HEIGHT }}>
                            <InfoSymbol infoType={infoType} />
                        </div>
                    }

                    {/* SELECTION */}
                    <div className='flex flex-col items-start justify-start text-start overflow-hidden' style={{ minWidth: 220, paddingLeft: displayIcon ? 0 : MINI_PADDING }}>
                        {((label ?? "") !== "") &&
                            <p className='line-clamp-1 w-full flex items-start justify-start' style={{ color: placeholder_color, fontSize: 12 }}>{label}</p>
                        }
                        <p className='line-clamp-1' style={Object.assign({}, TextStyles.sheetInputFont, { color: Colors.black })}>{has_a_value ? infoValue : infoMetada.placeholder}</p>
                    </div>
                </div>

                <div className='flex items-center justify-center' style={Object.assign({}, displayIcon ? { width: BUTTONS_WIDTH_HEIGHT, height: BUTTONS_WIDTH_HEIGHT } : { height: BUTTONS_WIDTH_HEIGHT, width: MINI_PADDING * 2.5 })}>
                    <ChevronRightIcon color={placeholder_color} />
                </div>
            </div>

            {miniSheet && miniSheet}
        </div>
    )
}


interface EditingSheetFileImporterButtonInterface {
    imageUri: string
    setImageUri: (_: string) => any
    imageFilename: string
    setImageFilename: (_: string) => any
    invalidAppearance?: boolean
    wrongFileType: boolean
    setWrongFileType: (_: boolean) => any
    disabled?: boolean
}
/**
 * A container to import files. (For the moment only images).
 * When no file is selected is a rounded cell with a dashed border, a gray image icon and the text "Select file".
 * When a file is selected is a rounded cell with the file preview at the top, the file name and a button to choose an other file.
 */
export function EditingSheetFileImporterButton({ imageUri, setImageUri, imageFilename, setImageFilename, wrongFileType, setWrongFileType, disabled = false }: EditingSheetFileImporterButtonInterface) {

    // States
    const [dragIsOver, setDragIsOver] = useState(false)


    // Values
    const placeholder_color = Colors.smallGrayText // is_hovered ? "white" : Colors.smallGrayText


    function handleFile(file: File) {
        if ((file.type !== "image/jpeg") && (file.type !== "image/png")) {
            setWrongFileType(true)
        } else {
            const file_uri = URL.createObjectURL(file)
            setImageFilename(file.name)
            setImageUri(file_uri)
        }
    }


    // UI
    const border_color = dragIsOver && !disabled ? Colors.smallGrayText : Colors.borderGray
    const unstylable_input =
        <input
            className='overflow-hidden absolute pointer-events-none opacity-0' style={{ height: 0.1, width: 0.1 }} // Hidden input as it can not be styled 
            type="file"
            id="notStylableFileInput"
            onChange={(event) => {
                // https://stackoverflow.com/a/43992687
                if (event.target.files && event.target.files[0]) {
                    handleFile(event.target.files[0])
                }
            }}
            accept=".png, .jpg, .jpeg"
        />


    function handleDrop(ev: React.DragEvent<HTMLDivElement>) {

        if (disabled) return

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault()

        let file: File | null = null
        setDragIsOver(false)
        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            let files = [...ev.dataTransfer.items]
            file = files[0].getAsFile()
        } else {
            // Use DataTransfer interface to access the file(s)
            let files = [...ev.dataTransfer.files]
            file = files[0]
        }

        if (file) {
            handleFile(file)
        }

    }


    if (imageUri) {
        return (
            <div onDrop={handleDrop} onDragOver={(ev) => { setDragIsOver(true); ev.preventDefault() }} onDragLeave={() => { setDragIsOver(false) }} className='border flex flex-col justify-start items-start overflow-hidden w-full' style={{ borderRadius: BORDER_RADIUS, borderColor: border_color }}>

                {unstylable_input}

                <img src={imageUri} className='h-48 object-cover' width={"100%"} />

                <div className='flex items-center justify-between w-full' style={{ padding: BUTTONS_INNER_PADDING, backgroundColor: Colors.lightGray }}>
                    <div className='flex overflow-hidden flex-col items-start justify-start w-full' style={{ marginRight: BUTTONS_WIDTH_HEIGHT }}>
                        <p className='text-left line-clamp-1' style={Object.assign({}, TextStyles.gray12Text)}>{localization.filename}</p>
                        {/* TODO : make the text be clipped when too large. */}
                        <p className='text-left line-clamp-1' style={Object.assign({}, TextStyles.default15)}>{imageFilename}</p>
                    </div>

                    {!disabled &&
                        <label htmlFor="notStylableFileInput">
                            <EditButton onClick={() => { }} arrowStyle />
                        </label>
                    }
                </div>

            </div>
        )
    }
    // (MAY BE UNUSED RIGHT NOW, BUT KEEP IT)
    else {
        return (
            <div onDrop={handleDrop} onDragOver={(ev) => { setDragIsOver(true); ev.preventDefault() }} onDragEnter={() => { setDragIsOver(true) }} onDragLeave={() => { setDragIsOver(false) }} className="w-full">
                <label htmlFor="notStylableFileInput" className='w-full h-48 outline-dashed outline-gray-200 hover:outline-gray-300 hover:brightness-95 outline-2 flex flex-col items-center justify-center' style={{ borderRadius: BORDER_RADIUS, backgroundColor: Colors.whiteToGray2, borderColor: border_color }}>
                    {unstylable_input}
                    <PhotoIcon color={placeholder_color} size={"2.8em"} />
                    <p style={Object.assign({}, TextStyles.sheetInputFont, { color: placeholder_color, opacity: 0.85 })}>{localization.select_image}</p>
                </label >
            </div>
        )
    }
}


interface EditButtonInterface {
    onClick: () => any
    arrowStyle?: boolean
    fontSize?: number
}
/**
 * A pencil that enables the user to edit an item.
 * Becomes lighter on hover.
 */
export function EditButton({ onClick, arrowStyle = false, fontSize = 24 }: EditButtonInterface) {
    return (
        <div role={"button"} onClick={() => { onClick() }} className='hover:opacity-70'>
            {arrowStyle ?
                <ArrowTopIcon color={Colors.smallGrayText} fontSize={fontSize} />
                :
                <PencilIcon color={Colors.smallGrayText} fontSize={fontSize} />
            }
        </div>
    )
}


interface DescriptiveTextButtonInterface {
    text: string
    linkHref?: string
    onClick?: () => any
}
/**
 * A 13px blue text link to insert on an explanative block (gray13Text).
 * e.g. : Can be used to display clickable "Learn more" link.
 */
export function DescriptiveTextButton({ text, linkHref = "", onClick = () => { } }: DescriptiveTextButtonInterface) {

    const class_name = 'active:under hover:underline active:opacity-70'
    const style = { fontSize: 13, fontWeight: "600", color: Colors.darkBlue, textAlign: "left" } as any

    if (linkHref !== "") {
        return (<a role={"button"} href={linkHref} className={class_name} style={style}>{text}</a>)
    } else {
        return (<span role={"button"} onClick={() => { onClick() }} className={class_name} style={style}>{text}</span>)
    }
}
