# API Reference

Every route below was read in full to produce this document — 51 `route.ts` files
under `app/api/`. Status labels: **Real** (genuine DB/external-service work), **Stub**
(hardcoded placeholder response regardless of input), **Public** (deliberately no auth,
noted why).

Unless noted otherwise, "Clerk-authed" means the handler calls
`const { userId } = await auth(); if (!userId) return 401`.

## ⚠️ Dead stubs — read this first

Three routes share a byte-identical body and have **zero callers anywhere in the
current frontend** (verified by grep across `app/`, `components/`, `hooks/`, `lib/`):

```ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "analyze-jd endpoint working" });
}
```

- `POST /api/resumes/save`
- `POST /api/ai/improve-bullet`
- `POST /api/pdf/generate`

No auth check, no body parsing, no real logic. The text "analyze-jd endpoint working"
regardless of the route's own name confirms these are leftover copy-paste clones from
before `analyze-jd` itself was implemented for real, never updated, never wired to any
UI. Do not build against them expecting the behavior their names suggest — the real
functionality lives elsewhere (see [FEATURES.md](FEATURES.md)).

---

## Resumes — `app/api/resumes/`, `app/api/resume/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/resumes` | GET | Clerk | **Real** — `getResumes(userId)`, lists the user's resumes |
| `/api/resumes` | POST | Clerk | **Real** — gated by `checkResumeCreationGate` (subscription resume-count limit), then `createResume` |
| `/api/resumes/[id]` | GET | Clerk, ownership-scoped | **Real** — `getResume(id, userId)` |
| `/api/resumes/[id]` | PUT | Clerk, ownership-scoped | **Real** — `updateResume(id, userId, data)` |
| `/api/resumes/[id]` | DELETE | Clerk, ownership-scoped | **Real** — `deleteResume(id, userId)` |
| `/api/resumes/save` | POST | none | **Stub** — see above |
| `/api/resume/parse` | POST | **Public** (deliberate) | **Real** |

**`GET /api/resumes`** → `200 Resume[]` (Prisma rows, `data` as raw JSON).

**`POST /api/resumes`** — body `{ title?, templateId?, data? }` → `201 Resume`, or
`403 { error: "UPGRADE_REQUIRED", message, limit, count }` if the free-tier resume cap
is hit.

**`GET/PUT/DELETE /api/resumes/[id]`** — PUT body `{ title, templateId, data,
latexSource }` → `200 Resume`. 404 if the resume doesn't belong to the caller.

**`POST /api/resume/parse`** — `runtime = "nodejs"` (needs Buffer/fs for `pdf-parse`/
`mammoth`, unavailable on Edge). Deliberately not behind `auth.protect()` in
`proxy.ts` — must work pre-login. Anonymous callers are tracked via a UUID cookie and
rate-limited (`FREE_PARSE_LIMIT`, Redis-backed; 429 when exhausted); signed-in users
bypass the quota entirely. Body: `multipart/form-data` with a `file` field (PDF/DOCX).
Extracts text, calls the real AI dispatch (`generateParseResume`). Response:
`200 { resume, remaining }`.

## AI — `app/api/ai/`

All routes below except `improve-bullet` share this exact pattern: Clerk `auth()` →
`checkAiGate(userId)` (subscription usage-limit gate, `403 UPGRADE_REQUIRED` if
exhausted) → real work → `recordAiGeneration(userId, plan)` on success. All route
through one real LLM call via `lib/ai/llm.ts`'s `generateText()`.

| Route | Method | Status | Body |
|---|---|---|---|
| `/api/ai/analyze-jd` | POST | **Real** | `{ resumeId, jobDescription }` |
| `/api/ai/audit-linkedin` | POST | **Real** | `{ headline, aboutSection, resumeId? }` |
| `/api/ai/cold-email` | POST | **Real** | raw body forwarded to `generateColdEmails` |
| `/api/ai/extract-job-identity` | POST | **Real** | `{ jobDescription }` |
| `/api/ai/generate-achievements` | POST | **Real** | `{ rawInput, existingAchievements?, role?, company? }` |
| `/api/ai/generate-cover-letter` | POST | **Real** | `{ resume, jobDescription?, tone? }` |
| `/api/ai/generate-custom-section` | POST | **Real** | `{ rawInput, existingEntry?, sectionTitle? }` |
| `/api/ai/generate-highlights` | POST | **Real** | `{ rawInput, existingHighlights?, projectName?, techStack? }` |
| `/api/ai/generate-project-from-repo` | POST | **Real** | `{ repoFullName, repoDescription?, language?, topics? }` |
| `/api/ai/generate-summary` | POST | **Real** | `{ rawInput, existingSummary?, resumeContext? }` |
| `/api/ai/improve-bullet` | POST | **Stub** | ignored, no auth at all |
| `/api/ai/latex-to-resume` | POST | **Real** | `{ latexCode }` |
| `/api/ai/linkedin` | POST | **Real** | raw body forwarded to `generateLinkedInContent` |
| `/api/ai/tailor-resume` | POST | **Real** | `{ resumeId, jobDescription }` |

