# Redux Toolkit Form Builder Integration

## Overview

This implementation integrates Redux Toolkit with React Hook Form to create a dynamic, API-driven form builder for event registration.

## Architecture

### 1. Redux Store Structure

**Location:** `src/store/`

- **`store.ts`** - Redux store configuration
- **`formBuilderSlice.ts`** - Redux slice for form builder state + async thunk

### 2. Redux Slice: `formBuilderSlice.ts`

**State Shape:**

```typescript
{
  data: FormBuilderData | null,
  loading: boolean,
  error: string | null,
  success: boolean
}
```

**Thunk:** `fetchFormBuilder(slug: string)`

- Fetches form config from: `https://unvulcanised-zoey-unresourcefully.ngrok-free.dev/api/v1/form-builder/slug/{slug}`
- Adds header: `'ngrok-skip-browser-warning': 'true'`
- Handles success/error states automatically

### 3. Custom Hooks

**Location:** `src/hooks/useAppDispatch.ts`

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);
```

Provides typed dispatch and selector functions.

### 4. Type Definitions

**Location:** `src/types/formBuilder.ts`

Core types:

- `FormBuilderResponse` - API response wrapper
- `FormBuilderData` - Complete form configuration
- `FixedField` - Standard form fields
- `CustomQuestion` - Dynamic custom fields
- `Field` - Union of FixedField | CustomQuestion

### 5. Dynamic Form Component

**Location:** `src/components/FormBuilder.tsx`

Features:

- Dynamically builds Zod validation schema from fields
- Renders fields based on type: `text`, `email`, `phone`, `textarea`, `radio`, `checkbox`, `select`
- Integrates with React Hook Form for form state management
- Shows loading/error states
- Field-level error messages

### 6. Registration Page

**Location:** `src/pages/registration-visitor/index.tsx`

Flow:

1. useEffect dispatches `fetchFormBuilder` on mount
2. Redux thunk fetches data from API
3. FormBuilder component renders when data is available
4. Form submission logs data (ready for backend integration)

## Data Flow

```
index.tsx
  ↓
useEffect → dispatch(fetchFormBuilder)
  ↓
formBuilderSlice Thunk
  ↓
Fetch API + ngrok header
  ↓
Redux Store (data/loading/error/success)
  ↓
useAppSelector reads state
  ↓
FormBuilder Component Renders
  ↓
User fills form
  ↓
handleFormSubmit → Console log (ready for API POST)
```

## Usage

### In a Component

```typescript
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { fetchFormBuilder } from "../store/formBuilderSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (state) => state.formBuilder
  );

  useEffect(() => {
    dispatch(fetchFormBuilder("yorindo-tech-expo-2026-88c2"));
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <div>{data?.event.title}</div>;
}
```

## Field Types Supported

| Type       | Component          | Example                      |
| ---------- | ------------------ | ---------------------------- |
| `text`     | Input              | "Full Name"                  |
| `email`    | Input type="email" | "Email Address"              |
| `phone`    | Input type="tel"   | "Phone Number"               |
| `textarea` | Textarea           | "Reason for Attending"       |
| `radio`    | Radio buttons      | "How did you hear about us?" |
| `checkbox` | Checkboxes         | "Which topics?"              |
| `select`   | Select/Dropdown    | "Industry Type"              |

## Validation

Zod schema is dynamically built from field definitions:

- `required` fields get `.min(1, "Field is required")`
- Optional fields are `.optional().or(z.literal(""))`
- Email fields use `.email("Invalid email address")`
- Phone fields use regex for digit validation

## Error Handling

- API errors from axios are caught and stored in Redux state as string messages
- Field-level validation errors from Zod are displayed inline
- Loading state prevents form submission during fetch
- Network errors show user-friendly message

## Next Steps for Backend Integration

1. **Form Submission:** Update `handleFormSubmit` in `index.tsx` to POST data to your API:

```typescript
const response = await fetch("/api/registrations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});
```

2. **Multiple Forms:** Create additional Redux slices for different form types

3. **Form Versioning:** Store `version` field in state for migration tracking

## Dependencies

- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React bindings for Redux
- `axios` - HTTP client
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod integration with react-hook-form

## Testing

Key areas to test:

1. Redux thunk dispatches and updates state
2. Form renders all field types correctly
3. Validation works for required/optional fields
4. Error messages display on validation failure
5. Form submission captures all field values
