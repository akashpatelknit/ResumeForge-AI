# Features

Every claim below was verified by reading the actual route/component code — see
[docs/API.md](docs/API.md) for the exact request/response shape of every route
mentioned here.

## Resume Builder

**Status: Real**, end-to-end.

A sectioned form editor (`app/(app)/builder/[resumeId]/`, `builder/new/`) for personal
info, experience, education, skills, projects, achievements, certifications, and
languages, with a live client-side PDF preview rendered by `@react-pdf/renderer`
against real templates (`components/pdf/template/*`).

- **API routes**: `GET/POST /api/resumes`, `GET/PUT/DELETE /api/resumes/[id]` — all
  Clerk-authed, all real Prisma reads/writes via `lib/db/resumes.ts`.
- **Prisma models**: `Resume` (content lives in the `data` JSON column), `Resume` →
  `ResumeAnalytics` (event log, e.g. ATS analysis history).
- **Note**: `POST /api/resumes/save` looks like it should be part of this flow but is
  a dead stub with zero callers — the real save path is `saveResume()`
  (`lib/api/resumes.ts`), which POSTs to `/api/resumes` for a new resume or PUTs to
  `/api/resumes/[id]` for an existing one.
- New resumes are seeded with a full example (not blank) — `createNewResume()` in
  `store/resumeStore.ts` starts from sample data the user edits from, not an empty form.

## ATS / JD Match Analysis

**Status: Real**, with one caveat.

`app/(app)/dashboard/jobs/analyzer/page.tsx` renders `JobDescriptionAnalyzer`
(`components/builder/ai/JobDescriptionAnalyzer.tsx`), which calls a real backend route.

- **API route**: `POST /api/ai/analyze-jd` — Clerk-authed, subscription-gated
  (`checkAiGate`), loads the real resume, calls the real AI dispatch (`generateText()`
  in `lib/ai/llm.ts`) via `lib/ai/generateAnalyzeJd.ts`, and writes an `ats_analysis`
  event to `ResumeAnalytics` so prior-score comparison works on the next run.
- **Prisma models**: `Resume`, `ResumeAnalytics`.
- **Caveat**: the `atsScore` shown elsewhere in the app (dashboard resume cards, Recent
  Resumes table) is a field inside `Resume.data`, defaulted at creation/parse time — the
  real analyze-jd flow above does **not** write back to that field automatically. The
  analysis itself is real AI output persisted to `ResumeAnalytics`; the score badge you
  see on a resume card reflects a separately-set value, not necessarily this analysis's
  output. Worth reconciling if a single "current ATS score" is meant to be one number.

## AI Resume Editor / writing assistance

**Status: Real for 9 of 10 routes; 1 is a dead stub.**

Every route below shares the same pattern: Clerk `auth()` → `checkAiGate` (subscription
usage limit) → real work → `recordAiGeneration` on success.

| Feature | Route | Status |
|---|---|---|
| Rewrite/generate summary | `POST /api/ai/generate-summary` | **Real** — Gemini/OpenAI/Anthropic via `lib/ai/generateSummary.ts` |
| Generate achievements | `POST /api/ai/generate-achievements` | **Real** |
| Generate custom section | `POST /api/ai/generate-custom-section` | **Real** |
| Generate highlights | `POST /api/ai/generate-highlights` | **Real** |
| Generate cover letter | `POST /api/ai/generate-cover-letter` | **Real** — returns text, does not persist a `CoverLetter` row (that model has zero writers anywhere in the codebase) |
| Tailor resume to a JD | `POST /api/ai/tailor-resume` | **Real** — deliberately read-only: returns tailored fields without saving; the client decides whether to save the result as a new resume |
| Extract job identity (company/role) from pasted text | `POST /api/ai/extract-job-identity` | **Real** — never invents a value, returns empty strings when the text doesn't clearly state one |
| LaTeX → structured resume | `POST /api/ai/latex-to-resume` | **Real** |
| Draft a project entry from a GitHub repo | `POST /api/ai/generate-project-from-repo` | **Real** — fetches the repo's actual README via the GitHub API first |
| Improve a bullet point | `POST /api/ai/improve-bullet` | **STUB** — hardcoded placeholder response, no auth check, no AI call, zero callers anywhere in the current UI |

