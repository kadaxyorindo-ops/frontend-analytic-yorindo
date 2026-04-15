# Frontend Analytic Yorindo (Yorindo EMS)

The frontend for the **Exhibition / Event Management System (EMS)**: a comprehensive platform for event management, event workspaces (participants + analytics), and public pages for **dynamic form-based participant registration** and **feedback surveys**.

---

## Key Features

### Internal Dashboard
* **OTP Authentication**: OTP request & verification with persistent token/user storage in `localStorage`.
* **Event Management**: Comprehensive CRUD operations (Create, Read, Update, Delete), including list filtering/sorting and industry master data retrieval.
* **Event Workspace**:
    * **Event Details**: Displays public registration links (`/register/:slug`) and form snapshots (version, publication date, field count).
    * **Participant Management**: List of registrations with status tracking (Pending, Approved, Rejected, Checked-in) and search functionality.
    * **Event Analytics**: Concise metrics, registration trends, status breakdowns, and top industries/cities (powered by **Recharts**) + optional **AI Insights** (with `sessionStorage` caching).
    * **Advanced Analytics**: Dedicated views for Survey and Feedback analytics.
* **Form Builder**:
    * **Registration Form Builder** (`/events/:eventId/registration-form`): Supports fixed and custom fields, various input types (Text, Textarea, Select, Radio, Checkbox), required fields, and conditional logic.
    * **Survey Form Builder** (`/events/:eventId/survey-form`): Default ratings + custom question types.

### Public Pages
* **Participant Registration**: `/register/:slug` (dynamic form loading based on slug, dynamic validation, and backend submission) + a **Review Step** at `/register/:slug/review`.
* **Feedback Survey**: `/feedback` or `/feedback/:slug` (currently **client-only**: data is logged to the console and not yet sent to the server).

---

## Tech Stack

* **Core**: React + TypeScript (Vite)
* **Routing**: React Router
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS + shadcn/ui + Radix UI
* **Form Handling**: React Hook Form + Zod
* **Visualization**: Recharts

---

## Prerequisites

* Node.js (Latest LTS version recommended)
* Running EMS Backend (Default local: `http://localhost:5000`)

---

## Getting Started (Local Development)

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    * Copy `.env.example` to `.env`
    * Set the backend base URL:
        `VITE_API_BASE_URL=http://localhost:5000`

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Access the application**:
    Open `http://localhost:5173` in your browser.

---

## Environment Variables

* **`VITE_API_BASE_URL`**: Used by the fetch wrapper in `src/services/api.ts` for internal dashboard requests. (Fallback: `http://localhost:5000`).
* **`VITE_API_URL`** (Optional): Used specifically in the public registration page. If unset, it defaults to the relative path `/api/v1/form-builder/slug`.

> **Dev Proxy Note**: `vite.config.ts` proxies paths starting with `/api` to `http://localhost:5000` to handle relative requests during development.

---

## Project Structure (Summary)

* `src/pages`: Routing components and page views.
* `src/components`: Reusable components and UI primitives (`/ui`).
* `src/services`: API access layer (fetch wrapper + domain services).
* `src/store`: Redux slices and state logic.
* `src/types`: TypeScript type definitions.
* `src/utils`: Helper functions (formatters, chart helpers, error parsing).

---

## Important Notes

* **Authentication**: Tokens are stored in `localStorage` under `ems_auth_token`, and user data under `ems_auth_user`.
* **Endpoints**: Core auth utilizes `/api/v1/auth/request-otp`, `/api/v1/auth/verify-otp`, and `/api/v1/auth/me`.
* **Development Status**: Some pages (Global Dashboard, certain non-event pages) are currently wireframes/placeholders.
* **Documentation**:
    * `CODEBASE-OVERVIEW.md`: Structure and main components.
    * `PLAN_USER_MANAGEMENT.md`: Future plans for User CRUD and Permissions.
    * `BACKEND-EMS-YORINDO-LEARNING-NOTES.md`: Backend integration notes.

---

## Troubleshooting

* **API Connection Failures**: Verify the backend is running and the `VITE_API_BASE_URL` matches. Ensure backend endpoints follow the `/api/v1/*` prefix.
