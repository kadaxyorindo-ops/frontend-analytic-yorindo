// hooks/useAppDispatch.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

type Selector<T> = (state: RootState) => T;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: Selector<T>) =>
  useSelector(selector);
