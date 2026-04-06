import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/types/user"
import { currentUser } from "@/utils/mockData"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: currentUser,
  isAuthenticated: true,
  isLoading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem("user", JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem("user")
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    restoreUser: (state) => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        state.user = JSON.parse(storedUser) as User
        state.isAuthenticated = true
        return
      }

      state.user = currentUser
      state.isAuthenticated = true
    },
  },
})

export const { login, logout, setLoading, restoreUser } = authSlice.actions
export default authSlice.reducer
