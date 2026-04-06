import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { FormBuilderData } from "../types/formBuilder";
import { api } from "@/services/api";

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
    if (!slug) {
      return rejectWithValue("Missing event slug");
    }

    const result = await api.get<FormBuilderData>(
      `/api/v1/form-builder/slug/${encodeURIComponent(slug)}`
    );

    if (result.error || !result.data) {
      return rejectWithValue(result.message || "Failed to fetch form");
    }

    return result.data;
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
