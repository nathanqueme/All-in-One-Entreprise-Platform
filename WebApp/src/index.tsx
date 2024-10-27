import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import { Analytics } from './analytics'
import { AppHeader } from './components/headersComponents'
import { ActionSheet, AccountManagerSheet } from './components/sheets'
import Footer from './components/Footer'

// Locale initialization
import './utils/daysjsInitialization'

// Pages 
import Home from './pages/Home'
import Qr from './pages/accounts/Qr'
import SignIn from './pages/accounts/SignIn'
import SignUp from './pages/accounts/SignUp'
import ProfilePage from './pages/profile/ProfilePage'
import ResetPassword from './pages/password/ResetPassword'
import localization from './utils/localizations'
import SearchPage from './pages/SearchPage'
import PostsPage from './pages/profile/secondaryTabs/PostsPage'
import QrScannerPage from './pages/QrScannerPage'
import SettingsPage from './pages/accounts/settings/SettingsPage'

// Global data 
import { Provider } from 'react-redux'
import store from './state/store'
import { isMobileHook } from './components/functions'


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <RenderApp />
)


function RenderApp() {

  // States 
  const [accountMainData, setAccountMainData] = useState("dummy")
  const [unLoggedInActionSheet, setUnLoggedInActionSheet] = useState(false)
  const [accountManagerSheet, setAccountManagerSheet] = useState(false)
  // 
  const [headerHeight, setHeaderHeight] = useState(70)
  const [footerHeight, setFooterHeight] = useState(100)
  // 
  const [isHomePage, setIsHomePage] = useState(window.location.pathname === "/")

 
  // Values 
  const enable_analytics = process.env.NODE_ENV === 'production' || true
  let originUrl = window.location.origin // e.g. : "https://www.atsight.ch"
  const isMobile = isMobileHook()

  // Action sheets 
  function unLoggedInactionSheetPress(index: number) {
    switch (index) {
      case 0: window.location.assign(originUrl + "/accounts/sign_in/"); break
      case 1: window.location.assign(originUrl + "/accounts/sign_up/"); break
      default: break
    }
  }




  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppHeader
          isHomePage={isHomePage}
          setHeaderHeight={setHeaderHeight}
          setAccountManagerSheet={setAccountManagerSheet}
          setUnLoggedInActionSheet={setUnLoggedInActionSheet}
          setIsHomePage={setIsHomePage}
        />


        {enable_analytics && <Analytics />}


        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<Home />} />

            {/* Accounts */}
            <Route path='/accounts/sign_in/' element={<SignIn footerHeight={footerHeight} />} />
            <Route path='/accounts/sign_up/' element={<SignUp footerHeight={footerHeight} />} />
            <Route path='/accounts/qr/' element={<Qr headerHeight={headerHeight} footerHeight={footerHeight} />} />
            {/* /accounts/edit/ */}
            <Route path='/accounts/password/change/' element={<SettingsPage headerHeight={headerHeight} footerHeight={footerHeight} />} />
            <Route path='/accounts/delete_account/' element={<SettingsPage headerHeight={headerHeight} footerHeight={footerHeight} />} />
            {/* Password */}
            <Route path='/password/reset/' element={<ResetPassword footerHeight={footerHeight} />} />



            {/* Thin devices only _______________________________ */}
            {isMobile &&
              <>
                <Route path="/scanner/" element={<QrScannerPage />} />
                <Route path='/accounts/settings/' element={
                  <SettingsPage headerHeight={headerHeight} footerHeight={footerHeight} />
                } />
                <Route path='/menu/' element={
                  <AccountManagerSheet
                    show
                    setShow={setAccountManagerSheet}
                    headerHeight={headerHeight}
                  />
                } />
                <Route path='/search/' element={<SearchPage />} />
              </>
            }
            {/* __________________________________________________ */}

            <Route path='/p/*' element={<PostsPage />} />

            {/*
             <Route path="contact" element={<Contact />} />
             <Route path="privacy" element={<PrivacyPolicy />} />
             <Route path="terms" element={<TermsOfUse />} />
            */}

            <Route path="*" element={<ProfilePage  />} />
          </Route>
        </Routes>




        {(isMobile ? isHomePage : true) &&
          <Footer setFooterHeight={() => { }} />
        }


        {/* Global sheets */}
        <ActionSheet
          show={unLoggedInActionSheet}
          onClickHide={() => { setUnLoggedInActionSheet(false) }}
          options={[localization.sign_in, localization.create_an_account, localization.cancel]}
          handleClick={(index) => { unLoggedInactionSheetPress(index) }}
        />


        <AccountManagerSheet
          show={accountManagerSheet}
          setShow={setAccountManagerSheet}
          headerHeight={headerHeight}
        />


      </BrowserRouter>
    </Provider>
  )
}


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()


