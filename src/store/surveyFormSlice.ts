import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { SurveyForm, SurveyQuestion } from "@/types/survey-form"
import { mockSurveyForms } from "@/utils/mockData"

interface CreateSurveyFormPayload {
  event_id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
}

interface SurveyFormState {
  forms: SurveyForm[]
  isLoading: boolean
  selectedForm: SurveyForm | null
}

const initialState: SurveyFormState = {
  forms: mockSurveyForms,
  isLoading: false,
  selectedForm: null,
}

const surveyFormSlice = createSlice({
  name: "surveyForms",
  initialState,
  reducers: {
    addSurveyForm: (state, action: PayloadAction<CreateSurveyFormPayload>) => {
      const newForm: SurveyForm = {
        form_id: `SURVEY-FORM-${Date.now()}`,
        event_id: action.payload.event_id,
        title: action.payload.title,
        description: action.payload.description,
        questions: action.payload.questions,
        link_survey: `https://yorindo.com/survey/${action.payload.event_id}`,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=survey/${action.payload.event_id}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.forms.push(newForm)
    },
    updateSurveyForm: (
      state,
      action: PayloadAction<{ form_id: string; updates: Partial<SurveyForm> }>
    ) => {
      const index = state.forms.findIndex(
        (form) => form.form_id === action.payload.form_id
      )
      if (index !== -1) {
        state.forms[index] = {
          ...state.forms[index],
          ...action.payload.updates,
          updated_at: new Date().toISOString(),
        }
      }
    },
    deleteSurveyForm: (state, action: PayloadAction<string>) => {
      state.forms = state.forms.filter((form) => form.form_id !== action.payload)
    },
    setSelectedSurveyForm: (state, action: PayloadAction<SurveyForm | null>) => {
      state.selectedForm = action.payload
    },
  },
})

export const {
  addSurveyForm,
  updateSurveyForm,
  deleteSurveyForm,
  setSelectedSurveyForm,
} = surveyFormSlice.actions

export default surveyFormSlice.reducer
