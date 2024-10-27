

//
//  Analytics.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 10/01/22.
//

import React, { useEffect, useState } from "react"
import DeviceInfoHook from 'react-native-device-info'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AppState, AppStateStatus, Platform } from "react-native"
import { generateID } from "../components/functions/ConvertionsGenerationsObtentions"
import { AccountMainData, IpAddressInfo } from "../Data"
import { DeviceInfoObj, Session, SessionObj, ScreenNameType, ScreenViewEventObj } from "."

// Global data 
import { useDispatch, useSelector } from "react-redux"
import { selectAnalytics, updateCurrentSession } from "."
import { atag, updateDeviceId, updateIpInfo } from "./reduxSlice"
import { PlatformType } from "./AnalyticsData"


// SESSIONS LIFECYCLE
// 1 - CREATE THE SESSION (1.1) and SAVE PREVIOUS CACHED SESSION IF WAS NOT SAVED (1.2)
// 2 - UPDATE THE CURRENT SESSION WITH EVENTS COMING FROM ALL OVER THE APP
// 3 - SAVE IT ON SERVER or CACHE IT AS A FALLBACK


// CACHE 
// atsight_device_id (_adid), unsaved_sessions (u_s), ip_info (i_i)


// IMPROVEMENTS TODO
// Handle failure while registering device 
// Handle failure while saving unsaved session


