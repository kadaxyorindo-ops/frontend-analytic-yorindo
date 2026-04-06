import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import eventReducer from "./eventSlice"
import participantReducer from "./participantSlice"
import registrationFormReducer from "./registrationFormSlice"
import surveyFormReducer from "./surveyFormSlice"
import surveyResponseReducer from "./surveyResponseSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    registrationForms: registrationFormReducer,
    surveyForms: surveyFormReducer,
    participants: participantReducer,
    surveyResponses: surveyResponseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