Notes worth knowing:
- `analyze-jd` reads the resume's **prior** ATS analysis (from `ResumeAnalytics`)
  before writing this run's result, so the response's `previousScore` reflects the
  last completed check — response: `200 { result, previousScore }`.
- `extract-job-identity` never invents a company/role — returns empty strings rather
  than guessing when the text doesn't clearly state one.
- `tailor-resume` is read-only by design — it returns tailored fields and does **not**
  save anything; the client must POST `/api/resumes` separately to persist an accepted
  result.
- `generate-project-from-repo` fetches the real GitHub README first (best-effort — a
  failed fetch doesn't block generation, it just proceeds without README context).

## Applications — `app/api/applications/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/applications` | GET | Clerk | **Real** — lists the user's `JobApplication` rows |
| `/api/applications` | POST | Clerk | **Real** — requires `company`/`role`; `status` validated against a fixed set, defaults `"wishlist"` |
| `/api/applications/[id]` | PATCH | Clerk, ownership-scoped | **Real** — whitelisted partial update (company, role, status, appliedDate, matchScore, tags, location, salary, notes, url) |
| `/api/applications/[id]` | DELETE | Clerk, ownership-scoped | **Real** |

Used identically by the manual "+ Add Application" flow and by "Add" actions on
smart-prompt suggestions elsewhere in the app — both produce indistinguishable rows.

## Jobs — `app/api/jobs/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/jobs/discover` | GET | Clerk | **Real** — live Greenhouse fetch (Redis-cached) merged with the user's own `SavedJob` rows |
| `/api/jobs/preferences` | GET/PUT/DELETE | Clerk | **Real** — `JobDiscoveryFilters` JSON, namespaced under `UserPreferences.preferences.jobDiscoveryFilters` |
| `/api/jobs/queue-count` | GET | Clerk | **Real** — `count()` of `isQueued: true` rows, for a lightweight sidebar widget |
| `/api/jobs/save` | POST | Clerk | **Real** — body shape depends on `source: "manual" \| "greenhouse"` (see below) |
| `/api/jobs/unsave` | POST | Clerk | **Real** — `{ savedJobId, action: "bookmark" \| "queue" }` |

**`GET /api/jobs/discover`** → `200 { jobs, total, page, pageSize, totalPages,
queueCount, filterOptions }`. Query supports company/location/source/roleType/
experienceLevel/search/postedWithinDays filters + pagination. Only the caller's own
manually-added jobs are ever included — enforced by the `userId` filter server-side,
not just hidden in the UI.

**`POST /api/jobs/save`** — manual source: creates a `SavedJob` directly with
`isQueued: true`, requires ≥1 valid contact email. Greenhouse source: requires
`externalJobId` + `action: "bookmark" | "queue"`, upserts on the `[userId,
externalJobId]` unique constraint; an existing `outreachStatus` is never overwritten by
a re-queue.

**`POST /api/jobs/unsave`** — clears the relevant flag; deletes the row entirely only
if neither bookmark nor queue flag remains **and** no outreach history exists on it
(preserves rows with real outreach activity even if unqueued).

## Cold Outreach — `app/api/outreach/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/outreach/queue` | GET | Clerk | **Real** |
| `/api/outreach/quick-apply/draft` | POST | Clerk (no AI gate — it's a save) | **Real** |
| `/api/outreach/quick-apply/extract` | POST | Clerk + AI gate | **Real** |
| `/api/outreach/quick-apply/generate` | POST | Clerk + AI gate | **Real** |
| `/api/outreach/quick-apply/send` | POST | Clerk (no AI gate — sending isn't a generation) | **Real** |

**`GET /api/outreach/queue`** → `200 { entries[], stats: { sentToday,
repliesThisWeek, bounceRate, scheduledCount } }`. `entries` is scoped to the user's own
`isQueued: true` `SavedJob` rows; stats are computed live from those same rows (today/
7-day windows, bounce rate = bounced ÷ (sent+replied+bounced) × 100).

**`POST /api/outreach/quick-apply/draft`** — body `{ entryId?, recipientEmail,
companyName, roleTitle, pastedContext, resumeId, subject?, body? }` → upserts a
`QuickApplyEntry` with `status: "draft"`. Deliberately skips the stricter validation
`generate` applies — drafts are allowed to be incomplete.

**`POST /api/outreach/quick-apply/extract`** — body `{ pastedText }` → AI-extracted
fields for auto-filling the Quick Apply form. Lenient on purpose — only rejects
"nothing to extract from," not the stricter gibberish-detection `generate` applies.

**`POST /api/outreach/quick-apply/generate`** — body `{ entryId?, recipientEmail,
companyName, roleTitle, pastedContext, resumeId }`. Validates email format and rejects
gibberish company/role names. Generates the email **and** persists it
(`status: "generated"`) in one call — `entryId` is optional; pass a previous call's id
to regenerate in place instead of creating a new row. → `200 { entryId, subject,
body }`.

**`POST /api/outreach/quick-apply/send`** — body `{ quickApplyEntryId }`. Real pipeline:
resolves a valid Gmail access token (`409` if not connected or re-auth is needed, and
marks the entry `failed` on re-auth expiry), renders the resume to PDF
(`@react-pdf/renderer`), sends via the real Gmail API with the PDF attached, updates
the entry to `status: "sent"` with the real `gmailMessageId`, or `status: "failed"`
with a mapped error (`429` rate-limited, `400` invalid recipient, `502` otherwise).

## Gmail — `app/api/gmail/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/gmail/connect` | GET | Clerk | **Real** — redirects to Google's consent screen |
| `/api/gmail/callback` | GET | Clerk | **Real** — token exchange + encrypted storage |
| `/api/gmail/disconnect` | POST | Clerk | **Real** — deletes the stored `GmailAccount` row |
| `/api/gmail/status` | GET | Clerk | **Real** |

**`GET /api/gmail/connect`** — sets a CSRF `gmail_oauth_state` cookie (10 min), redirects
to Google. Meant to be hit via a plain `<a href>` navigation, not `fetch()`.

**`GET /api/gmail/callback`** — validates the CSRF state, exchanges the auth code for
tokens, requires both an access and refresh token be present (fails if Google didn't
return a refresh token — usually a scope/consent-config issue), fetches the connected
email address, encrypts both tokens (AES-256-GCM) and upserts `GmailAccount`. Always
redirects (not JSON) to `/dashboard/outreach/settings?gmail=connected|denied|error`.

**`POST /api/gmail/disconnect`** → `200 { ok: true }`.

**`GET /api/gmail/status`** — attempts a **live token refresh** (not just checking
`tokenExpiresAt`), so a dead refresh token is caught here instead of surfacing only at
send time. → `200 { connected: true, email, connectedAt, tokenExpiresAt }` or
`{ connected: false, reason: "not_connected" | "reauth_required" | "unknown" }`.

## GitHub — `app/api/github/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/github/repos` | GET | Clerk | **Real**, but unauthenticated against GitHub itself |

Query: `username` (required), `includeForks` (bool). Calls the **public** GitHub REST
API (no OAuth, no token) by username, filters forks, sorts by relevance. → `200 {
repos: [{ name, fullName, description, language, stargazersCount, updatedAt,
htmlUrl, topics }] }`. This is a one-off public lookup, not a persistent "connected
GitHub account" — see [FEATURES.md](FEATURES.md).

## Compile LaTeX — `app/api/compile-latex/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/compile-latex` | POST | Clerk | **Real** |

Body: `{ latexCode }`. Compiles via a locally-run **Tectonic** engine (not an external
service). Success → raw PDF bytes, `Content-Type: application/pdf`. Failure → `422`
with `{ diagnostics, rawLog, message }`. The editor UI that would call this is
currently disabled (see [FEATURES.md](FEATURES.md)) — the endpoint itself works.

## PDF — `app/api/pdf/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/pdf/generate` | POST | none | **Stub** — see top of this document |

## Subscription — `app/api/subscription/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/subscription/create` | POST | Clerk | **Real** |
| `/api/subscription/cancel` | POST | Clerk | **Real** |
| `/api/subscription/status` | GET | Clerk | **Real**, local-only |

**`POST /api/subscription/create`** — creates/reuses a Razorpay customer, creates a
subscription with `start_at` delayed 7 days (the actual trial mechanism) and
`total_count: 120` (Razorpay requires a fixed cycle count; 120 months ≈ 10 years is the
standard "effectively unlimited" workaround). → `200 { subscriptionId, keyId,
trialEndsAt, prefill: { email, name } }` for the frontend to open Razorpay Checkout.

**`POST /api/subscription/cancel`** — calls Razorpay's cancel API for real, then
updates the local `Subscription` status immediately (doesn't wait on the webhook, so
the UI reflects it instantly; the webhook applies the same update idempotently when it
arrives).

**`GET /api/subscription/status`** → `200 { plan, status, trialEndsAt,
currentPeriodEnd, proPriceInr, aiGenerations: { used, limit, remaining }, resumes: {
count, limit } }`. Never calls Razorpay live — reads only the local `Subscription`/
`UsageCounter`/`PlanConfig` tables (the webhook is the sole writer of confirmed
subscription state, see below).

## Webhooks — `app/api/webhooks/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/webhooks/razorpay` | POST | **Public**, HMAC-signature-verified | **Real** |

`runtime = "nodejs"` (needs Node's `crypto` for signature validation). Reads the raw
text body (not pre-parsed JSON) because HMAC verification is over exact bytes — a
re-serialized JSON object can differ byte-for-byte and fail verification. Rejects
(`400`) if the signature is missing or invalid — this is a publicly reachable endpoint,
so signature verification is what stops anyone from POSTing a fake
`subscription.activated` event to grant themselves Pro for free. Handles
`subscription.activated`/`charged` → `active`; `subscription.cancelled`/`completed` →
`cancelled`; `payment.failed` (subscription-linked only) → `past_due`; unknown events
are acknowledged with `200` anyway so Razorpay doesn't retry them forever. **This route
is the sole writer of confirmed subscription state** — every other route only reads it.

## User — `app/api/user/`

| Route | Method | Auth | Status |
|---|---|---|---|
| `/api/user/profile` | GET/PUT | Clerk | **Real** |

Stores `{ phone, location }` under `UserPreferences.preferences.profile` — the fields
Clerk itself doesn't carry. Same namespaced-JSON pattern as `/api/jobs/preferences`.

## Admin — `app/api/admin/`

All 12 routes use `requireAdminSession(request)` — **not Clerk**. A completely separate
JWT-cookie session; see [ARCHITECTURE.md](ARCHITECTURE.md#why-admin-auth-is-separate-from-clerk).

| Route | Method | Status |
|---|---|---|
| `/api/admin/analytics` | GET | **Real** |
| `/api/admin/change-password` | POST | **Real** — requires current password match |
| `/api/admin/login` | POST | **Real** — rate-limited, timing-safe against account enumeration |
| `/api/admin/logout` | POST | **Real** |
| `/api/admin/plan-config` | GET, PUT | **Real** |
| `/api/admin/subscriptions` | GET | **Real** |
| `/api/admin/subscriptions/[userId]` | PATCH | **Real** — local override only, never calls Razorpay |
| `/api/admin/templates` | GET | **Real** |
| `/api/admin/templates/[templateId]` | PATCH | **Real** |
| `/api/admin/users` | GET | **Real** — lists real Clerk users, joined with local Postgres data |
| `/api/admin/users/[userId]/block` | POST | **Real** |
| `/api/admin/users/[userId]/unblock` | POST | **Real** |

**`POST /api/admin/login`** — body `{ email, password }` (Zod-validated). When no
admin account matches the email, compares the submitted password against a hardcoded
dummy bcrypt hash anyway, so the response takes the same amount of time either way and
doesn't leak account existence via timing. Rate-limited via Redis.

**`POST /api/admin/change-password`** — requires the **current** password to match
before rotating, specifically so a hijacked-but-still-live admin session can't lock out
the real admin by rotating credentials unilaterally.

**`PATCH /api/admin/subscriptions/[userId]`** — body `{ status: "trialing" |
"active" | "past_due" | "cancelled" }`. Local-only override for support purposes; never
touches Razorpay.
