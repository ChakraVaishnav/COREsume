# COREsume

> COREsume is a modern resume builder that helps students and professionals craft ATS-friendly resumes with AI-powered suggestions, beautifully designed templates, and an intuitive resume form → preview → download flow.

![COREsume Logo](./public/CoresumeLogo.png)

---

## 🚀 Features

- **AI-Powered Enhancements**
  - Generate or enhance Summary, Skills, Experience, and Project descriptions using credits-backed AI actions.
  - Warning modal prompts for credit usage with “Don’t remind me again” checkbox persisted in local storage.

- **Premium & Free Templates**
  - Multiple templates (`single-column`, `two-column`, `timeline`, and premium variants).
  - Free templates skip credit deduction and download directly.
  - Premium templates require credits; warns the user, deducts one credit after print/download, and redirects to pricing if credits are insufficient.

- **Resume Flow**
  - Multi-section resume form (personal info, summary, experience, education, skills, achievements, projects, interests).
  - Persisted form data and template selection in `localStorage`.
  - Real-time resume preview with print/download workflow (`window.print()`) and page count estimate.

- **Account & Payments**
  - Email-based authentication with sessions stored via JWT.
  - Stripe/Razorpay placeholders for purchasing credit plans.
  - Pricing page features starter and premium credit bundles, offer banners, and “Most Popular” badges.

- **Admin / Analytics**
  - API routes for fetching credits, deducting credits, exporting data to Excel, authentication, and contact/feedback forms.
  - Supabase/PostgreSQL backend accessed through Prisma client (`lib/prisma.js` → `generated/prisma` client).

- **SEO & Performance**
  - Custom `app/layout.js` metadata: title, description, keywords, canonical URL, Open Graph, and Twitter card tags.
  - Google & Microsoft verification meta tags.
  - Fonts loaded via `next/font` (Geist, Merriweather, Inter).
  - Print-friendly styling with `@media print` and watermark/visibility controls.

---

## 📁 Project Structure (key folders)

- `app/`: Next.js App Router entry with pages such as `resume-form`, `resume-preview`, `pricing`, `dashboard`, `auth`, `templates`, and policy pages.
- `components/`: Shared UI like `Navbar`, `Footer`, `Navbar`, `PageLayout`, and ad units.
- `lib/`: `mail.js` (Nodemailer setup) and singleton `prisma.js`.
- `prisma/`: Schema and migrations for Supabase/PostgreSQL.
- `public/`: Static assets (`CoresumeLogo.png`, `robots.txt`, sitemap, potentially video file).
- `app/api/`: Routes for auth, user credits, AI actions, exports, and more.

---

## 📦 Installation

```bash
npm install
npx prisma generate
```

Ensure `.env` contains:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="app-password"
```

---

## 🛠️ Development

```bash
npm run dev
```

Access the app at `http://localhost:3000`.  
Use `/resume-form` to build, `/resume-preview` to download, `/pricing` to purchase credits.

---

## 🧠 AI Credits Flow

1. User logs in with email/password (JWT).
2. Credits fetched using `/api/user/credits`.
3. AI actions (`/api/ai/...`) charged only if credits > 0.
4. Warning modal allows confirmation and optional “don’t remind me” toggle.
5. Premium downloads deduct 1 credit via `/api/user/deduct-credit` through `afterprint` event.

---

## 📈 Export Data

Use `/api/export/excel` (SheetJS) to export Prisma data into `.xlsx` (requires valid Supabase connection).

---

## 🎯 SEO & Marketing

- Metadata defined in `app/layout.js` (title, description, keywords, Open Graph, Twitter).
- Social meta tags and canonical link point to `https://coresume.in/`.
- Ads and offer banners placed inside app pages (e.g., `ads.txt`, `pricing` copy).

---

## 📸 Media Assets

- **Logo**: `public/CoresumeLogo.png`
- **Video**: (add your promotional video file under `public/` and reference it in README or landing content if needed)

---

## 🔄 Deployment

- Build for production:
  ```bash
  npm run build
  npm run start
  ```
- Ensure environment variables are set in your hosting platform (Vercel/Supabase/Render).
- Run `npx prisma migrate deploy` if migrations exist.

---

## 📚 Additional Notes

- Remove `console.log`/`console.error` from production (already handled).
- Use `.history/` snapshots and backups for env/config tracking.
- Check Supabase status if you see intermittent 500 errors from Prisma.

---

Feel free to flesh out sections with screenshots, badges, or the promotional video from your `public/` folder to create a richer README.
