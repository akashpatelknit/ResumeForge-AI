# Rezlo — Project Overview

This is the ground-truth doc: everything here was verified against the actual source, not the README's aspirational feature list. Where the existing docs in this folder (`ARCHITECTURE.md`, `DASHBOARD.md`, etc.) disagree with the code, the code wins and the discrepancy is called out below.

## What it is

An AI-assisted resume/job-application toolkit built as a Next.js SaaS app. Users sign up, build a resume in a structured form builder with live preview, export it to PDF, and use a handful of AI tools (job-description-driven LinkedIn messages and cold emails) — plus a Kanban-style job application tracker.

## Tech stack (as actually used, not as documented)

| Layer | Actual |
|---|---|
| Framework | Next.js 16.1.6 (App Router), React 19.2, TypeScript |
| Styling / UI | Tailwind CSS 4, shadcn/ui, `radix-ui`, `lucide-react` |
| Auth | Clerk (`@clerk/nextjs`) — via `proxy.ts` as the Next middleware |
| Database | PostgreSQL via **Prisma 7** (`@prisma/client`), with adapters for both Neon (`@prisma/adapter-neon`) and plain `pg` (`@prisma/adapter-pg`) available |
| AI | Google Gemini via `@google/genai` (`lib/gemini.ts`, model `gemini-2.5-flash-lite`). `@google/generative-ai` and `openai` are installed as deps but unused in the AI call paths found. |
| State | Zustand (`store/`) |
| Forms/validation | `react-hook-form` + Zod |
| PDF | `@react-pdf/renderer` (React-based templates) **and** a separate LaTeX-compilation route that calls the external `latexonline.cc` service |
| Charts | `recharts` |

**Note:** README.md and `docs/ARCHITECTURE.md` both describe **Supabase** as the database and mention NextAuth as an alternative to Clerk. Neither is true of the current code — the real datastore is Prisma+Postgres and the real auth is Clerk only. `lib/supabase/*` files exist but the resume CRUD path (`lib/db/resumes.ts`) goes through Prisma, not Supabase.

## Folder structure

```
app/
├── (marketing)/        # public: landing, features, pricing, templates
├── (auth)/              # login, signup (Clerk)
├── (app)/                # authenticated app shell
│   ├── dashboard/         # home, resumes list, template gallery, analytics(stub), jobs/tracker, jobs/analyzer, ai/linkedin, ai/cold-emails
│   ├── builder/[resumeId]/ and builder/new/   # resume editor
│   ├── cover-letter/
│   └── settings/          # stub
├── api/
│   ├── resumes/, resumes/[id]/, resumes/save/
│   ├── ai/{analyze-jd, cold-email, generate-cover-letter, improve-bullet, linkedin}/
│   ├── pdf/generate/
│   └── compile-latex/
└── generated/prisma/     # generated Prisma client output

components/
├── builder/               # form sections, AI helper widgets, live/PDF preview
├── dashboard/              # stats cards, resume list/grid, template grid, activity chart, AI insights
├── marketing/               # landing page sections
├── pdf/                      # @react-pdf/renderer templates (Modern/Professional/Minimal)
├── shared/, modal/, ui/        # shadcn/ui primitives + shared chrome (sidebar, header, error boundary)

lib/
├── prisma.ts, db/resumes.ts    # DB access layer
├── gemini.ts, openai.ts          # AI clients (Gemini is the one actually wired up)
├── ai/                              # cold-email + linkedin prompt builders & generators
└── supabase/                          # present but not on the main resume CRUD path

store/            resumeStore.ts (resume CRUD + editing), uiStore.ts
hooks/            useAutoSave, useLoadResume, useResume, useAIAnalysis(empty), useTemplates, useDebounce, useLocalStorage
mapper/           mapResumeFromDB.ts — maps Prisma's Resume{data: Json} row into the flat AppResume shape the UI uses
types/            resume.ts, ai.ts, database.ts, template.ts
config/           sections.ts, site.ts, templates.ts (3 seed templates: modern, professional, classic)
prisma/schema.prisma
proxy.ts          Clerk middleware (route protection)
```

## Data model (`prisma/schema.prisma`)

- **Resume** — `id (uuid)`, `userId`, `title`, `templateId`, `data (Json)`, timestamps. All resume content (personal info, experience, education, skills, projects, achievements, certifications, languages, ATS score, favorite flag, thumbnail) lives inside the `data` JSON blob — a hybrid schema (indexed columns for querying, flexible JSON for content). Has-many `CoverLetter`, `ResumeAnalytics`.
- **CoverLetter** — belongs to a Resume; `title`, `content`, optional `jobTitle`/`companyName`.
- **ResumeAnalytics** — event log per resume (`eventType`, `eventData Json`).
- **UserPreferences** — `userId (PK)`, `preferences Json`.

`types/resume.ts` defines the app-side `ResumeData`/`AppResume` shapes; `mapper/mapResumeFromDB.ts` converts a Prisma row into that shape for the Zustand store.

