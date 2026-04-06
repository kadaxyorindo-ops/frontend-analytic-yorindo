export interface Participant {
  participant_id: string
  event_id: string
  nama_lengkap: string
  nama_company: string
  lokasi_perusahaan: string
  jenis_industri: string
  jabatan: string
  email_pribadi: string
  email_perusahaan: string
  no_hp: string
  custom_responses?: Record<string, unknown>
  is_attended: boolean
  attended_at?: string
  registered_at: string
  has_filled_survey: boolean
  survey_response_id?: string
}

export interface ParticipantFilter {
  search?: string
  status?: "all" | "registered" | "attended"
  industry?: string
  position?: string
  date_from?: string
  date_to?: string
}
