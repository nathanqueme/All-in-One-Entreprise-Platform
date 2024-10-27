

// @ts-check
import './../App.css'
import React from 'react'
import icon192 from './../assets/app_icon_260.png'
import appStoreUs from './../assets/downloadOnAppStore/us.svg'
import playStoreUs from './../assets/downloadOnPlayStore/us.png'
import TextStyles from './../styles/TextStyles.module.css'
import Colors from '../assets/Colors'


// npm run build 
// then firebase deploy 




function Home() {


  let mainText = "See information from places."
  let secondaryText = "Ideas, stories, opinions, tips, products, anything places want to share with you."

  const windowWidth = window.screen.width
  const windowHeight = window.screen.height


  return (
    <div className="App-header" style={{ backgroundColor: Colors.white, paddingLeft: 30, paddingRight: 30 }}>


      {/* App icon */}
      <img
        src={icon192}
        style={{ width: windowWidth * 0.45, maxWidth: 240 }} //maxWidth for the website version
        alt="App icon preview"
      />


      {/* Short text*/}
      <div style={{ paddingTop: "6%", paddingBottom: "6%" }}>
        <p className={TextStyles.calloutMedium} style={{ lineHeight: 0.5, paddingInline: "3%" }} >{mainText}</p>
        <p className={TextStyles.grayText} style={{ minWidth: 300, maxWidth: 480 }}>{secondaryText}</p>
      </div>


      {/* Download on app store buttons */}
      <div className='rows' style={{}} >
        <a className='row' href="https://apps.apple.com/us/app/atsight-app/id1629430405">
          <img
            src={appStoreUs}
            style={{ height: window.screen.height * 0.055 }}
            alt="Apple store badge"
          />
        </a>



        <a className='row' href="https://play.google.com/store/apps/details?id=com.atsight">
          <img
            src={playStoreUs} // for later : the badge was saved with a width of 800.
            style={{
              height: window.screen.height * (0.055 + 0.001), // has the badge was manually cropped there is about 1 of space around
              marginLeft: 30
            }}
            alt="Play store badge"
          />
        </a>


      </div>
    </div>
  )
}


export default Home

