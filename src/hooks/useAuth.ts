import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"

export const useAuth = () => {
  return useSelector((state: RootState) => state.auth)
}
