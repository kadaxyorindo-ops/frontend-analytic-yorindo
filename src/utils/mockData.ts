import type { Event } from "@/types/event"
import type {
  RegistrationForm,
  FixField,
  CustomField,
} from "@/types/registration-form"
import type { Participant } from "@/types/participant"
import type { SurveyForm, SurveyQuestion } from "@/types/survey-form"
import type { SurveyResponse } from "@/types/survey-response"
import type { User } from "@/types/user"

export const defaultFixFields: FixField[] = [
  { name: "nama_lengkap", label: "Nama Lengkap", type: "text", required: true, order: 1 },
  { name: "nama_company", label: "Nama Perusahaan", type: "text", required: true, order: 2 },
  { name: "lokasi_perusahaan", label: "Lokasi Perusahaan", type: "text", required: true, order: 3 },
  { name: "jenis_industri", label: "Jenis Industri", type: "text", required: true, order: 4 },
  { name: "jabatan", label: "Jabatan", type: "text", required: true, order: 5 },
  { name: "email_pribadi", label: "Email Pribadi", type: "email", required: true, order: 6 },
  { name: "email_perusahaan", label: "Email Perusahaan", type: "email", required: true, order: 7 },
  { name: "no_hp", label: "Nomor HP", type: "tel", required: true, order: 8 },
]

const registrationCustomFields: CustomField[] = [
  {
    id: "custom-1",
    label: "Tipe Rumah Sakit",
    type: "select",
    options: ["Rumah Sakit Umum", "Klinik", "Laboratorium"],
    required: true,
    order: 9,
  },
  {
    id: "custom-2",
    label: "Jumlah Karyawan",
    type: "radio",
    options: ["1-10", "10-50", "50-100", "100+"],
    required: false,
    order: 10,
  },
]

const defaultSurveyQuestions: SurveyQuestion[] = [
  { id: "sq-1", question: "Overall Rating", type: "rating", required: true, order: 1 },
  { id: "sq-2", question: "Material Quality", type: "rating", required: true, order: 2 },
  { id: "sq-3", question: "Speaker Performance", type: "rating", required: true, order: 3 },
  { id: "sq-4", question: "Facility Rating", type: "rating", required: true, order: 4 },
  {
    id: "sq-5",
    question: "Apa yang paling berkesan dari event ini?",
    type: "textarea",
    required: false,
    order: 5,
  },
]

export const mockUsers: User[] = [
  {
    id: "super-admin-1",
    name: "Raka Admin",
    email: "admin@yorindo.com",
    role: "super_admin",
    created_at: "2024-09-01T09:00:00",
    updated_at: "2024-09-01T09:00:00",
  },
  {
    id: "exhibitor-user-1",
    name: "Hugoyangdombret",
    email: "hugoestowork@gmail.com",
    role: "exhibitor",
    exhibitor_id: "EXH-001",
    company_name: "Innovasia Digital",
    phone: "081234567890",
    created_at: "2024-09-10T10:00:00",
    updated_at: "2024-09-10T10:00:00",
  },
  {
    id: "exhibitor-user-2",
    name: "Bima Wirawan",
    email: "bima@futurelabs.id",
    role: "exhibitor",
    exhibitor_id: "EXH-002",
    company_name: "Future Labs",
    phone: "081298765432",
    created_at: "2024-09-12T10:00:00",
    updated_at: "2024-09-12T10:00:00",
  },
]

export const currentUser = mockUsers[1]

export const mockEvents: Event[] = [
  {
    event_id: "EVT-001",
    exhibitor_id: "super_admin",
    title: "Tech Conference 2024",
    description: "Konferensi teknologi tahunan dengan pembicara dari seluruh Indonesia.",
    event_date: "2024-12-15T09:00:00",
    location: "Jakarta Convention Center, Jakarta",
    status: "published",
    max_capacity: 500,
    registered_count: 245,
    created_at: "2024-10-01T10:00:00",
    updated_at: "2024-10-01T10:00:00",
  },
  {
    event_id: "EVT-002",
    exhibitor_id: "EXH-001",
    title: "React JS Workshop",
    description: "Workshop intensif React JS untuk pemula hingga mahir.",
    event_date: "2024-11-20T13:00:00",
    location: "Yogyakarta",
    status: "published",
    max_capacity: 100,
    registered_count: 78,
    created_at: "2024-10-05T14:30:00",
    updated_at: "2024-10-05T14:30:00",
  },
  {
    event_id: "EVT-003",
    exhibitor_id: "EXH-001",
    title: "Digital Marketing Seminar",
    description: "Strategi digital marketing untuk bisnis modern.",
    event_date: "2024-11-25T10:00:00",
    location: "Surabaya",
    status: "draft",
    max_capacity: 200,
    registered_count: 0,
    created_at: "2024-10-10T09:15:00",
    updated_at: "2024-10-10T09:15:00",
  },
  {
    event_id: "EVT-004",
    exhibitor_id: "EXH-002",
    title: "AI Summit 2024",
    description: "Membahas masa depan Artificial Intelligence.",
    event_date: "2024-12-01T08:00:00",
    location: "Bali Nusa Dua Convention Center",
    status: "published",
    max_capacity: 300,
    registered_count: 189,
    created_at: "2024-10-08T11:00:00",
    updated_at: "2024-10-08T11:00:00",
  },
]

