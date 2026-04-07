## Backend EMS Yorindo (beginner-friendly notes)

These notes summarize the **read-only** backend repository at `backend-ems-yorindo` and how it connects to your frontend (`frontend-analytic-yorindo`). This is meant to **complement** the “Frontend audit and safe refactor plan” without modifying that plan file.

### Project structure overview (backend)

Backend entry points and major folders:

- **Startup**
  - `backend-ems-yorindo/src/server.ts`: boots the app, connects MongoDB, verifies Brevo SMTP, and starts an email queue consumer, then starts Express.
  - `backend-ems-yorindo/src/app.ts`: creates the Express app, sets middleware, health endpoints, and mounts the API router at `/api/v1`.

- **Routing layer (HTTP endpoints)**
  - `backend-ems-yorindo/src/routes/index.ts`: central router that mounts feature routers like `/form-builder`, `/events`, `/registrations`, etc.
  - Example: `backend-ems-yorindo/src/routes/formBuilder.routes.ts` defines form-builder endpoints.

- **Controller layer (HTTP → business logic)**
  - Example: `backend-ems-yorindo/src/controllers/formBuilder.controller.ts` reads request params/body and calls the service layer.

- **Service layer (business logic)**
  - Example: `backend-ems-yorindo/src/services/formBuilder.service.ts` constructs form fields, validates types/options, and reads/writes MongoDB via Mongoose models.

- **Models (MongoDB / Mongoose schemas)**
  - `backend-ems-yorindo/src/models/schemas/*.schema.ts` and sub-schemas under `schemas/sub/`.
  - Important: `backend-ems-yorindo/src/models/schemas/event.schema.ts` embeds the registration form definition into the Event document (`event.registrationForm`).

- **Shared types + helpers**
  - `backend-ems-yorindo/src/types/api/index.ts`: shared API response wrappers and request/view types.
  - `backend-ems-yorindo/src/utils/apiResponse.ts`: helpers like `sendSuccess()` / `sendError()` to keep responses consistent.

### How the backend serves data to the frontend

Your frontend currently fetches the registration form schema using this backend route:

- **GET** `/api/v1/form-builder/slug/:slug`
  - Route definition: `backend-ems-yorindo/src/routes/formBuilder.routes.ts`
  - Handler: `getFormBuilderBySlugHandler` in `backend-ems-yorindo/src/controllers/formBuilder.controller.ts`
  - Logic: `getFormBuilderBySlug(slug)` in `backend-ems-yorindo/src/services/formBuilder.service.ts`

That service returns a **FormBuilder view** (shape: event info + fixed fields + custom questions). In the backend types this shape is called `FormBuilderView`:

- `backend-ems-yorindo/src/types/api/index.ts` (`FormBuilderView`)

Your frontend’s equivalent types live in:

- `frontend-analytic-yorindo/src/types/formBuilder.ts` (`FormBuilderData`, `FormBuilderResponse`)

### The key “flow” (request → response) in simple terms

When the frontend opens `/register/:slug`:

1. **Frontend reads `slug` from the URL**
   - `frontend-analytic-yorindo/src/components/pakaiDynamic.tsx`
2. **Frontend calls the backend**
   - It requests `GET /api/v1/form-builder/slug/${slug}`
3. **Backend router finds the correct handler**
   - `app.ts` mounts `/api/v1` → `routes/index.ts` mounts `/form-builder` → `formBuilder.routes.ts` matches `/slug/:slug`
4. **Backend controller validates and delegates**
   - checks `slug` exists → calls `getFormBuilderBySlug(slug)`
5. **Backend service loads the Event from MongoDB**
   - finds `Event` by `{ slug }` and reads `event.registrationForm.fields`
6. **Backend responds with a consistent wrapper**
   - `sendSuccess(res, 200, "form builder fetched", data)`
7. **Frontend renders**
   - `FormBuilder.tsx` takes the returned fields and renders input components + validation.

### Where the form fields actually live (important)

In the backend design, the registration form is **embedded in the Event document**:

- `backend-ems-yorindo/src/models/schemas/event.schema.ts`
  - `event.registrationForm = { version, fields, publishedAt }`

That means:

- You do **not** fetch “a separate form table”; you fetch **an Event**, and the form definition is inside it.
- When the form changes and is published, the version is incremented.

### Why you see “fixedFields” and “customQuestions”

In the backend `formBuilder.service.ts`, fields are merged from:

- **Default fixed fields** (name, company, phone, etc.)
- **Custom questions** defined per event

Then the service returns them split again as:

- `fixedFields`: fields where `isFixed === true`
- `customQuestions`: fields where `isFixed === false`

See:

- `backend-ems-yorindo/src/services/formBuilder.service.ts` (`DEFAULT_FIXED_FIELDS`, `buildFields`, and the return object)

### Backend response shape (the “API wrapper”)

Most backend endpoints return a wrapper like:

- `success: true/false`
- `message: string`
- `data: ...`

These wrappers are defined in:

- `backend-ems-yorindo/src/types/api/index.ts` (`ApiSuccessResponse<T>`, `ApiErrorResponse`)

### How the frontend reaches the backend in development

Your frontend calls `/api/...` and Vite proxies it to your backend host:

- `frontend-analytic-yorindo/vite.config.ts` → `server.proxy["/api"].target = <your ngrok/base URL>`

Beginner tip: this is why frontend code can call **relative** URLs like `/api/v1/...` without hardcoding the backend hostname.

### What to study first (recommended order)

1. **Backend request lifecycle**
   - `backend-ems-yorindo/src/server.ts` → `backend-ems-yorindo/src/app.ts`
2. **Routing**
   - `backend-ems-yorindo/src/routes/index.ts` → `backend-ems-yorindo/src/routes/formBuilder.routes.ts`
3. **Controller → service**
   - `backend-ems-yorindo/src/controllers/formBuilder.controller.ts`
   - `backend-ems-yorindo/src/services/formBuilder.service.ts`
4. **Data model**
   - `backend-ems-yorindo/src/models/schemas/event.schema.ts` (registrationForm lives here)
5. **Frontend usage**
   - `frontend-analytic-yorindo/src/components/pakaiDynamic.tsx`
   - `frontend-analytic-yorindo/src/components/FormBuilder.tsx`
   - `frontend-analytic-yorindo/src/store/formBuilderSlice.ts`

