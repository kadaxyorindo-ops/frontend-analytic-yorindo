export interface SurveyQuestion {
  id: string
  question: string
  type: "rating" | "text" | "textarea" | "select" | "radio"
  required: boolean
  options?: string[]
  order: number
}

export interface SurveyForm {
  form_id: string
  event_id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
  link_survey: string
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}