## Feature status — what's real vs. stubbed

This is the most important part to know before touching the code: several API routes are copy-pasted placeholders that all return the same hardcoded message.

| Route | Status |
|---|---|
| `GET/POST /api/resumes` | **Real** — Clerk-authed, calls `lib/db/resumes.ts` (Prisma) |
| `GET/PUT/DELETE /api/resumes/[id]` | **Real** — same pattern |
| `POST /api/resumes/save` | **Stub** — returns `{ message: "analyze-jd endpoint working" }` regardless of input |
| `POST /api/ai/analyze-jd` | **Stub** — same placeholder response |
| `POST /api/ai/generate-cover-letter` | **Stub** — same placeholder response |
| `POST /api/ai/improve-bullet` | **Stub** — same placeholder response |
| `POST /api/pdf/generate` | **Stub** — same placeholder response (despite `@react-pdf/renderer` templates existing in `components/pdf/`, they aren't wired to this route) |
| `POST /api/ai/cold-email` | **Real** — `lib/ai/generateColdEmails.ts` → Gemini via `lib/gemini.ts`, prompt built in `lib/ai/buildColdEmailPrompt.ts`, parses JSON out of the model response |
| `POST /api/ai/linkedin` | **Real** — `lib/ai/linkedin.ts` → same Gemini path |
| `POST /api/compile-latex` | **Real** but calls an **external third-party service** (`latexonline.cc`) with unescaped user LaTeX — no sanitization/auth on this route |

Page-level status (by file size / inspection):
- `dashboard/jobs/tracker/page.tsx` (734 lines) and `dashboard/jobs/analyzer/page.tsx` (712 lines) — fully built out (Kanban tracker, JD analyzer UI).
- `dashboard/ai/linkedin/page.tsx` (667 lines) and `dashboard/ai/cold-emails/page.tsx` (752 lines) — fully built out, backed by the real API routes above.
- `dashboard/analytics/page.tsx` (7 lines) and `settings/page.tsx` (5 lines) — **stubs**, not implemented.
- Resume builder (`app/(app)/builder/...`, `components/builder/*`) — implemented: sectioned form (personal info, experience, education, skills, projects, achievements), live preview, PDF preview component, template selector.
- Dashboard home (stats cards, quick actions, recent resumes table, activity chart, AI insights) — implemented but per `DASHBOARD.md` was built with **hardcoded sample data**; only the resumes list itself is API-backed via `lib/api/resumes.ts` / `useLoadResume` / `useAutoSave`.

## AI integration

- Single client: `lib/gemini.ts`, wraps `@google/genai`, model pinned to `gemini-2.5-flash-lite`, requires `GEMINI_API_KEY` env var.
- Two working features route through it: **cold email generation** and **LinkedIn content generation**, each with its own prompt-builder file (`lib/ai/buildColdEmailPrompt.ts`, `lib/ai/linkedinPrompts.ts`) and a `parseAIJson()` helper that strips Markdown code fences before `JSON.parse`.
- Resume-specific AI (JD analysis, bullet improvement, cover letter generation, ATS scoring) is scaffolded in the UI (`components/builder/ai/*`: `AIKeywordSuggestions`, `ATSScoreCard`, `BulletPointImprover`, `JobDescriptionAnalyzer`) but **not connected** — their backing API routes are the stubs listed above.

## Auth & routing

`proxy.ts` is the Clerk middleware entry point (not the conventional `middleware.ts` name — worth knowing since Next.js normally expects `middleware.ts` at the project root; check `next.config.ts` / build output if middleware doesn't seem to fire). Public routes: `/`, `/sign-in`, `/sign-up`, `/features`, `/templates`, `/pricing`, `/api/webhooks/*`. Everything else requires `auth.protect()`.

## State management

- `store/resumeStore.ts` — the main Zustand store: loads/saves/creates/deletes resumes against the API, plus granular mutators for each resume section (experience, education, skills, projects). Note `createNewResume(templateId, userId)` seeds a full example resume (Alex Johnson / Stripe / Razorpay sample data) rather than a blank one.
- `store/uiStore.ts` — UI-only state (not inspected in depth here).

## Known gaps worth flagging to whoever works on this next

1. **PDF export and resume-side AI features are UI-complete but backend-stubbed** — the highest-value unfinished work is wiring `analyze-jd`, `improve-bullet`, `generate-cover-letter`, and `pdf/generate` to real logic.
2. **`compile-latex` sends raw user input to an unauthenticated third-party endpoint** (`latexonline.cc`) with no auth check on the route itself — worth reviewing before this goes further.
3. **README/ARCHITECTURE docs describe Supabase + NextAuth**; actual stack is Prisma/Postgres + Clerk only. The `docs/` folder overall reads as planning/marketing material generated ahead of (or alongside) implementation, not as living documentation — treat it as historical intent, not current state.
4. **Dashboard analytics and settings pages are empty stubs** despite `DASHBOARD.md` documenting a full analytics feature set.
