export interface Event {
  event_id: string
  exhibitor_id: string
  title: string
  description: string
  event_date: string
  location: string
  status: "draft" | "published" | "closed" | "ongoing"
  industry?: { refId?: string | null; name?: string | null } | null
  category?: string | null
  max_capacity: number
  registered_count: number
  created_at: string
  updated_at: string
}

export interface CreateEventDTO {
  title: string
  description: string
  event_date: string
  location: string
  status: "draft" | "published" | "closed" | "ongoing"
  max_capacity: number
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}