- **Prisma models**: `Resume` (read for context on several of these).
- **External dependency**: all "Real" rows above depend on at least one of
  `GEMINI_API_KEY`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` being set.

## PDF Export

**Status: Real, via two separate mechanisms — the dedicated route is a dead stub.**

- **Active path**: the resume builder's form-based flow renders PDFs entirely
  client-side via `@react-pdf/renderer`'s `pdf()` function
  (`components/builder/preview/PDFPreview.tsx`) against real template components — no
  backend round-trip.
- **Secondary, currently-disabled path**: `POST /api/compile-latex` (Clerk-authed) is a
  fully real server-side LaTeX compile using a locally-run **Tectonic** engine
  (`lib/latex/compile.ts`, spawned via `execFile`, with timeout/size limits and error
  parsing), returning genuine compiled PDF bytes. The Overleaf-style LaTeX editor UI
  that would call this route is currently commented out in
  `app/(app)/builder/[resumeId]/page.tsx` ("disabled here, not deleted") pending
  re-enablement — the backend works, the entry point to it is switched off.
- **Dead stub**: `POST /api/pdf/generate` returns a hardcoded placeholder and has no
  callers anywhere — despite the name, it does not power either PDF path above.
- Quick Apply (Cold Outreach) has its own independent real PDF generation inline in
  `app/api/outreach/quick-apply/send/route.ts`, using the same `@react-pdf/renderer`
  `renderToBuffer()` to attach a resume PDF to the outreach email.

## Job Tracker / Job Applications ("All")

**Status: Real.**

Two views over the same data: `app/(app)/dashboard/jobs/tracker/` is a Kanban board
(drag-and-drop status changes), `app/(app)/dashboard/jobs/all/` is a flat list —
both read/write the identical `JobApplication` rows.

- **API routes**: `GET/POST /api/applications`, `PATCH/DELETE /api/applications/[id]`
  — Clerk-authed, real Prisma via `lib/db/applications.ts`.
- **Prisma model**: `JobApplication` — `status` is a free-text field defaulting to
  `"wishlist"`, validated against a fixed set (`wishlist|applied|interview|offer|rejected`)
  at the API layer rather than a Prisma enum. Has a `source` field ("manual" vs. created
  from a smart-prompt suggestion) that isn't surfaced in the board UI, kept for
  traceability.
- Independent of Job Discovery below — an applications row has no relation to a
  `SavedJob` row beyond an optional `resumeId` link.

## Job Discovery

**Status: Real**, live external data + real persistence for saved/queued jobs.

`app/(app)/dashboard/jobs/discover/` live-fetches job postings from Greenhouse's public
boards API (`lib/jobs/greenhouseClient.ts`, Redis-cached ~2hr), merges them with the
user's own manually-added listings, and supports filtering (company, location, source,
role type, experience level, keyword, posted-within-days) with pagination.

- **API routes**: `GET /api/jobs/discover` (the merged/filtered/paginated listing),
  `POST /api/jobs/save` / `POST /api/jobs/unsave` (bookmark or queue a listing, manual
  or Greenhouse-sourced), `GET /api/jobs/queue-count` (lightweight count for a sidebar
  widget), `GET/PUT/DELETE /api/jobs/preferences` (saved filter defaults).
- **Prisma models**: `SavedJob` (bookmark/queue flags, outreach fields — see Cold
  Outreach below), `UserPreferences` (saved filters, namespaced under
  `jobDiscoveryFilters`).
- See [Why Greenhouse-only](ARCHITECTURE.md#why-greenhouse-only-for-job-discovery) and
  [Why jobs are fetched live](ARCHITECTURE.md#why-jobs-are-fetched-live-and-only-persisted-on-save)
  in the architecture doc.

## Cold Outreach / Quick Apply

**Status: Real** for Gmail connection, email generation, and sending. One scope
boundary deliberately left mock (documented in-code, not a gap I'm flagging as new).

A user connects their own Gmail account (OAuth), then for any job (from Job Discovery
or manually) can AI-generate a tailored outreach email with their resume attached as a
PDF, and send it for real through the Gmail API.

- **API routes**:
  - `GET /api/gmail/connect` — starts the OAuth flow (redirect to Google consent)
  - `GET /api/gmail/callback` — real token exchange, encrypts and stores tokens
  - `GET /api/gmail/status` — real connection status (attempts a live token refresh,
    not just a timestamp check)
  - `POST /api/gmail/disconnect` — real, deletes the stored `GmailAccount` row
  - `POST /api/outreach/quick-apply/draft` — saves an in-progress draft (skips the
    stricter validation the generate endpoint applies, on purpose — a draft can be
    incomplete)
  - `POST /api/outreach/quick-apply/extract` — AI auto-fill from pasted job text
  - `POST /api/outreach/quick-apply/generate` — real AI email generation + persistence
  - `POST /api/outreach/quick-apply/send` — the real send: resolves a valid Gmail
    token, renders the resume to PDF, sends via the Gmail API, records the result
  - `GET /api/outreach/queue` — real queue + stats (sent today, replies this week,
    bounce rate, scheduled count), computed from actual `SavedJob` rows
- **Prisma models**: `GmailAccount` (encrypted OAuth tokens), `QuickApplyEntry`
  (one row reused across generate → regenerate → send for a session, so retries don't
  pile up duplicate rows), `SavedJob` (`outreachType`/`outreachStatus`/
  `scheduledSendTime`/`lastActivityAt`).
- **Scope boundary already documented in the schema**: `SavedJob.outreachType`
  selection in the "Generate & Review" panel is deliberately left unwired — the
  schema comment describes this as "an earlier, still-standing scope boundary," not
  something newly discovered here.
- See [Why gmail.send-only scope](ARCHITECTURE.md#why-gmailsend-only-scope) in the
  architecture doc.

## Subscription / Billing

**Status: Real.**

Free and Pro plans, enforced server-side, real Razorpay Checkout integration with a
7-day trial, and webhook-driven status sync.

- **API routes**: `POST /api/subscription/create` (starts a Razorpay subscription with
  a 7-day delayed first charge — the actual trial mechanism, not a coupon), `POST
  /api/subscription/cancel` (real Razorpay cancel + immediate local status update, not
  waiting on the webhook), `GET /api/subscription/status` (read-only, entirely from
  local tables — never calls Razorpay live), `POST /api/webhooks/razorpay` (HMAC-signature-verified
  webhook receiver — the **sole writer** of confirmed subscription state; every other
  route only reads the local `Subscription` table).
- **Prisma models**: `Subscription`, `PlanConfig` (admin-editable price/limits,
  singleton row), `UsageCounter` (per-user-per-month AI generation count, free tier
  only — Pro usage is never recorded since it's uncapped).
- **Enforcement points**: `lib/subscription/aiGate.ts` (every AI route),
  `lib/subscription/checkResumeLimit.ts` (resume creation).
- Razorpay subscriptions require a fixed total billing-cycle count (no native
  "until cancelled"); this app sets `total_count: 120` (10 years of monthly cycles) as
  the standard workaround.

## Admin Dashboard

**Status: Real.** Entirely separate auth from the rest of the app.

`/admin` (login at `/admin/login`) — a bcrypt+JWT session system with a single-row
`Admin` table, no relation to Clerk. See
[Why admin auth is separate](ARCHITECTURE.md#why-admin-auth-is-separate-from-clerk).

- **Pages**: Dashboard (analytics), Users, Subscriptions, Templates, Plans & Pricing,
  Settings (admin's own password change).
- **API routes** (all under `app/api/admin/*`, all gated by `requireAdminSession()`):
  `GET analytics`, `POST change-password`, `POST login` (rate-limited, timing-safe
  against a dummy hash when no account matches), `POST logout`, `GET/PUT plan-config`,
  `PATCH subscriptions/[userId]` (local-only override, documented as never calling
  Razorpay), `GET subscriptions`, `PATCH templates/[templateId]`, `GET templates`,
  `POST users/[userId]/block`, `POST users/[userId]/unblock`, `GET users` (lists real
  Clerk users via the Backend API, joined in memory with local Postgres data —
  subscription, resume count, block status).
- **Prisma models**: `Admin`, `UserStatus` (the block flag — also enforced at the
  `proxy.ts` middleware layer for every signed-in Clerk request, not just admin UI
  display), `TemplateMeta`, `PlanConfig`, plus read access to `Subscription` and
  `Resume` for analytics/listing.

## Consumer Settings

**Status: Mostly real** — see the per-card breakdown, since this page mixes real and
placeholder sections deliberately (each labeled in-code).

- **Profile info**: real — name/email/avatar from Clerk's `useUser()`, saved via
  Clerk's real `user.update()`/`user.setProfileImage()`. Phone/location are persisted
  via `GET/PUT /api/user/profile`, stored in `UserPreferences.preferences` (namespaced
  JSON, same pattern as Job Discovery's saved filters).
- **Billing summary**: real — same data as `GET /api/subscription/status`.
- **Connected Accounts**: Gmail row is real (same `/api/gmail/*` routes as Cold
  Outreach). GitHub row is a visual placeholder — no persistent GitHub connection
  exists anywhere in the app.
- **Notification Preferences**: 4 toggles, **local UI state only** — no schema field,
  no API route, resets on page refresh. Labeled as such in the UI.
- **Danger Zone (delete account)**: the confirmation dialog (type-to-confirm) is real
  and functional; there is no deletion endpoint behind it. Clicking through shows an
  explanatory message rather than pretending to succeed.

## Not covered above, but real and worth knowing about

- **Anonymous resume parsing** (`POST /api/resume/parse`) — works pre-login, the one
  deliberately public AI route, rate-limited by an anonymous cookie ID via Redis.
- **GitHub repo import into a resume** (`GET /api/github/repos`,
  `POST /api/ai/generate-project-from-repo`) — real, but unauthenticated (public
  GitHub API only, no OAuth) and one-off — not the same thing as the "Connected
  Accounts > GitHub" placeholder above, which implies a persistent connection that
  doesn't exist.
