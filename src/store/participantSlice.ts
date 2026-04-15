import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Participant, ParticipantFilter } from "@/types/participant"
import { mockParticipants } from "@/utils/mockData"

interface ParticipantState {
  participants: Participant[]
  isLoading: boolean
  selectedParticipant: Participant | null
  filters: ParticipantFilter
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: ParticipantState = {
  participants: mockParticipants,
  isLoading: false,
  selectedParticipant: null,
  filters: {
    search: "",
    status: "all",
    industry: "",
    position: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: mockParticipants.length,
  },
}

const participantSlice = createSlice({
  name: "participants",
  initialState,
  reducers: {
    setParticipants: (state, action: PayloadAction<Participant[]>) => {
      state.participants = action.payload
      state.pagination.total = action.payload.length
    },
    addParticipant: (state, action: PayloadAction<Participant>) => {
      state.participants.push(action.payload)
      state.pagination.total = state.participants.length
    },
    updateParticipant: (
      state,
      action: PayloadAction<{
        participant_id: string
        updates: Partial<Participant>
      }>
    ) => {
      const index = state.participants.findIndex(
        (participant) => participant.participant_id === action.payload.participant_id
      )
      if (index !== -1) {
        state.participants[index] = {
          ...state.participants[index],
          ...action.payload.updates,
        }
      }
    },
    setSelectedParticipant: (
      state,
      action: PayloadAction<Participant | null>
    ) => {
      state.selectedParticipant = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ParticipantFilter>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setAttendance: (
      state,
      action: PayloadAction<{ participant_id: string; is_attended: boolean }>
    ) => {
      const index = state.participants.findIndex(
        (participant) => participant.participant_id === action.payload.participant_id
      )
      if (index !== -1) {
        state.participants[index].is_attended = action.payload.is_attended
        state.participants[index].attended_at = action.payload.is_attended
          ? new Date().toISOString()
          : undefined
      }
    },
  },
})

export const {
  setParticipants,
  addParticipant,
  updateParticipant,
  setSelectedParticipant,
  setFilters,
  setPage,
  setAttendance,
} = participantSlice.actions

export default participantSlice.reducer
