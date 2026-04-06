export interface Event {
  event_id: string
  exhibitor_id: string
  title: string
  description: string
  event_date: string
  location: string
  status: "draft" | "published" | "closed"
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
  status: "draft" | "published" | "closed"
  max_capacity: number
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}
