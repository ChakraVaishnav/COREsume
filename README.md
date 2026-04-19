# COREsume

COREsume is a Next.js resume platform with AI-assisted writing, ATS analysis, credit-based premium workflows, and a jobs dashboard that matches jobs against resume content.

![COREsume Logo](./public/CoresumeLogo.png)

## Product Features
### 1. Resume Builder + Live Preview
1. Multi-section form for personal info, summary, experience, projects, skills, achievements, and custom sections.
2. Live template preview while editing.
3. Multiple resume templates (free and premium variants).
4. Form state persistence in browser storage for draft continuity.
5. PDF-based resume extraction route to prefill structured resume content.

### 2. AI Resume Assist
1. AI endpoints for summary generation, skills generation, experience quantification, and project bullet generation/enhancement.
2. ATS analysis endpoint that scores uploaded resumes and returns strengths and improvements.
3. Fallback behavior for LLM provider outages (Gemini -> Groq in jobs analysis pipeline).

### 3. Jobs Dashboard
1. User can choose resume input mode:
   1. Paste Resume Text
   2. Use Current Resume Data from database
2. User can explicitly choose search mode:
   1. Use Your Free Search
   2. Fetch Premium Job Posts Using 5 Credits
3. Free search resets at 12:00 AM IST.
4. Free mode targets 10 jobs, premium mode targets 30 jobs.
5. If full target is not available, partial results are returned with a user-visible message instead of dropping all results.
6. Server-side pagination is enabled for jobs results (page + limit on API, not client-only slicing).
7. Jobs are stored per user and capped with rolling retention.

### 4. Credits + Payments
1. Credit wallet in user profile.
2. Razorpay order creation and verification flow.
3. Verified payments add credits to the authenticated user account.

### 5. Auth and Session Security
1. JWT access token + refresh token in HttpOnly cookies.
2. Session refresh support.
3. Protected API routes use request authentication middleware.
4. Sensitive AI, jobs, payment, user, feedback, and resume endpoints are authentication-guarded.

### 6. SEO and Analytics
1. Metadata, Open Graph, Twitter cards, and verification tags configured in app layout.
2. Sitemap generation configured via next-sitemap.
3. Vercel Analytics integrated globally.

## How Key Flows Work
### Jobs Search Flow
1. Frontend sends resumeText, jobQuery, location, and searchMode to jobs search API.
2. API validates authentication and mode limits:
   1. free: one daily search reset at IST midnight
   2. premium: requires 5 credits per search
3. Job fetcher aggregates listings from jobspy-js providers and deduplicates.
4. AI analyzes each job against resume text and returns normalized fit data.
5. Results are stored and returned with optional partial-results notice.

### Resume Source Flow (Jobs Dashboard)
1. Dashboard tries to load resume data from database.
2. If DB resume text exists, user can search directly from stored data.
3. If absent, user can paste resume text and save it to database.
4. Draft query/location/resume input state is persisted across page refresh.

## API Auth Coverage
### Public-by-design endpoints
1. Authentication bootstrap routes:
   1. /api/auth/login
   2. /api/auth/signup
   3. /api/auth/send-otp
   4. /api/auth/verify-otp
   5. /api/auth/refresh
2. Password recovery routes:
   1. /api/password/forgot-password-send-otp
   2. /api/password/forgot-password-verify-otp
   3. /api/password/reset-password
3. Logout route that clears cookies:
   1. /api/logout

### Auth-protected endpoints
1. All /api/jobs/* routes.
2. All /api/ai/* routes.
3. All /api/payment/* routes.
4. All /api/user/* routes.
5. /api/resume/get and /api/resume/save.
6. /api/feedback/* routes.
7. /api/password/change-password.

## Tech Stack
1. Next.js App Router (v15)
2. React (v19)
3. Prisma + PostgreSQL
4. JWT + cookie-based sessions
5. jobspy-js for jobs scraping
6. Gemini and Groq for AI features
7. Razorpay for payments
8. Tailwind CSS

## Local Setup
### 1. Install
```bash
npm install
```

### 2. Configure environment variables
Create a local .env file with your own values. Do not commit .env.

```env
# Database
DATABASE_URL="<your_database_url>"
DIRECT_URL="<your_direct_database_url>"

# Auth
JWT_SECRET="<your_jwt_secret>"
JWT_REFRESH_SECRET="<your_refresh_secret_optional>"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_ACCESS_MAX_AGE_SECONDS="3600"
JWT_REFRESH_MAX_AGE_SECONDS="604800"

# AI
GEMINI_API_KEY="<your_gemini_api_key>"
GROQ_API_KEY="<your_groq_api_key>"
JOBS_AI_GEMINI_TIMEOUT_MS="5000"
JOBS_AI_GROQ_TIMEOUT_MS="4000"
ATS_DEBUG_LOGS="false"

# Jobs fetch
JOBS_JOBSPY_TIMEOUT_MS="45000"
JOBS_JOBSPY_HOURS_OLD="168"

# Email
EMAIL_USER="<your_email_user>"
EMAIL_PASS="<your_email_password_or_app_password>"

# Payments
RAZOR_PAY_ID="<your_razorpay_key_id>"
RAZOR_PAY_SECRET="<your_razorpay_secret>"
```

### 3. Prisma generate
```bash
npm run prisma:generate
```

### 4. Run development server
```bash
npm run dev
```

### 5. Production build
```bash
npm run build
npm run start
```

## Security Notes
1. Never store real secrets in README, code, or git history.
2. Keep all API keys and credentials in environment variables only.
3. Use different secrets for development and production.
4. Rotate keys immediately if a leak is suspected.

## Useful Paths
1. Resume Form: /resume-form
2. Jobs Dashboard: /dashboard/jobs
3. Pricing: /pricing
4. Profile: /profile
