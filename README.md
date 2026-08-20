# Rezlo

Rezlo is a job-search toolkit for job seekers: build a resume in a structured
form editor with a live PDF preview, get AI help writing and tailoring the content, track
applications on a Kanban board, discover live job postings, and send AI-drafted outreach
emails — from your own Gmail account — to recruiters. It's a Next.js SaaS app with Clerk
auth, Postgres via Prisma, a pluggable AI provider (Gemini/OpenAI/Anthropic), Razorpay
billing, and a separate internal admin dashboard for support/ops.

This README is verified against the actual code, not aspirational feature copy — see
[docs/FEATURES.md](docs/FEATURES.md) for the full real/partial/mock breakdown behind
every claim below.

## Features

### Live — real, working end-to-end

- **Resume Builder** — sectioned form editor (personal info, experience, education,
  skills, projects, achievements, certifications, languages), full Postgres persistence,
  live client-side PDF preview (`@react-pdf/renderer`), multiple templates.
- **AI writing assistance** — generate/rewrite a summary, achievements, highlights,
  and custom sections; tailor a resume's wording to a job description; audit a LinkedIn
  profile; turn a LaTeX resume into structured data; parse an uploaded PDF/DOCX resume
  (works pre-login, with an anonymous rate limit); draft a project entry from a GitHub
  repo README. All routed through one real LLM call (Gemini, OpenAI, or Anthropic,
  whichever key is configured).
- **ATS/JD Match Analysis** — paste a job description against a resume and get a real
  AI-generated match analysis, with history tracked per resume.
- **Job Application Tracker** — Kanban board + flat list over your own tracked
  applications (wishlist → applied → interview → offer/rejected), full CRUD.
- **Job Discovery** — live job listings pulled from Greenhouse's public boards API
  (Redis-cached), mergeable with your own manually-added postings; bookmark or queue
  any listing.
- **Cold Outreach / Quick Apply** — connect your own Gmail (OAuth, `gmail.send`-only
  scope), AI-draft a tailored outreach email with your resume attached as a PDF, and
  send it for real through the Gmail API. Queue stats (sent today, replies this week,
  bounce rate) are computed from real send history.
- **Subscription billing** — Free/Pro plans enforced server-side (resume count + AI
  generation caps), real Razorpay Checkout subscription with a 7-day trial, real
  webhook-driven status sync, self-serve cancel.
- **Admin dashboard** (`/admin`, fully separate login from Clerk) — user list with
  block/unblock, subscription overrides, template flags, platform-wide plan pricing/
  limits config, admin password change. Real Postgres reads/writes throughout.
