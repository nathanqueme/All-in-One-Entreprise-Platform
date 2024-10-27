import React, { useState } from 'react'
import '../../styles/MainStyles.css'
import '../../styles/TextStyles.css'
import * as htmlToImage from 'html-to-image'
import colors from '../../assets/Colors'
import localization from '../../utils/localizations'
import QrCodeGenerator from '../../components/QrCodeGenerator'
import TextStyles from '../../styles/TextStyles'
import { ClassicButton } from '../../components/Buttons'
import { getMainDivMinHeight, saveBase64AsFile, isMobileHook } from '../../components/functions'
import { ParentDivId } from '../../Types'
import { ClassicHeader } from '../../components/headersComponents'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'


const isMobile = isMobileHook()


interface QrInterface {
    headerHeight: number
    footerHeight: number
}
export default function Qr({ headerHeight, footerHeight }: QrInterface) {


    // States 
    const [qrCodeBase64, setQRCodeBase64] = useState("")


    // Values 
    const navigate = useNavigate()
    let username = "george6paris"


    // (*): Needs to be done at least 3 times first otherwise the QR code image is blank.
    async function convertQrCodeToPng() {

        try {
            // (*)
            await getFullQrCodeBase64()
            await getFullQrCodeBase64()
            await getFullQrCodeBase64()
            await getFullQrCodeBase64()
            const imagebase64 = await getFullQrCodeBase64()
            saveBase64AsFile(imagebase64, username + "_qr")
        } catch (error) {
            alert(error)
        }

    }
    function getFullQrCodeBase64(): Promise<string> {
        return new Promise(async (resolve, reject) => {

            try {
                var node = document.getElementById('QrCode')
                if (node === null) return

                const imagebase64 = await htmlToImage.toPng(node,
                    { style: { alignItems: "center", justifyContent: "center", display: "flex" } } //Needed otherwise is not able to replicate layout properly --> items are not centered
                )
                resolve(imagebase64)
            } catch (error) {
                reject(error)
            }

        })
    }


    return (
        <div
            id={"QrPageDiv" as ParentDivId}
            className={`App flex flex-col items-center justify-start ${isMobile ? "" : "bg-gradient-to-r  px-10"}`} style={{
                minHeight: getMainDivMinHeight()
            }}>

            <Helmet>
                <meta charSet="utf-8" />
                <title>{`QR code - AtSight`}</title>
            </Helmet>

            {/* (Is invisible) */}
            <QrCodeGenerator username={username} setQRCodeBase64={setQRCodeBase64} />

            {isMobile &&
                <ClassicHeader
                    onClose={() => { navigate(-1) }}
                    closeButtonType={'chevronLeft'}
                    headerText={localization.qr_code}
                    sticky
                />
            }

            <div className={`flex ${isMobile ? "flex-col" : "flex-row"} items-center justify-center ${isMobile ? "mb-10" : "mt-10 mb-10"}`} style={{ opacity: qrCodeBase64 ? 1 : 0, backgroundColor: isMobile ? colors.clear : colors.whiteGray }}>

                {/* Gray cell on Web */}
                <div className={`${isMobile ? "" : "border-2"} rounded bg-white`}>
                    {/* QR Code */}
                    <div id="QrCode" className={`flex  App flex-col items-center justify-center bg-white py-5 w-96`} >
                        <img src={qrCodeBase64} className='' style={{ width: 384 - (20 * 2), pointerEvents: "none" }} />
                        <p
                            className=''
                            style={{
                                color: colors.atSightBlue,
                                fontSize: 26,
                                fontWeight: 'bold',
                                paddingInline: 20,
                                paddingTop: 20,
                                paddingBottom: 20
                            }}>{username}</p>

                        <p className='text-center' style={Object.assign({}, TextStyles.gray13Text, {
                            paddingLeft: 20,
                            paddingRight: 20
                        })}>{"Scan, open the app or visit "}<span className=''>{"www.atsight.ch"}</span>{" to access information."}</p>
                    </div>
                </div>

                {/* Use QR code */}
                {isMobile ?
                    <div className='flex flex-col  mx-5 items-center justify-center '>
                        <ClassicButton
                            onClick={() => { convertQrCodeToPng() }}
                            text={localization.download_qr_code}
                            backgroundColor={colors.darkBlue}
                            textColor={"white"}
                            smallAppearance
                            marginTop={20}
                        />
                    </div>
                    :
                    <div className='mx-10'>
                        <p className='max-w-lg' style={Object.assign({}, { color: colors.black, fontSize: 24, fontWeight: "500", lineHeight: "26px", marginBottom: 20 })}>{localization.an_easy_way_to_access_your_information}</p>
                        <p className='max-w-lg' style={Object.assign({}, TextStyles.calloutMedium, { color: colors.black, marginBottom: 20 })}>{localization.how_people_use_qr_and_how_to_use_it}</p>

                        <ClassicButton
                            onClick={() => { convertQrCodeToPng() }}
                            text={localization.download_qr_code}
                            backgroundColor={colors.darkBlue}
                            textColor={"white"}
                            smallAppearance
                        />
                    </div>
                }

            </div>
        </div>
    )
}




