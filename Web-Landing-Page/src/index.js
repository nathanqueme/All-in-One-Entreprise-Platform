
// @ts-check 
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"

// Pages 
import Home from './pages/Home'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        <Route path="/" element={<Outlet />}>
          <Route index element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfUse />} />
          <Route path="*" element={<Home />} />
          {/* 
            <Route path="*" element={<NoPage />} /> 
          */}
        </Route>

      </Routes>



      <footer>
        <Footer />
      </footer>



    </BrowserRouter>
  </React.StrictMode>
)








// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