export default function Analytics() {


    const [next_app_state, setNextAppState] = useState<AppStateStatus>()
    const [unsaved_sessions, setUnsavedSessions] = useState<Session[]>()
    const [sessions_need_to_be_saved, setSessionsNeedToBeSaved] = useState(false)

    const dispatch = useDispatch()
    const analytics = useSelector(selectAnalytics)
    const current_session = analytics?.session
    const device_id = analytics.device_id ?? ""
    const ip = analytics.ip_info?.ip ?? ""


    // 1.1
    async function initializeSessionValues() {

        console.log("\n\n_________________INITIALIZING A NEW SESSION__________________")
        const start_date = new Date().toISOString()
        const os_version = DeviceInfoHook.getSystemVersion()
        const version = DeviceInfoHook.getVersion()
        // ip : will be set by the server if empty
        const account_type = (await getCachedUserAccountMainData())?.account_type ?? undefined
        const installer_package = (await DeviceInfoHook.getInstallerPackageName() ?? "").toLowerCase()
        const user_agent = await DeviceInfoHook.getUserAgent()
        const session = SessionObj("", "", start_date, 0, version, ip, os_version, installer_package, user_agent !== "" ? user_agent : undefined, undefined, account_type)
        dispatch(updateCurrentSession({ session: session }))

    }
    // 3
    function saveSession(session: Session, session_end_date: Date) {
        return new Promise(async (resolve, reject) => {

            const id = generateID(15)
            const duration = getDuration(session_end_date, new Date(session.start_date))
            // const events = (session.events ?? []) === [] ? undefined : session.events
            let final_session = Object.assign({}, session)
            final_session.id = id
            final_session.device_id = device_id
            final_session.duration = duration
            final_session.ip = ip


            try {

                let response = await fetch(`https://apis.atsight.ch/analytics/sessions`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(final_session)
                })

                if (response.ok) {
                    resolve(`SESSION SUCCESSFULLY SAVED (${JSON.stringify(final_session)})`)
                } else {
                    let response_json = await response.json()
                    reject(response_json)
                }

            } catch (error) {
                reject(`Error while saving session with start_date : ${JSON.stringify(final_session)} , error : ${JSON.stringify(error)}`)
            }

        })
    }
    // 1.2
    async function handleUnsavedSessions() {

        console.log("\nSaving sessions...")
        const sessions_to_save = unsaved_sessions
        setUnsavedSessions([])
        setSessionsNeedToBeSaved(false)

        await Promise.all(sessions_to_save?.map(async (e, index) => {
            if ((e?.end_date ?? "") !== "") { // Should never be === undefined -> just for security
                try {
                    let resonse = await saveSession(e, new Date(e.end_date))
                    console.log(resonse)
                } catch (error) {
                    // first possibility don't retry has the item already exists and it avoided ovewritting it 
                    // second possibility retry if it is an error due to the internet connection 
                    console.log(error)
                }
            } else { return new Promise((resolve) => { resolve("OK") }); }
        }))

    }
    useEffect(() => {
        if ((!sessions_need_to_be_saved) || ((device_id ?? "") === "")) return
        handleUnsavedSessions()
    }, [device_id, sessions_need_to_be_saved])
    /**
     * If a "device_id" was already set, returns it othewise will :
     * - create a new "device_id"
     * - save the device's info on server 
     * - cache the "device_id"
     * 
     * N.B. : "_adid" stands for "Atsihght Device Id"
     */
    function getDeviceId() {
        return new Promise<string>(async (resolve, reject) => {

            // DEVICE WAS ALREADY REGISTERED
            try {
                const cached_device_id = await AsyncStorage.getItem("@_adid")
                if ((cached_device_id ?? "") !== "") {
                    // console.log("\nDEVICE WAS ALREADY REGISTERED")
                    resolve(cached_device_id)
                    return
                }
            } catch (error) {
                reject("Error while trying to get cached device_id")
                return
            }


            // REGISTER DEVICE
            // INFO
            const new_device_id = `${generateID(10, true)}.${new Date().valueOf()}` // Timestamp : https://stackoverflow.com/a/221297
            const registration_date = new Date().toISOString()
            const platform: PlatformType = "app"
            // ip : will be set by the server if empty
            const model = DeviceInfoHook.getModel()
            const os = Platform.OS
            const os_version = DeviceInfoHook.getSystemVersion()
            const user_agent = await DeviceInfoHook.getUserAgent()
            const device_info = DeviceInfoObj(new_device_id, registration_date, platform, ip, model, os, os_version, user_agent !== "" ? user_agent : undefined)
            console.log("\nREGISTARING DEVICE")

            fetch(`https://apis.atsight.ch/analytics/user`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(device_info)
            }).catch(e => { console.log(`ERROR: fetch analytics/user ${JSON.stringify(e)}`) })
            AsyncStorage.setItem("@_adid", new_device_id)
            resolve(new_device_id)

        })
    }


    // CACHE 
    function getCachedUnsavedSessions() {
        return new Promise<Session[]>(async (resolve, reject) => {
            try {
                const cached_sessions = await AsyncStorage.getItem("@u_s")
                const sessions: Session[] = await JSON.parse(cached_sessions) ?? []
                if (sessions.length > 0) {
                    console.log(`\n ${sessions.length} ${sessions.length > 1 ? "sessions need" : "session needs"} to be saved`)
                }
                resolve(sessions)
            } catch (error) {
                reject(error)
            }
        })
    }
    function getCachedUserAccountMainData() {
        return new Promise<AccountMainData | undefined>(async (resolve, reject) => {
            let account_main_data: AccountMainData = undefined
            try {
                const cached_account_main_data = await AsyncStorage.getItem("@user_account_main_data")
                account_main_data = JSON.parse(cached_account_main_data)
                resolve(account_main_data)
            } catch (error) {
                reject(error)
            }
        })
    }
    function setCachedUnsavedSessions(sessions: Session[]) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await AsyncStorage.setItem("@u_s", JSON.stringify(sessions))
                // console.log(`\n ${sessions.length} sessions on cache`)
                resolve()
            } catch (error) {
                reject("Could not set unsaved sessions on cache")
            }
        })
    }
    function getCachedIpAddressInfo() {
        return new Promise<IpAddressInfo>(async (resolve, reject) => {
            try {
                let ip_info_json = await AsyncStorage.getItem("@i_i")
                let ip_info = await JSON.parse(ip_info_json) as IpAddressInfo
                resolve(ip_info)
            } catch (error) {
                reject("No ip info was cached")
            }
        })
    }
    // FOR DEVELOPPMENT
    function resetAnalyticsCache() {
        AsyncStorage.setItem("@_adid", "")
        AsyncStorage.setItem("@u_s", "")
        AsyncStorage.setItem("@i_i", "")
    }
    useEffect(() => {
        if (unsaved_sessions === undefined) return // Avoids to clear all unsaved_sessions when the app just got open
        setCachedUnsavedSessions(unsaved_sessions)
    }, [unsaved_sessions])


    function updateUnsavedSessions(session: Session, operation: "APPEND or UPDATE" | "DELETE") {

        let index = unsaved_sessions?.findIndex(e => { return e.start_date === session.start_date })

        if (operation === "APPEND or UPDATE") {
            if (index === -1) {
                setUnsavedSessions(prevV => { return [...prevV, session] })
                console.log("Appended")
            } else {
                setUnsavedSessions(prevV => {
                    prevV.splice(index, 1)
                    return [...prevV, session]
                })
                console.log("Updated")
            }
        } else {
            if (index !== -1) {
                setUnsavedSessions(prevV => {
                    prevV.splice(index, 1)
                    return [...prevV]
                })
                console.log("DELETED")
            } else {
                console.log(`Session not found`)
            }
        }
    }


    // INITIALIZATON (device_id & unsaved sessions & subscribe to app_state)
    async function deviceIdInitialization() {
        try {
            let device_id = await getDeviceId()
            dispatch(updateDeviceId({ device_id: device_id }))
        } catch (error) {
            console.log(`Could not get device_id : ${JSON.stringify(error)}`)
            // Analytics sessions won't work
        }
    }
    async function getUnsavedSessions() {
        try {
            let cached_unsaved_sessions = await getCachedUnsavedSessions()
            setUnsavedSessions(cached_unsaved_sessions)
            setSessionsNeedToBeSaved(cached_unsaved_sessions.length > 0)
        } catch (error) {
            console.log("Error : could not retrieve unsaved sessions")
        }
    }
    async function ipInfoInitialization() {
        try {
            let ip_info: IpAddressInfo | undefined
            let current_ip = (await fetch("https://apis.atsight.ch/analytics/init", { method: "POST" }).then(e => e.json()))["x-forwarded-for"] ?? ""

            // 1 - Get potentialy already saved ip info 
            ip_info = await getCachedIpAddressInfo()
            let cached_ip = ip_info?.ip ?? ""
            if ((cached_ip !== current_ip) || (cached_ip === "")) {
                // 2 - Update / get for the first time the ip's info
                const ip_info = await fetch(`https://apis.atsight.ch/atag/iInfo?encrypted=false`, { method: "GET" }).then(e => e.json()).then(response => { return response.data as IpAddressInfo }).catch(e => { console.log(`ERROR: on the iInfo fetch : ${JSON.stringify(e)}`) })
                console.log("\n  UPDATED IP INFO")
                AsyncStorage.setItem("@i_i", JSON.stringify(ip_info))
            } else {
                console.log("\n  RESTORED IP INFO")
            }
            dispatch(updateIpInfo({ "ip_info": ip_info }))

        } catch (error) {
            console.log(error)
            // WON'T BE ABLE TO GET IP INFO
        }
    }
    useEffect(() => {
        getUnsavedSessions()
        ipInfoInitialization()
        deviceIdInitialization()
        const analytics_triggers_subscription = AppState.addEventListener("change", async (nextAppState) => {
            setNextAppState(nextAppState)
        })
        return () => {
            analytics_triggers_subscription.remove()
        }
    }, [])


    function addSessionToUnsavedOnes(current_session_to_save: Session) {
        const end_date_when_not_saved = new Date().toISOString()
        let updated_session = Object.assign({}, current_session_to_save)
        updated_session.end_date = end_date_when_not_saved

        updateUnsavedSessions(updated_session, "APPEND or UPDATE")
    }
    async function stopAndSaveCurrentSession(session: Session) {
        dispatch(updateCurrentSession({ session: undefined })) // Clear
        // This won't work when the user closes the app -> this is why the sessions was cached save it next time.
        try {
            let response = await saveSession(session, new Date())
            console.log(response)
            updateUnsavedSessions(session, "DELETE")
        }
        catch (error) {
            console.log("failed saving session")
        }
    }
    async function handleAnalyticsSessions() {

        if ((device_id ?? "") === "") return

        if (next_app_state === "active" && current_session === undefined) {
            initializeSessionValues()
        }
        // END CURRENT SESSION and CREATE NEW ONE
        else if (next_app_state === "background" && current_session !== undefined) {
            if (Platform.OS === "android") addSessionToUnsavedOnes(current_session)
            if (Platform.OS === "ios") stopAndSaveCurrentSession(current_session)
        }
        // only on iOS
        if ((next_app_state === "inactive") && current_session !== undefined) addSessionToUnsavedOnes(current_session)

    }
    if (Platform.OS === "android") {
        useEffect(() => {
            // Needs useEffect so that the unsaved_sessions variable is accurate
            if (next_app_state === "background" && current_session !== undefined) {
                stopAndSaveCurrentSession(unsaved_sessions[unsaved_sessions.length - 1])
            }
        }, [unsaved_sessions])
    }
    useEffect(() => {
        handleAnalyticsSessions()
    }, [next_app_state, device_id])




    return (null)

    /* FOR HELP DURING DEVELOPMENT 
    return (
        <TouchableOpacity style={{ paddingTop: 60 }} onPress={async () => {
            resetAnalyticsCache()
        }}>
            <Text>{`ANALYTICS ${JSON.stringify(analytics.ip_info)}   ${JSON.stringify(analytics.device_id)}`} {JSON.stringify(unsaved_sessions)}</Text>
        </TouchableOpacity>
    )
    */
}


