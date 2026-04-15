import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Event } from "@/types/event"
import { api } from "@/services/api"

interface EventApiItem {
  _id: string
  slug?: string
  category?: string | null
  industry?: { refId?: string | null; name?: string | null } | null
  title?: string
  description?: string
  status?: string
  event_date?: string
  eventDate?: string
  date?: string
  start_at?: string
  starts_at?: string
  approvedCount?: number
  pendingCount?: number
  checkedInCount?: number
  totalCount?: number
  location?:
    | string
    | {
        name?: string
        address?: string
        city?: string
      }
  max_capacity?: number
  capacity?: number
  registered_count?: number
  registeredCount?: number
  exhibitor_id?: string
  exhibitorId?: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

const normalizeStatus = (value?: string): Event["status"] => {
  const status = value?.toLowerCase()
  if (status === "published" || status === "active" || status === "registration" || status === "upcoming") {
    return "published"
  }
  if (status === "closed" || status === "cancelled" || status === "done") {
    return "closed"
  }
  if (status === "ongoing") {
    return "ongoing"
  }
  return "draft"
}

const normalizeLocation = (
  value: EventApiItem["location"]
): string => {
  if (!value) return "TBA"
  if (typeof value === "string") return value
  const parts = [value.name, value.address, value.city].filter(Boolean)
  return parts.length ? parts.join(", ") : "TBA"
}

const normalizeDate = (item: EventApiItem) =>
  item.event_date ||
  item.date ||
  item.start_at ||
  item.starts_at ||
  new Date().toISOString()

const mapEvent = (item: EventApiItem): Event => ({
  event_id: item._id,
  exhibitor_id: item.exhibitor_id ?? item.exhibitorId ?? "super_admin",
  title: item.title ?? "Untitled Event",
  description: item.description ?? "",
  event_date: normalizeDate(item),
  location: normalizeLocation(item.location),
  status: normalizeStatus(item.status),
  industry: item.industry ?? null,
  category: item.category ?? null,
  max_capacity:
    item.max_capacity ??
    item.capacity ??
    item.totalCount ??
    item.registeredCount ??
    item.registered_count ??
    0,
  registered_count:
    item.registered_count ??
    item.registeredCount ??
    item.approvedCount ??
    0,
  created_at: item.created_at ?? item.createdAt ?? new Date().toISOString(),
  updated_at: item.updated_at ?? item.updatedAt ?? new Date().toISOString(),
})

type EventPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type FetchEventsParams = {
  page?: number
  limit?: number
  status?: string
  sortBy?: "eventDate" | "createdAt" | "title"
  sortOrder?: "asc" | "desc"
}

export const fetchEvents = createAsyncThunk<
  { items: Event[]; pagination: EventPagination },
  FetchEventsParams | undefined,
  { rejectValue: string }
>(
  "events/fetchEvents",
  async (params, { rejectWithValue }) => {
    const query = new URLSearchParams()
    query.set("ts", String(Date.now()))

    const page = params?.page
    const limit = params?.limit
    const status = params?.status
    const sortBy = params?.sortBy
    const sortOrder = params?.sortOrder

    if (typeof page === "number") query.set("page", String(page))
    if (typeof limit === "number") query.set("limit", String(limit))
    if (typeof status === "string" && status.trim()) query.set("status", status.trim())
    if (sortBy) query.set("sortBy", sortBy)
    if (sortOrder) query.set("sortOrder", sortOrder)

    const result = await api.get<{
      items: EventApiItem[]
      pagination: EventPagination
    }>(`/api/v1/events?${query.toString()}`)

    if (result.error || !result.data) {
      return rejectWithValue(result.error ?? "Gagal mengambil data event.")
    }

    return {
      items: (result.data.items ?? []).map(mapEvent),
      pagination: result.data.pagination ?? {
        page: page ?? 1,
        limit: limit ?? 10,
        total: (result.data.items ?? []).length,
        totalPages: 1,
      },
    }
  }
)

type CreateEventPayload = {
  title: string
  description?: string | null
  category?: string | null
  industry: { refId: string | null; name: string | null }
  eventDate: string
  location?: string | null
  registrationForm?: { fields: unknown[] }
  createdBy?: string
}

export const createEventRemote = createAsyncThunk<
  Event,
  CreateEventPayload,
  { rejectValue: string }
>("events/createEventRemote", async (payload, { rejectWithValue }) => {
  const result = await api.post<EventApiItem>("/api/v1/events", {
    ...payload,
    registrationForm: payload.registrationForm ?? { fields: [] },
  })

  if (result.error || !result.data) {
    return rejectWithValue(result.error ?? "Gagal membuat event.")
  }

  return mapEvent(result.data)
})

type UpdateEventPayload = {
  eventId: string
  updates: {
    title?: string
    description?: string | null
    category?: string | null
    industry?: { refId: string | null; name: string | null }
    eventDate?: string
    location?: string | null
    status?: string
  }
}

export const updateEventRemote = createAsyncThunk<
  Event,
  UpdateEventPayload,
  { rejectValue: string }
>("events/updateEventRemote", async ({ eventId, updates }, { rejectWithValue }) => {
  const result = await api.patch<EventApiItem>(`/api/v1/events/${eventId}`, updates)

  if (result.error || !result.data) {
    return rejectWithValue(result.error ?? "Gagal memperbarui event.")
  }

  return mapEvent(result.data)
})

export const deleteEventRemote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("events/deleteEventRemote", async (eventId, { rejectWithValue }) => {
  const result = await api.delete<null>(`/api/v1/events/${eventId}/hard`)

  if (result.error) {
    return rejectWithValue(result.error ?? "Gagal menghapus event.")
  }

  return eventId
})

interface EventState {
  events: Event[]
  isLoading: boolean
  selectedEvent: Event | null
  pagination: EventPagination
  error: string | null
}

const initialState: EventState = {
  events: [], // Mulai dari kosong, jangan mock data terus
  isLoading: false,
  selectedEvent: null,
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  },
  error: null,
}

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload);
},
    updateEvent: (
      state,
      action: PayloadAction<{ event_id: string; updates: Partial<Event> }>
    ) => {
      const index = state.events.findIndex(
        (event) => event.event_id === action.payload.event_id
      )
      if (index !== -1) {
        state.events[index] = {
          ...state.events[index],
          ...action.payload.updates,
          updated_at: new Date().toISOString(),
        }
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(
        (event) => event.event_id !== action.payload
      )
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload
    },
    updateRegisteredCount: (
      state,
      action: PayloadAction<{ event_id: string; count: number }>
    ) => {
      const target = state.events.find(
        (event) => event.event_id === action.payload.event_id
      )
      if (target) {
        target.registered_count = action.payload.count
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.events = action.payload.items // Selalu pakai data dari DB
        state.pagination = action.payload.pagination
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? "Gagal mengambil data event."
      })
      .addCase(createEventRemote.pending, (state) => {
        state.error = null
      })
      .addCase(createEventRemote.fulfilled, (state, action) => {
        state.events.unshift(action.payload)
      })
      .addCase(createEventRemote.rejected, (state, action) => {
        state.error = action.payload ?? "Gagal membuat event."
      })
      .addCase(updateEventRemote.pending, (state) => {
        state.error = null
      })
      .addCase(updateEventRemote.fulfilled, (state, action) => {
        const index = state.events.findIndex(
          (event) => event.event_id === action.payload.event_id,
        )
        if (index !== -1) {
          state.events[index] = action.payload
        }
      })
      .addCase(updateEventRemote.rejected, (state, action) => {
        state.error = action.payload ?? "Gagal memperbarui event."
      })
      .addCase(deleteEventRemote.pending, (state) => {
        state.error = null
      })
      .addCase(deleteEventRemote.fulfilled, (state, action) => {
        state.events = state.events.filter(
          (event) => event.event_id !== action.payload,
        )
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        state.pagination.totalPages = Math.max(
          1,
          Math.ceil(state.pagination.total / Math.max(state.pagination.limit, 1)),
        )
      })
      .addCase(deleteEventRemote.rejected, (state, action) => {
        state.error = action.payload ?? "Gagal menghapus event."
      })
  },
})

export const {
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  updateRegisteredCount,
} = eventSlice.actions
export default eventSlice.reducer
