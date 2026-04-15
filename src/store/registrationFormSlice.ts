import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type {
  CreateRegistrationFormDTO,
  CustomField,
  RegistrationForm,
} from "@/types/registration-form"
import { defaultFixFields, mockRegistrationForms } from "@/utils/mockData"

interface RegistrationFormState {
  forms: RegistrationForm[]
  isLoading: boolean
  selectedForm: RegistrationForm | null
}

const initialState: RegistrationFormState = {
  forms: mockRegistrationForms,
  isLoading: false,
  selectedForm: null,
}

const registrationFormSlice = createSlice({
  name: "registrationForms",
  initialState,
  reducers: {
    setForms: (state, action: PayloadAction<RegistrationForm[]>) => {
      state.forms = action.payload
    },
    addForm: (
      state,
      action: PayloadAction<{ event_id: string; data: CreateRegistrationFormDTO }>
    ) => {
      const newForm: RegistrationForm = {
        form_id: `FORM-${Date.now()}`,
        event_id: action.payload.event_id,
        title: action.payload.data.title,
        fix_fields: defaultFixFields,
        custom_fields: action.payload.data.custom_fields.map((field, index) => ({
          ...field,
          id: `custom-${Date.now()}-${index}`,
          order: defaultFixFields.length + index + 1,
        })),
        link_pendaftaran: `https://yorindo.com/register/${action.payload.event_id}`,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=register/${action.payload.event_id}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.forms.push(newForm)
    },
    updateForm: (
      state,
      action: PayloadAction<{ form_id: string; updates: Partial<RegistrationForm> }>
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
    deleteForm: (state, action: PayloadAction<string>) => {
      state.forms = state.forms.filter((form) => form.form_id !== action.payload)
    },
    addCustomField: (
      state,
      action: PayloadAction<{
        form_id: string
        field: Omit<CustomField, "id" | "order">
      }>
    ) => {
      const form = state.forms.find((item) => item.form_id === action.payload.form_id)
      if (!form) return

      form.custom_fields.push({
        ...action.payload.field,
        id: `custom-${Date.now()}`,
        order: form.fix_fields.length + form.custom_fields.length + 1,
      })
      form.updated_at = new Date().toISOString()
    },
    updateCustomField: (
      state,
      action: PayloadAction<{
        form_id: string
        field_id: string
        updates: Partial<CustomField>
      }>
    ) => {
      const form = state.forms.find((item) => item.form_id === action.payload.form_id)
      if (!form) return

      const fieldIndex = form.custom_fields.findIndex(
        (field) => field.id === action.payload.field_id
      )
      if (fieldIndex !== -1) {
        form.custom_fields[fieldIndex] = {
          ...form.custom_fields[fieldIndex],
          ...action.payload.updates,
        }
        form.updated_at = new Date().toISOString()
      }
    },
    deleteCustomField: (
      state,
      action: PayloadAction<{ form_id: string; field_id: string }>
    ) => {
      const form = state.forms.find((item) => item.form_id === action.payload.form_id)
      if (!form) return

      form.custom_fields = form.custom_fields.filter(
        (field) => field.id !== action.payload.field_id
      )
      form.custom_fields.forEach((field, index) => {
        field.order = form.fix_fields.length + index + 1
      })
      form.updated_at = new Date().toISOString()
    },
    reorderFields: (
      state,
      action: PayloadAction<{ form_id: string; fields: CustomField[] }>
    ) => {
      const form = state.forms.find((item) => item.form_id === action.payload.form_id)
      if (!form) return

      form.custom_fields = action.payload.fields.map((field, index) => ({
        ...field,
        order: form.fix_fields.length + index + 1,
      }))
      form.updated_at = new Date().toISOString()
    },
    setSelectedForm: (state, action: PayloadAction<RegistrationForm | null>) => {
      state.selectedForm = action.payload
    },
  },
})

export const {
  setForms,
  addForm,
  updateForm,
  deleteForm,
  addCustomField,
  updateCustomField,
  deleteCustomField,
  reorderFields,
  setSelectedForm,
} = registrationFormSlice.actions

export default registrationFormSlice.reducer
