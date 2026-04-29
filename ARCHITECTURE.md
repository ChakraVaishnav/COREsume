# COREsume — Architecture & File Map

This document summarizes the main folders, important files, and their responsibilities to help contributors understand the project structure quickly.

Root folders
- `app/` — Next.js app routes and client components
  - `app/resume-form/ResumeForm.jsx` — Large single-page resume builder form with many sections and state. Recommended: split into smaller components under `components/resume/` (PersonalInfo, ExperienceEditor, ProjectEditor, etc.).
  - `app/resume-preview/` — Live preview page that reads `resumeFormData` from localStorage and renders appropriate template component.
  - `app/templates/` — Template components (single-column, two-column, ats-classic, etc.). Each template reads preview data from localStorage and renders the resume layout for printing/export.
  - `app/dashboard/*` — Admin and dashboard pages (templates, resume-from-pdf, jobs, etc.).

- `components/` — Reusable components
  - `components/ui/` — small UI primitives (Spinner, Toast, ConfirmModal)
  - `components/form/` — small form field wrappers (`FormField`, `TextAreaField`) to be used across the resume form.
  - `components/resume/` — higher-level resume form sections (SectionCard, editors) — incrementally extract from `ResumeForm.jsx`.

- `lib/` — helpers, utilities and server clients
  - `lib/prisma.js` — Prisma client singleton for server usage.
  - `lib/mail.js` — Nodemailer setup and helpers for OTP/email sending.
  - `lib/api.js` — Centralized client-side API helper for consistent fetch behavior (GET/POST with credentials and JSON parsing).
  - `lib/auth/` — authentication helpers (tokens, session parsing, `session.js` provides `authenticateRequest` used by server code and middleware).

- `prisma/` — DB schema (see `schema.prisma`) and migrations.

Important behaviors & recommendations
- Centralize API calls through `lib/api.js` to unify error handling and credentials. Replace scattered `fetch` calls progressively.
- Decompose `ResumeForm.jsx` into many smaller components to improve readability, reuse, and testability.
- Templates should consume data via a small hook `useResumeData()` instead of each reading localStorage; this makes testing and SSR-compatible behavior easier.
- Authentication: `middleware.js` protects selected routes by calling `lib/auth/session.authenticateRequest()`. Keep server-side validation for API endpoints as well.

Auth flow summary
- `lib/auth/session.js` provides functions to create sessions, parse cookies, and refresh using refresh tokens.
- `middleware.js` uses `authenticateRequest` to redirect unauthenticated users to `/login` for protected pages.

Next steps (recommended)
1. Extract shared UI to `components/ui/` (done for Spinner/Toast/ConfirmModal).
2. Incrementally extract `ResumeForm` sections into `components/resume/` and adopt `components/form/*` fields.
3. Replace remaining raw `fetch` calls with `lib/api.js`.
4. Add unit tests for pure helpers in `lib/` and components.
