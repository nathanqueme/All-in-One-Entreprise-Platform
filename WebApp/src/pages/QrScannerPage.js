
// @ts-check
import React, { useState, useEffect } from 'react'
import localization from '../utils/localizations'
import QrReader from 'react-qr-scanner'
import Colors from '../assets/Colors'
import Alert from '../components/sheets/Alert'
import { ClassicHeader } from '../components/headersComponents'
import { useNavigate } from 'react-router-dom'
import { ExclamationMarkTriangleIcon } from '../components/Icons'
import { getSegmentsFromUrl } from '../components/functions'
import { ScreenViewTracker } from '../analytics'



const QR_OVERLAY_WIDTH = window.innerWidth * 0.6



export default function QrScannerPage({ }) {


  // States
  const [error, setError] = useState(false)
  const [invalidQrCode, setInvalidQrCode] = useState(false)
  const [scannedQrUrl, setScannedQrUrl] = useState("")

  // Values 
  const navigate = useNavigate()

  /**
   * @param {string} stringUrl
   */
  async function handleQrScan(stringUrl) {

    // Preparation
    let url = new URL(stringUrl) // https://atsight.ch/george6paris?s=qr/
    const username = getSegmentsFromUrl(url)[0] ?? ""

    if ((
      url.href.includes("https://atsight.app/") || // Deprecated first version
      url.href.includes("https://www.atsight.app/") || // Deprecated first version
      url.href.includes("https://atsight.ch/") ||
      url.href.includes("https://www.atsight.ch/") ||
      url.href.includes("https://atsight.fr/") ||
      url.href.includes("https://www.atsight.fr/")
    ) && (username !== "")) {

      navigate(`/${username}?s=qr/`)

    } else {
      setInvalidQrCode(true)

    }

    setTimeout(() => {
      setScannedQrUrl("")
    }, 700)

  }
  useEffect(() => {
    if (scannedQrUrl !== "") {
      handleQrScan(scannedQrUrl)
    }
  }, [scannedQrUrl])


  return (
    <div className='bg-black flex fixed top-0 items-center justify-center h-screen w-screen'>

      <ScreenViewTracker screen_name={"scanner"} />

      {!invalidQrCode && /* The fact it disappears after an error resets it */
        <QrReader
          style={{
            display: "flex",
            objectFit: "cover",
            height: "100%",
            width: "100%",
          }}
          constraints={{
            video: {
              facingMode: { exact: `environment` }
            }
          }}
          delay={700}
          onError={() => { setError(true) }}
          onScan={(/** @type {any} */ data) => {
            let stringUrl = data?.text ?? ""
            if ((stringUrl !== "") && scannedQrUrl !== stringUrl) setScannedQrUrl(stringUrl)
          }}
        />
      }

      {/* Header */}
      <div className=' fixed flex items-center justify-around top-0 w-full ' style={{ height: 46.5, zIndex: 100 }}>
        <ClassicHeader closeButtonType={"cancelText"} onClose={() => { navigate(-1) }} headerText={localization.scanner} showDivider={false} backgroundColor={Colors.clear} textColor="white" />
      </div>

      {/* QR code overlay */}
      <div className='absolute z-50 flex flex-col items-center justify-center w-screen h-screen bg-black opacity-60'>
        <QrCodeOverlay />
        <p className='text-center' style={{ marginTop: 10, color: "white", fontSize: 14, marginLeft: 20, marginRight: 20, maxWidth: QR_OVERLAY_WIDTH }}>{localization.how_scanner_works}</p>

        {error &&
          <div className='fixed bottom-0 flex items-center justify-center' style={{ marginBottom: 20, marginLeft: 20, marginRight: 20 }}>
            <ExclamationMarkTriangleIcon fontSize={24} color={"orange"} />
            <p className='text-left pl-5' style={{ color: "orange" }}>{localization.scanner_not_enabled}</p>
          </div>
        }
      </div>

      <Alert title={localization.invalid_qr_code} description={localization.only_qr_code_of_places} show={invalidQrCode} actionSheetClick={() => { setInvalidQrCode(false) }} />

    </div >
  )
}



{/* A white symbol of a qr code */ }
function QrCodeOverlay() {
  return (
    <div className='flex flex-col items-center justify-between p-3 border-8 border-white rounded-3xl opacity-60 pointer-events-none shadow-xl' style={{ color: "white", width: QR_OVERLAY_WIDTH, height: QR_OVERLAY_WIDTH, maxWidth: 384, maxHeight: 384 }}>
      {[1, 2].map(row => {

        const BOX_WIDTH_AND_HEIGHT = 50
        const boxUi = <div className='flex items-center justify-center rounded border-4 border-white shadow-xl' style={{ height: BOX_WIDTH_AND_HEIGHT, width: BOX_WIDTH_AND_HEIGHT }}>
          <div className='bg-white' style={{ width: "80%", height: "80%" }} />
        </div>

        return (
          /* Row with qr codes */
          <div key={row} className='flex items-start justify-between w-full'>
            {[1, 2].map(box => {
              return (
                ((row === 2) && (box === 2)) ?
                  <div className='border-4 rounded shadow-xl' style={{ height: 18, width: 18, marginRight: BOX_WIDTH_AND_HEIGHT - 18 }}></div>
                  :
                  boxUi
              )
            })}
          </div>
        )
      })}
    </div>
  )
}



