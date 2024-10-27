import React, { useEffect } from "react"
import QRCode from 'easyqrcodejs'
import colors from '../assets/Colors'
import { useState } from "react"





interface QrCodeGeneratorInterface {
    username: string
    setQRCodeBase64: (_: string) => any
}
/**
 * A component that generates the base64 of the Qr code.
 * Needs to be visible to work but hide so the Qr code is not visible via it.
 * Known issue : there is two qr codes as the useEffect is called twice
 */
export default function QrCodeGenerator({ username, setQRCodeBase64 }: QrCodeGeneratorInterface) {


    // States 
    const qrCodeRef = React.createRef<HTMLDivElement>()
    const [qrCodeCreated, setQrCodeCreated] = useState(false)


    useEffect(() => {

        let largeWidthAndHeight = 700 // window.outerWidth // Largest width for best definition 

        // QRCode options
        var options = {
            text: `https://www.atsight.ch/${username}?s=qr/`,
            width: largeWidthAndHeight,
            height: largeWidthAndHeight,
            PI: colors.atSightBlue, /// Small cubes on the 3 corners
            colorDark: "#4e607b", /// Center 
            colorLight: "white", /// Background color : white
            correctLevel: QRCode.CorrectLevel.H, // L, M, Q, H


            AI: colors.atSightBlue,

            // Logo
            logo: 'data:application/octet-stream;base64,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',
            logoWidth: largeWidthAndHeight / 2.4,
            logoHeight: largeWidthAndHeight / 2.4,
            logoBackgroundTransparent: true,
            onRenderingStart: function(qrCodeOptions: any) {
                qrCodeOptions._element.style.display = 'none';
            },
            onRenderingEnd: function (qrCodeOptions: any, base64Url: any) {
                setQRCodeBase64(base64Url)
                setQrCodeCreated(true)
            }
        }

        if (qrCodeCreated) return

        // Creates the QRCode
        new QRCode(qrCodeRef.current, options)

    }, [])

    return (
            <div ref={qrCodeRef} className={''} style={{ height: 1, width: 1 }} />
    )
}