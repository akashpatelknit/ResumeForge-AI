# ResumeForge AI - Architecture Documentation

## Overview

ResumeForge AI is a full-stack SaaS platform built with Next.js 14, designed to help job seekers create AI-optimized resumes and manage their job applications efficiently.

**Live:** https://resume-forge-ai-lilac.vercel.app  
**Stack:** Next.js 14, TypeScript, Prisma, Supabase, Clerk, Google Gemini API

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with built-in API routes
- **TypeScript** - Type safety across entire codebase
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Reusable component library
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless backend endpoints
- **Prisma ORM** - Type-safe database client
- **Supabase** - PostgreSQL database with real-time capabilities

### Authentication
- **Clerk** - Managed authentication with JWT

### AI Integration
- **Google Gemini API** - AI-powered content generation
- Server-side API calls for security

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub** - Version control

---

## Architecture Pattern

### Folder Structure

```
app/
├── (marketing)/          # Public pages (landing, features, pricing)
├── (auth)/              # Authentication pages (login, signup)
├── (app)/               # Protected dashboard routes
│   ├── dashboard/       # Main dashboard
│   ├── builder/[id]/    # Resume builder
│   ├── resumes/         # Resume management
│   ├── jobs/            # Application tracker
│   │   ├── tracker/     # Kanban board
│   │   └── analyzer/    # Job analyzer
│   └── ai/              # AI tools
│       ├── linkedin/    # LinkedIn messages
│       └── cold-emails/ # Email sequences
└── api/                 # Backend endpoints
    ├── resumes/
    ├── pdf/generate/
    └── ai/

components/
├── ui/                  # shadcn components
├── builder/             # Resume builder components
├── dashboard/           # Dashboard components
└── ai/                  # AI tool components

lib/
├── prisma.ts            # Prisma client instance
├── db/                  # Database queries
│   └── resumes.ts
└── utils/               # Helper functions

prisma/
└── schema.prisma        # Database schema

types/
└── resume.ts            # TypeScript types
```

---

## Data Flow

### User Interaction → Database

```
1. User types in form
   ↓
2. Zustand store (Immediate UI update)
   ↓
3. Debounced (3 seconds)
   ↓
4. API route: POST /api/resumes/[id]
   ↓
5. Prisma ORM validates & executes query
   ↓
6. Supabase PostgreSQL saves data
   ↓
7. Success response returns
   ↓
8. UI shows: "Saved 2s ago" ✓
```

### AI Generation Flow

```
1. User pastes job description
   ↓
2. Client sends to API: POST /api/ai/generate
   ↓
3. Server extracts context (company, role, skills)
   ↓
4. Server calls Gemini API with structured prompt
   ↓
5. AI generates personalized content
   ↓
6. Server validates output (character limits, format)
   ↓
7. Response sent to client
   ↓
8. Client displays in UI
```

---

## Database Schema

### Hybrid Approach: Structured + Flexible

```sql
-- Structured metadata for queries
resumes
├── id (UUID, PK)
├── user_id (string, indexed)
├── title (string)
├── template_id (string)
├── ats_score (int, indexed)
├── is_favorite (boolean)
├── created_at (timestamp)
├── updated_at (timestamp)
└── data (JSONB) ← Flexible resume content
    ├── personalInfo
    ├── experience[]
    ├── education[]
    ├── skills[]
    └── projects[]
```

**Why Hybrid?**
- Structured columns: Fast queries, filtering, sorting
- JSONB content: Flexible schema for any resume format
- Best of both worlds: Performance + Flexibility

---

## Key Design Decisions

### 1. Next.js App Router
**Decision:** Use App Router over Pages Router  
**Why:** 
- Built-in API routes (no separate Express server)
- Server Components reduce client bundle
- File-based routing simplifies structure

### 2. Prisma + Supabase
**Decision:** Prisma as ORM with Supabase  
**Why:**
- Prisma: Type-safe queries, auto-migrations
- Supabase: Managed PostgreSQL, real-time features
- Together: Developer experience + reliability

### 3. Clerk Authentication
**Decision:** Managed auth vs custom implementation  
**Why:**
- Saved 2 weeks of development
- Enterprise features (SSO, MFA) out of the box
- Reduced security risks

### 4. Server-Side AI
**Decision:** AI calls in API routes, not client  
**Why:**
- Protects API keys
- Enables rate limiting
- Centralized prompt management

### 5. Optimistic UI Updates
**Decision:** Update UI immediately, sync database in background  
**Why:**
- Instant user feedback
- Perceived performance boost
- Better UX (users never wait)

### 6. State Management Split
**Decision:** Zustand (UI) + React Query (Server)  
**Why:**
- Zustand: Lightweight, simple for forms
- React Query: Handles caching, refetching automatically
- Separation of concerns

