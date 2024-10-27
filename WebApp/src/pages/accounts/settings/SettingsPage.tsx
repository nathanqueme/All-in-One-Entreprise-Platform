import { useEffect } from 'react'
import '../../../styles/MainStyles.css'
import '../../../styles/TextStyles.css'
import localization from '../../../utils/localizations'
import TitleAndSubTitle from '../../../components/TitleAndSubTitle'
import Colors from '../../../assets/Colors'
import DeleteAccount from './DeleteAccount'
import { SettingsButton, SideTabButton } from '../../../components/Buttons'
import { WindowHeight } from '../../../components/WindowHeight'
import { ParentDivId } from '../../../Types'
import { useNavigate } from 'react-router-dom'
import { ClassicHeader } from '../../../components/headersComponents'
import { getMainDivMinHeight, isMobileHook } from '../../../components/functions'
import { ScreenViewTracker } from '../../../analytics'



const isMobile = isMobileHook()
type SettingsPages = "/accounts/password/change/" | "/accounts/delete_account/"



interface SettingsPageInterface {
    headerHeight: number
    footerHeight: number
}
/**
 * On thin devices : displays a list of options the user can navigate to.
 * On wide devices : displays a tabs selector at the top left and the content of the selected one at the right.
*/
export default function SettingsPage({ headerHeight, footerHeight }: SettingsPageInterface) {


    // States 


    // Values 
    const navigate = useNavigate()
    let pathname: SettingsPages = window.location.pathname as SettingsPages
    let settingsPages: SettingsPages[] = ["/accounts/password/change/", "/accounts/delete_account/"]



    function getSettingsTabDescription(settingTabs: SettingsPages) {
        switch (settingTabs) {
            case "/accounts/password/change/": return localization.change_password
            case "/accounts/delete_account/": return localization.delete_account
        }
    }



    useEffect(() => {

    }, [])


    if (isMobile) {
        return (
            <div>
                <ScreenViewTracker screen_name={"settings"} />
                <ClassicHeader
                    onClose={() => { navigate(-1) }}
                    closeButtonType={'chevronLeft'}
                    headerText={localization.settings}
                    sticky
                />
                {
                    (() => {
                        switch (pathname) {
                            case "/accounts/delete_account/": return (<p>Delete </p>)
                            case "/accounts/password/change/": return (<p>Change </p>)
                            default: return (<SettingsPagesOptions />)
                        }
                    })()
                }
            </div>
        )
    }
    return (
        <div id={"SettingsPageDiv" as ParentDivId} className='bg-white flex flex-col items-center justify-start' style={{
            backgroundColor: Colors.superWhitegray,
            minHeight: getMainDivMinHeight()
        }}>
            <ScreenViewTracker screen_name={"settings"} />

            {/* Gray cell on Web */}
            <div className={`flex border-2 rounded my-10 mx-5 max-w-4xl`}>

                {/* Tabs on the left to select */}
                <div className='border-r-2'>
                    {settingsPages.map((e, index) => {
                        return (
                            <SideTabButton
                                link={e}
                                tabIsSelected={e === pathname}
                                text={getSettingsTabDescription(e)}
                            />
                        )
                    })}
                </div>

                {/* Current tab */}
                <div className={`flex flex-col items-center justify-center my-10 mx-16`}>
                    {(() => {
                        switch (pathname) {
                            case '/accounts/password/change/': return (
                                <TitleAndSubTitle title={localization.sure_want_delete_account} subtitle={localization.deleting_account_will} />
                            )
                            case '/accounts/delete_account/': return (
                                <DeleteAccount />
                            )
                        }
                    })()}
                </div>
            </div>
        </div>
    )
}





function SettingsPagesOptions() {
    return (
        <div>
            <SettingsButton
                settingsInfo={"change_password"}
                onClick={() => { }}
                link={"/accounts/password/change/" as SettingsPages}
            />
            {/*
                <SettingsButton
                  settingsInfo={"language"}
                  onClick={() => {  }}
                />
            */}
            <SettingsButton
                settingsInfo={"delete_account"}
                onClick={() => { }}
                link={"/accounts/delete_account/" as SettingsPages}
            />
        </div>
    )
}