/**
 * @param log_date 
 * @returns hour, minutes, seconds e.g. "08:30:50"
 */
export function getLogTime(log_date?: Date) {
    let date = log_date ? log_date : new Date()
    return date.toLocaleString("fr", { "second": "numeric", "minute": "numeric", "hour": "numeric" })
}


/**
   * Returns the difference of time between the two dates in seconds.
  */
export function getDuration(end_date: Date, start_date: Date) {

    const timeSinceLastSessionInMilliseconds = (end_date as any) - (start_date as any)
    let timeSinceLastSession = (timeSinceLastSessionInMilliseconds / 1000) // (in minutes : x / 60000, in seconds: x / 1000)

    return Number(timeSinceLastSession.toFixed(0))
}


// SCREEN VIEW
interface ScreenViewTrackerInterface {
    screen_name: ScreenNameType
    is_user_one?: boolean
}
export function ScreenViewTracker({ screen_name, is_user_one = false }: ScreenViewTrackerInterface) {

    const dispatch = useDispatch()

    function handleScreenView() {
        let start_date = new Date()
        return () => {
            let end_date = new Date()
            let duration = getDuration(new Date(), start_date)
            let user_one = is_user_one ? true : undefined
            let event = ScreenViewEventObj(screen_name, getLogTime(end_date), duration, user_one)
            dispatch(atag({ "event_type": "screen_view", "event": event }))
        }
    }

    useEffect(() => {
        return handleScreenView()
    }, [])

    return (null)
}