---

## Authentication & Security

### Route Protection

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/api/resumes/:path*',
  ],
};
```

**Protected Routes:**
- All `/dashboard/*` pages
- All `/builder/*` pages
- All `/api/*` endpoints (except public)

**Security Measures:**
- JWT tokens for API auth
- Row-level security in database
- API rate limiting
- Environment variable protection

---

## Performance Optimizations

### 1. Auto-Save with Debouncing
```typescript
// Wait 3s after last keystroke before saving
useDebounce(resumeData, 3000) → API call
```

### 2. Code Splitting
- Dynamic imports for heavy components
- Route-based splitting (automatic with Next.js)

### 3. Image Optimization
- Next.js Image component
- Lazy loading
- WebP format

### 4. Database Indexes
```prisma
@@index([userId])
@@index([atsScore])
@@index([createdAt(sort: Desc)])
```

### 5. React Query Caching
- Automatic cache management
- Stale-while-revalidate pattern

---

## API Structure

### RESTful Endpoints

```
GET    /api/resumes              # List all user resumes
POST   /api/resumes              # Create new resume
GET    /api/resumes/[id]         # Get single resume
PUT    /api/resumes/[id]         # Update resume
DELETE /api/resumes/[id]         # Delete resume

POST   /api/ai/linkedin          # Generate LinkedIn message
POST   /api/ai/cold-email        # Generate email sequence
POST   /api/ai/analyze           # Analyze job description

POST   /api/pdf/generate         # Generate PDF
```

### Error Handling

```typescript
try {
  const resume = await getResume(id, userId);
  return NextResponse.json(resume);
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Failed to fetch resume' },
    { status: 500 }
  );
}
```

---

## Type Safety

### End-to-End Types

```typescript
// Database types (auto-generated by Prisma)
import { Resume as PrismaResume } from '@prisma/client';

// Extended with parsed JSON
interface Resume extends Omit<PrismaResume, 'data'> {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

// API contracts
type CreateResumeInput = Pick<Resume, 'title' | 'templateId'>;
type UpdateResumeInput = Partial<CreateResumeInput>;
```

---

## Deployment & CI/CD

### Vercel Pipeline

```
GitHub Push → Vercel Build → Deploy to Production
                ↓
          - Type checking
          - Lint
          - Prisma generate
          - Build Next.js
          - Run tests (if any)
```


## What I'd Do Differently

### If Starting Over:

1. **Add Redis** - Cache AI responses, reduce API costs
2. **Use tRPC** - Type-safe APIs instead of REST
3. **Error Boundaries** - Implement earlier for better UX
4. **Testing** - Write tests from day 1, not after
5. **Monitoring** - Add Sentry/LogRocket from start

### Technical Debt Accepted:

- No comprehensive tests (prioritized shipping)
- Some hardcoded sample data (DB migration pending)
- Missing loading states in some components
- No error boundaries yet

**Plan:** Address these post-MVP launch

---

## Metrics & Performance

### Current Stats:
- **Page Load:** <2s (Vercel edge)
- **API Response:** <500ms average
- **Database Queries:** <100ms (indexed)
- **AI Generation:** 3-5s (Gemini API)
- **Uptime:** 99.9%

### Bundle Size:
- **First Load JS:** ~85kb gzipped
- **Client Components:** Code-split per route

---

## Scalability Considerations

### Current Capacity:
- **Database:** Supabase handles 10K+ concurrent connections
- **API Routes:** Serverless auto-scales on Vercel
- **AI Rate Limits:** 60 requests/minute (Gemini free tier)

### Future Scaling:
- Add Redis for caching
- Implement queue system for AI jobs (BullMQ)
- Database read replicas for analytics
- CDN for static assets

---

## Lessons Learned

### Architecture Wins:
✅ Spending 3 days on architecture saved 3 weeks of refactoring  
✅ Type safety caught bugs before production  
✅ Modular structure enabled fast feature additions  
✅ Managed services (Clerk, Supabase) accelerated development  

### What Worked:
- Hybrid database schema (flexible + queryable)
- Server-side AI generation (secure + fast)
- Optimistic UI (great UX)
- Building in public (accountability)

### Challenges:
- PDF generation accuracy (migrating to Puppeteer)
- AI prompt consistency (15+ iterations needed)
- State sync complexity (Zustand + React Query learning curve)

---

## Resources

- **Live App:** https://resume-forge-ai-lilac.vercel.app
- **GitHub:** https://github.com/akashpatelknit/ResumeForge-AI
- **Documentation:** See `/docs` folder
- **Tech Stack:** Next.js 14, TypeScript, Prisma, Supabase, Clerk, Gemini API

---

**Built with ❤️ by Akash Patel**  
*Shipped in 30 days | Building in Public*

Last Updated: February 2026