export const mockRegistrationForms: RegistrationForm[] = [
  {
    form_id: "FORM-001",
    event_id: "EVT-001",
    title: "Registration Form - Tech Conference 2024",
    fix_fields: defaultFixFields,
    custom_fields: registrationCustomFields,
    link_pendaftaran: "https://yorindo.com/register/EVT-001",
    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=register/EVT-001",
    is_active: true,
    created_at: "2024-10-20T09:00:00",
    updated_at: "2024-10-20T09:00:00",
  },
]

export const mockSurveyForms: SurveyForm[] = [
  {
    form_id: "SURVEY-FORM-001",
    event_id: "EVT-001",
    title: "Survey Feedback - Tech Conference 2024",
    description: "Bantu kami meningkatkan kualitas event berikutnya.",
    questions: defaultSurveyQuestions,
    link_survey: "https://yorindo.com/survey/EVT-001",
    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=survey/EVT-001",
    is_active: true,
    created_at: "2024-12-01T09:00:00",
    updated_at: "2024-12-01T09:00:00",
  },
]

export const mockParticipants: Participant[] = [
  {
    participant_id: "PART-001",
    event_id: "EVT-001",
    nama_lengkap: "Budi Santoso",
    nama_company: "Tech Solutions",
    lokasi_perusahaan: "Jakarta",
    jenis_industri: "Technology",
    jabatan: "Software Engineer",
    email_pribadi: "budi@gmail.com",
    email_perusahaan: "budi@techsolutions.com",
    no_hp: "081234567890",
    custom_responses: {
      tipe_rs: "Rumah Sakit Umum",
      jumlah_karyawan: "50-100",
    },
    is_attended: true,
    attended_at: "2024-12-15T10:30:00",
    registered_at: "2024-12-01T09:00:00",
    has_filled_survey: true,
    survey_response_id: "SURV-001",
  },
  {
    participant_id: "PART-002",
    event_id: "EVT-001",
    nama_lengkap: "Siti Rahayu",
    nama_company: "Digital Innovation",
    lokasi_perusahaan: "Bandung",
    jenis_industri: "Technology",
    jabatan: "Product Manager",
    email_pribadi: "siti@gmail.com",
    email_perusahaan: "siti@digital.com",
    no_hp: "081234567891",
    custom_responses: {
      tipe_rs: "Klinik",
      jumlah_karyawan: "10-50",
    },
    is_attended: false,
    registered_at: "2024-12-02T14:00:00",
    has_filled_survey: false,
  },
  {
    participant_id: "PART-003",
    event_id: "EVT-002",
    nama_lengkap: "Agus Wijaya",
    nama_company: "Startup Hub",
    lokasi_perusahaan: "Yogyakarta",
    jenis_industri: "Education",
    jabatan: "Developer",
    email_pribadi: "agus@gmail.com",
    email_perusahaan: "agus@startup.com",
    no_hp: "081234567892",
    custom_responses: {},
    is_attended: true,
    attended_at: "2024-11-20T14:00:00",
    registered_at: "2024-11-15T10:00:00",
    has_filled_survey: true,
    survey_response_id: "SURV-002",
  },
]

export const mockSurveyResponses: SurveyResponse[] = [
  {
    response_id: "SURV-001",
    event_id: "EVT-001",
    participant_id: "PART-001",
    overall_rating: 5,
    material_quality: 5,
    speaker_performance: 5,
    facility_rating: 4,
    comment: "Materi sangat bermanfaat dan pembicara sangat kompeten.",
    recommend_to_others: true,
    submitted_at: "2024-12-15T16:00:00",
  },
  {
    response_id: "SURV-002",
    event_id: "EVT-002",
    participant_id: "PART-003",
    overall_rating: 4,
    material_quality: 4,
    speaker_performance: 5,
    facility_rating: 4,
    comment: "Workshop padat dan praktis, sangat membantu untuk tim kami.",
    recommend_to_others: true,
    submitted_at: "2024-11-20T17:30:00",
  },
]
