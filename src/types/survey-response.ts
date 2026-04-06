export interface SurveyResponse {
  response_id: string
  event_id: string
  participant_id: string
  overall_rating: number
  material_quality: number
  speaker_performance: number
  facility_rating: number
  comment: string
  recommend_to_others: boolean
  submitted_at: string
}
