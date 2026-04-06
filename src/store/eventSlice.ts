import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { CreateEventDTO, Event } from "@/types/event"
import { mockEvents } from "@/utils/mockData"

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
})

export const {
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  updateRegisteredCount,
} = eventSlice.actions
export default eventSlice.reducer
