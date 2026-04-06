export interface FixField {
  name: string
  label: string
  type: "text" | "email" | "tel"
  required: boolean
  order: number
}

export interface CustomField {
  id: string
  label: string
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "textarea"
    | "radio"
    | "checkbox"
    | "select"
    | "date"
    | "file"
  options?: string[]
  required: boolean
  placeholder?: string
  condition?: {
    dependsOn: string
    value: string
  }
  order: number
}

export interface RegistrationForm {
  form_id: string
  event_id: string
  title: string
  fix_fields: FixField[]
  custom_fields: CustomField[]
  link_pendaftaran: string
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateRegistrationFormDTO {
  title: string
  custom_fields: Omit<CustomField, "id">[]
}
