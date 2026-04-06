import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"

export const useEvents = () => {
  return useSelector((state: RootState) => state.events)
}
