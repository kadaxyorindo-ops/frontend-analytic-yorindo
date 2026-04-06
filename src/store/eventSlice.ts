import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { CreateEventDTO, Event } from "@/types/event"
import { mockEvents } from "@/utils/mockData"
import { api } from "@/services/api"

interface EventApiItem {
  _id: string
  title?: string
  description?: string
  status?: string
  event_date?: string
  date?: string
  start_at?: string
  starts_at?: string
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
  if (status === "published" || status === "active" || status === "open") {
    return "published"
  }
  if (status === "closed" || status === "cancelled" || status === "canceled") {
    return "closed"
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
  max_capacity: item.max_capacity ?? item.capacity ?? 0,
  registered_count: item.registered_count ?? item.registeredCount ?? 0,
  created_at: item.created_at ?? item.createdAt ?? new Date().toISOString(),
  updated_at: item.updated_at ?? item.updatedAt ?? new Date().toISOString(),
})

export const fetchEvents = createAsyncThunk<Event[], void, { rejectValue: string }>(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    const result = await api.get<{ items: EventApiItem[] }>("/api/v1/events")
    if (result.error || !result.data) {
      return rejectWithValue(result.error ?? "Gagal mengambil data event.")
    }

    return (result.data.items ?? []).map(mapEvent)
  }
)

interface EventState {
  events: Event[]
  isLoading: boolean
  selectedEvent: Event | null
}

const initialState: EventState = {
  events: mockEvents,
  isLoading: false,
  selectedEvent: null,
}

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    addEvent: (
      state,
      action: PayloadAction<CreateEventDTO & { exhibitor_id: string }>
    ) => {
      const newEvent: Event = {
        event_id: `EVT-${Date.now()}`,
        ...action.payload,
        registered_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      state.events.push(newEvent)
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
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.length > 0) {
          state.events = action.payload
        }
      })
      .addCase(fetchEvents.rejected, (state) => {
        state.isLoading = false
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
