# Frontend Analytic Yorindo - Codebase Overview

This document summarizes the current status of the code in `frontend-analytic-yorindo`, with key files and relationships.

## 1. Entry Points

- `src/main.tsx`: bootstraps the React app and renders `App`.
- `src/App.tsx`: root component that currently renders `RegistrationForm` from `src/pages/registration-visitor/index.tsx`.

## 2. Registration Pages

- `src/pages/registration-visitor/index.tsx`: main registration form screen.
  - uses `react-hook-form`, `zod` for validation.
  - local state for review modal (`ReviewModal` component).
  - imports `dummyFormBuilderData` from `src/components/pakaiDynamic` for panel info.

## 3. Dynamic Form / Dummy Data

- `src/components/pakaiDynamic.tsx`: exports `dummyFormBuilderData` object with event metadata and field definitions (`fixedFields`, `customQuestions`).
  - also contains `EventRegistrationPage` component (Non-home screen, currently not mounted in `App`).
  - includes the card with `Additional Information` using `formBuilderData` from dummy JSON.

- `src/components/pakaiDynamic.jsx`: re-exports from `pakaiDynamic.tsx` to keep old `.jsx` import paths compatible.

## 4. Dynamic Form Rendering

- `src/components/DynamicEventRegistrationForm.tsx`: core dynamic form renderer.
  - receives `formBuilderData` (data object or full API payload).
  - calculates active fields by merging `fixedFields` and `customQuestions`.
  - builds default values and renders fields by type (`text`, `email`, `phone`, `textarea`, `radio`, `checkbox`, `select`).

- `src/components/DynamicEventRegistrationForm.jsx`: re-exports `.tsx` to preserve React calls from older imports.

## 5. UI primitives

- `src/components/ui/*`: shared UI components (Card, Button, Input, Select, Textarea, Label).

## 6. Form Types

- `src/types/*`: definitions for forms and field renderers; may currently have import/export issues (some module members missing, needing rework).

## 7. Known issues (as of latest changes)

- `pakaiDynamic.jsx` previously had malformed content causing Babel parse errors in Vite (`Missing semicolon`). This is now resolved by redirecting it to `export` from TSX.
- DynamicEventRegistrationForm type inference warnings are still alive (implicit `any`) in `DynamicEventRegistrationForm.tsx` from the transitional conversion.
- `App.tsx` had an unused import to `EventRegistrationPage`; now cleaned to just render `RegistrationForm`.

## 8. Visual / Network runtime issues

- 404 for `DynamicEventRegistrationForm.jsx` path was resolved by creating a small export wrapper for `DynamicEventRegistrationForm.tsx`.

## 9. How to use

1. Start server: `npm run dev`
2. Open browser at `http://localhost:5173`
3. Registration flow lives in `src/pages/registration-visitor/index.tsx`.

## 9.1 ngrok public URL

If you need to share or test the app from outside your local network, expose the Vite dev server with ngrok:

1. Ensure the app is running locally with `npm run dev`.
2. Run ngrok for port `5173`:

```bash
ngrok http 5173
```

3. Copy the generated HTTPS URL from ngrok and use it to access the app remotely.

4. Optional: use a custom hostname if your ngrok plan supports it:

```bash
ngrok http -hostname=my-subdomain.ngrok.io 5173
```

## 10. Further improvements

- Add proper TypeScript interfaces rather than `any` for `DynamicEventRegistrationForm` props and `handleSubmitForm` payload.
- Convert `src/pages/registration-visitor/index.tsx` to accept `formBuilderData` as prop and avoid duplicate form schema hardcoding.
- Add tests for `DynamicEventRegistrationForm` field generation and validation.

notes tambahan perihal slug di pakaiDynamic.tsx
/register/:slug

↓
useParams ambil slug

↓
fetch ke backend

↓
setFormBuilderData

↓
UI render + DynamicEventRegistrationForm jalan