- **Consumer Settings page** — profile info (synced to/from Clerk), billing summary,
  connected accounts (Gmail is real; GitHub is a placeholder), notification toggles
  (not yet persisted — see below), account deletion confirmation flow (deletion itself
  isn't wired yet).

### In Progress — UI exists, but backend is mock, a dead stub, or disabled

- **`POST /api/resumes/save`**, **`POST /api/ai/improve-bullet`**, **`POST /api/pdf/generate`**
  — all three are byte-identical leftover stubs that return a hardcoded placeholder
  response regardless of input, and have **zero callers anywhere in the current
  frontend**. The features they sound like they'd power are actually implemented
  elsewhere (resume save is `POST/PUT /api/resumes[/[id]]`; PDF export is client-side
  `@react-pdf/renderer`, or server-side via the LaTeX pipeline below).
- **LaTeX/Overleaf-style resume editor** — the backend (`POST /api/compile-latex`,
  a real local Tectonic LaTeX compile) works, but the editor UI that would use it is
  currently commented out in the builder page, pending re-enablement.
- **Notification preferences** — 4 toggles on the Settings page are local component
  state only; there's no schema field or API route for them yet.
- **GitHub account connection** (Settings > Connected Accounts) — visual placeholder
  only. GitHub integration elsewhere in the app (repo import into a resume) is a
  one-off unauthenticated public-repo lookup by username, not a persistent OAuth
  connection.
- **Account deletion** — the confirmation dialog (type-to-confirm) is real; there is
  no deletion endpoint behind it yet, and no defined behavior for what happens to a
  deleted user's resumes/subscription/connected accounts.
- **Dashboard Analytics page** and the duplicate route `app/(app)/settings/page.tsx`
  (not linked from navigation — the real Settings page is `app/(app)/dashboard/settings`)
  — empty stubs.
- **Notes column, in-app notification bell** — present in the UI, not wired to any
  backend.

See [docs/FEATURES.md](docs/FEATURES.md) for the full feature-by-feature breakdown with
API routes and Prisma models, and [docs/API.md](docs/API.md) for every route's exact
status.

## Tech stack

Verified against `package.json` and actual import usage — not assumed.

| Layer | What's actually used |
|---|---|
| Framework | Next.js 16.1.6 (App Router), React 19.2, TypeScript |
| Styling / UI | Tailwind CSS 4, shadcn/ui, `radix-ui`, `lucide-react` |
| Auth (consumer) | Clerk (`@clerk/nextjs`), via `proxy.ts` (Next 16's renamed middleware entry point — not `middleware.ts`) |
| Auth (admin) | Fully separate: bcrypt password hash + JWT (`jose`) in an `admin_session` cookie, its own `Admin` Prisma table — no relation to Clerk |
| Database | PostgreSQL via **Prisma 7** (custom client output path: `@/app/generated/prisma`), connected through `@prisma/adapter-pg` |
| AI | Pluggable: `@google/genai` (Gemini), `openai`, `@anthropic-ai/sdk` — one dispatch point in `lib/ai/llm.ts`, auto-selected by whichever API key is set |
| Job data | Greenhouse's public boards API (no auth required), live-fetched and Redis-cached |
| Billing | Razorpay (`razorpay` SDK), webhook-verified |
| Email sending | Gmail API via `googleapis`, OAuth2, `gmail.send`-scoped |
| Caching / rate limiting | Upstash Redis (`@upstash/redis`) — fails open (skips, doesn't block) if unconfigured |
| PDF | `@react-pdf/renderer` (client-side, the active path) and a local **Tectonic** LaTeX compile (server-side, currently disabled in the UI) |
| State | Zustand |
| Forms / validation | `react-hook-form`, Zod |
| Code editor | CodeMirror (`@codemirror/*`) |

**Not actually used**, despite being installed or mentioned in older docs: Supabase
(`@supabase/ssr`, `@supabase/supabase-js` — zero code references, the real datastore is
plain Postgres+Prisma), NextAuth, `@google/generative-ai` (superseded by `@google/genai`),
`@hookform/resolvers`, `@monaco-editor/react`, `@neondatabase/serverless`,
`@prisma/adapter-neon`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full
dependency audit.

## Setup

### Prerequisites

- Node.js 20+
- A Postgres database (any provider — this is not tied to Supabase)
- npm

### 1. Install

```bash
git clone https://github.com/akashpatelknit/Rezlo.git
cd Rezlo
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Every variable actually referenced in the code is listed in `.env.example` with a
comment explaining what it's for and where to get it. At minimum for local dev you need:

- `DATABASE_URL` / `DIRECT_URL` — your Postgres connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from [clerk.com](https://clerk.com)
- One AI provider key (`GEMINI_API_KEY` is the simplest to get a free key for)

Everything else (Razorpay, Gmail OAuth, Upstash Redis, admin dashboard, encryption key)
is optional for basic local development — those features degrade gracefully or are
simply unavailable without their keys, rather than crashing the app.

### 3. Database

```bash
npx prisma migrate dev   # applies the existing migration history to your DB
npx prisma generate      # regenerates the client into app/generated/prisma (also runs automatically on `npm run build`)
```

### 4. (Optional) Seed an admin account

```bash
# set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_JWT_SECRET in .env first
npm run seed:admin
```

Then sign in at `/admin/login`. This is a separate account system from your regular
Clerk-authenticated user — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#admin-auth)
for why.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## More documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system overview, folder structure, key design decisions
- [docs/FEATURES.md](docs/FEATURES.md) — every feature, its real implementation status, routes and models involved
- [docs/API.md](docs/API.md) — every API route, method, auth, request/response shape, and status

## License

MIT
