import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { SurveyResponse } from "@/types/survey-response"
import { mockSurveyResponses } from "@/utils/mockData"

interface SurveyResponseState {
  responses: SurveyResponse[]
  isLoading: boolean
}

const initialState: SurveyResponseState = {
  responses: mockSurveyResponses,
  isLoading: false,
}

const surveyResponseSlice = createSlice({
  name: "surveyResponses",
  initialState,
  reducers: {
    setResponses: (state, action: PayloadAction<SurveyResponse[]>) => {
      state.responses = action.payload
    },
    addResponse: (state, action: PayloadAction<SurveyResponse>) => {
      state.responses.push(action.payload)
    },
  },
})

export const { setResponses, addResponse } = surveyResponseSlice.actions
export default surveyResponseSlice.reducer
