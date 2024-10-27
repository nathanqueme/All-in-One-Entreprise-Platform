//
//  analyticsSlice.tsx
//  AtSight version 1.0.0
//
//  Created by Nathan Quême on 10/01/22.
//


// @ts-check
import { ActionEvent, EventType, ExceptionEvent, ScreenViewEvent, Session, TimingEvent } from '.'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'



interface AnalyticsSliceInterface {
    session?: Session
}
const initialState: AnalyticsSliceInterface = {
    session: undefined,
}


interface updateCurrentSession {
    session: Session | undefined
}
interface updateCurrentSessionAttributePayload {
    value: any
    attribute: keyof Session
}
interface updateSessionEventPayload {
    event: ActionEvent | ScreenViewEvent | TimingEvent | ExceptionEvent
    event_type: EventType
}



export const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: initialState,
    reducers: {
        updateCurrentSession: (state, action: PayloadAction<updateCurrentSession>) => {
            // Values 
            const { session } = action.payload
            // Update
            state.session = session
        },
        updateCurrentSessionAttribute: (state, action: PayloadAction<updateCurrentSessionAttributePayload>) => {

            // Values 
            const { value } = action.payload
            const attribute = action.payload.attribute as keyof Session

            // Update
            (state.session as Record<keyof Session, any>)[attribute] = value

        },
        // THE CURRENT VERSION DOES NOT INTERACTS WITH ANY API
        atag: (state, action: PayloadAction<updateSessionEventPayload>) => {

            // Values 
            const { event, event_type } = action.payload

            if (state.session === undefined) return console.log("\nWARNING : ANALYTICS NOT HANDLED (you have disbaled them)")
            // Update
            switch (event_type) {
                case "action":
                    (state.session).actions = [...(state.session.actions ?? []), event as ActionEvent]
                    break
                case "exception":
                    (state.session).exceptions = [...(state.session.exceptions ?? []), event as ExceptionEvent]
                    break
                case "screen_view":
                    (state.session).screen_views = [...(state.session.screen_views ?? []), event as ScreenViewEvent]
                    break
                case "timing":
                    (state.session).timing = [...(state.session.timing ?? []), event as TimingEvent]
                    break
            }

        },
        clearAllAnalytics: state => {

            // Updates
            state = initialState

        },
    }
})

export const { updateCurrentSession, updateCurrentSessionAttribute, atag, clearAllAnalytics } = analyticsSlice.actions


export default analyticsSlice.reducer


// Selector 
export const selectAnalytics = (state: any) => state.analytics as AnalyticsSliceInterface

