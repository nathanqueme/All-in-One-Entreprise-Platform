import React, { useEffect, useState } from 'react'
import '../../styles/MainStyles.css'
import Colors from '../../assets/Colors'
import CirclePhoto from '../CirclePhoto'
import { useLocation, useNavigate } from 'react-router-dom'
import { AtSightLogoButton } from '../Buttons'
import { WebSearchBar } from '../searchRelated'
import { isMobileHook } from '../functions'
import { useSelector } from 'react-redux'
import { selectHistory } from '../../state/slices/historySlice'
import { ActionButton } from '../postsRelated'




const isMobile = isMobileHook()




interface AppHeaderInterface {
    isHomePage: boolean
    setAccountManagerSheet: (_: boolean) => void
    setUnLoggedInActionSheet: (_: boolean) => void
    setHeaderHeight: (_: number) => any
    setIsHomePage: (_: boolean) => any
}
/**
 * A header with AtSight's logo, a searchbar and the accountManager button. 
 * Used on wide devices on almost all the app's pages. 
 * Used on the home screen only on thin devices.
 * 
 * Show / hides itself dynamically based on the page.
 */
export default function AppHeader({ isHomePage, setHeaderHeight, setAccountManagerSheet, setUnLoggedInActionSheet, setIsHomePage }: AppHeaderInterface) {


    // States 
    const [smallAppearance, setSmallAppearance] = useState(false)


    // Values 
    const navigate = useNavigate()
    const location = useLocation()
    const paddingHotizontal = isMobile ? 20 : (smallAppearance ? 20 : 48)
    const dummyIsUserAccount = true



    // Initialization
    useEffect(() => {
        let height = getHeaderHeight()
        setHeaderHeight(height)
    }, [])


    /**
     * Returns the headers height.
    */
    function getHeaderHeight() {

        let div = document.getElementById("main_header")
        if (div === null) {
            return 78.5
        }
        const { height } = div.getBoundingClientRect()
        if (height === null || height === undefined) {
            return 78.5
        }

        return height
    }


    function onAccountManagerClick() {
        let accountMainData = "abc"
        if (accountMainData !== "") {
            switch (isMobile) {
                case false: setAccountManagerSheet(true); break
                case true: navigate("menu"); break // could be with a hash : #menu
            }
            // mobile navigation handled on 
        } else {
            setUnLoggedInActionSheet(true)
        }
    }


    // Update
    useEffect(() => {
        setIsHomePage(location.pathname === "/")
    }, [location])




    function displayOnlyIfNeeded() {
        switch (location.pathname) {
            case '/accounts/sign_in/':
            case '/accounts/sign_up/':
            case '/password/reset/': return false
            case 'sign_out': return false
            default: return (isMobile ? isHomePage : true)
        }
    }






    if (displayOnlyIfNeeded()) {
        return (
            <div
                id={"main_header"}                      // before was at px-10
                className={`flex items-center justify-between bg-white top-0  ${!isHomePage ? "sticky top-0 z-30" : ""}`}
                style={{
                    borderBottomWidth: 1.4,
                    borderBottomColor: isHomePage ? Colors.clear : Colors.webDefaultBorderGray,
                    height: isMobile ? 44.5 : 60,
                    paddingBottom: 18,
                    paddingTop: 18,
                }}
            >
                {/* Icon + logo */}
                <div className='' id={"header_logo"} style={{ opacity: isHomePage ? 0 : 1, paddingLeft: paddingHotizontal }}>
                    <AtSightLogoButton />
                </div>

                {/* Search */}
                {!isHomePage &&
                    // ABSOLUTE + RESULTS SHEET  <WebSearchBar smallAppearance />
                    <div className='absolute top-0 w-full flex justify-center pointer-events-none' style={{ paddingTop: (60 - 38) / 2, opacity: smallAppearance ? 0 : 1 }}>
                        <WebSearchBar headerAppearance smallAppearance={smallAppearance} setSmallAppearance={setSmallAppearance} />
                    </div>
                }



                {/* Account manager button */}
                <div className='flex items-center justify-center' style={{ paddingRight: paddingHotizontal }}>
                    {(!isHomePage && false) &&
                        <ActionButton type="search" onClick={() => { }} marginRight />
                    }
                    {/** */}
                    {dummyIsUserAccount &&
                        <div role={"button"} onClick={() => { onAccountManagerClick() }}>
                            <CirclePhoto
                                src={""} //uiStates.userAccountMainData?.image_data?.base64 ?? ""}
                                widthAndHeight={36}
                                alt={"Account photo"}
                                isAccountManagerPreview
                                displayLetterIfNoPhoto={""} //uiStates.userAccountMainData?.account_name?.slice(0, 1) ?? ""}
                            />
                        </div>
                    }
                </div>

            </div>
        )
    } else {
        return (null)
    }
}
