export interface User {
  id: string
  name: string
  email: string
  role: "super_admin" | "exhibitor"
  exhibitor_id?: string
  company_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  company_name: string
  phone: string
}
