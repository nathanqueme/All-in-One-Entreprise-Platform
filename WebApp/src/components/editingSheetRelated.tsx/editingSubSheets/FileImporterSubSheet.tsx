//
//  FileImporterSubSheet.tsx
//  atsight_web_version
//
//  Created by Nathan Queme the 11/29/22
//

import React, { useEffect, useState } from 'react'
import Colors from '../../../assets/Colors'
import TextStyles from '../../../styles/TextStyles'
import localization from '../../../utils/localizations'
import { ClassicButton } from '../../Buttons'
import { ArrowTopIcon, ExclamationMarkTriangleIcon } from '../../Icons'


interface FileImporterSubSheetInterface {
    setImageUri: (_: string) => any
    setFileName: (_: string) => any
}
/** 
* A subsheet that enables the user to import a file by selecting it or by dropping it.
* As an arrow up, a descriptive text and a button.
*/
export default function FileImporterSubSheet({ setImageUri, setFileName }: FileImporterSubSheetInterface) {

    // States
    const [dragIsOver, setDragIsOver] = useState(false)
    const [wrongFileType, setWrongFileType] = useState(false)


    function handleFile(file: File) {
        if ((file.type !== "image/jpeg") && (file.type !== "image/png")) {
            setWrongFileType(true)
        } else {
            const file_uri = URL.createObjectURL(file)
            setFileName(file.name)
            setImageUri(file_uri)
            setWrongFileType(false)
        }
    }
    function handleDrop(ev: React.DragEvent<HTMLDivElement>) {

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


    // UI
    useEffect(() => {
        if (dragIsOver) {
            setWrongFileType(false)
        }
    }, [dragIsOver])
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


    return (
        <div onDrop={handleDrop} onDragOver={(ev) => { setDragIsOver(true); ev.preventDefault() }} onDragLeave={() => { setDragIsOver(false) }} className='flex flex-col items-center justify-center w-full h-full'>

            {unstylable_input}

            <label htmlFor="notStylableFileInput" role={"button"} className='flex items-center justify-center rounded-full border' style={{ backgroundColor: Colors.lightGray, padding: 25, borderColor: dragIsOver ? Colors.darkBlue : Colors.clear }} onDragOver={(ev) => { setDragIsOver(true); ev.preventDefault() }} >
                <ArrowTopIcon color={(dragIsOver ? Colors.darkBlue : Colors.smallGrayText)} fontSize={70} />
            </label>


            <div className='flex flex-col items-center justify-center' style={{ width: "80%", marginTop: 20, marginBottom: 20 + 15 }}>
                <p className='text-center' style={Object.assign({}, { opacity: dragIsOver ? 0.2 : 1 }, TextStyles.noContentFont)}>{localization.drag_and_drop}</p>

                <div className='flex items-center justify-center' style={{ marginTop: 20, opacity: wrongFileType ? 1 : 0 }}>
                    <ExclamationMarkTriangleIcon color={Colors.red} fontSize={15}/>
                    <p style={{ fontSize: 13, color: Colors.red, marginLeft: 3 }}>{localization.wrong_file_type}</p>
                </div>
            </div>


            <label htmlFor="notStylableFileInput">
                <ClassicButton
                    onClick={() => { }}
                    text={localization.select_image}
                    backgroundColor={Colors.darkBlue}
                    textColor={"white"}
                    smallAppearance
                    onlyUi
                />
            </label>

        </div>
    )
}

