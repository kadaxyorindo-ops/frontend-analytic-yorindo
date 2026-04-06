// store/formBuilderSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  FormBuilderData,
} from "../types/formBuilder";

type FormBuilderResponse = {
  success: boolean;
  message: string;
  data: FormBuilderData;
};

interface FormBuilderState {
  data: FormBuilderData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: FormBuilderState = {
  data: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunk for fetching form builder data
export const fetchFormBuilder = createAsyncThunk(
  "formBuilder/fetchFormBuilder",
  async (slug: string, { rejectWithValue }) => {
    try {
      if (!slug) {
        return rejectWithValue("Missing event slug");
      }

      const response = await axios.get<FormBuilderResponse>(
        `/api/v1/form-builder/slug/${encodeURIComponent(slug)}`,
        { headers: { "Content-Type": "application/json" } },
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch form");
      }

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch form builder";
        return rejectWithValue(message);
      }

      const message =
        error instanceof Error ? error.message : "Failed to fetch form builder";
      return rejectWithValue(message);
    }
  },
);

const formBuilderSlice = createSlice({
  name: "formBuilder",
  initialState,
  reducers: {
    resetFormBuilder: (state) => {
      state.data = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormBuilder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormBuilder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
      })
      .addCase(fetchFormBuilder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetFormBuilder } = formBuilderSlice.actions;
export default formBuilderSlice.reducer;
