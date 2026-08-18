// Shared shape across the whole Job Discovery feature — the live Greenhouse
// fetch (lib/jobs/greenhouseClient.ts), the merge/filter layer
// (app/api/jobs/discover/route.ts), and the frontend all speak this type.
export interface NormalizedJob {
  // Stable across requests: `${boardToken}:${greenhouseJobId}` for
  // Greenhouse jobs, the SavedJob.id (a UUID) for manual ones.
  id: string;
  company: string;
  companyLogoUrl: string | null;
  jobTitle: string;
  location: string | null;
  source: "greenhouse" | "manual";
  requisitionId: string | null;
  // Greenhouse's public jobs API doesn't reliably expose a distinct "first
  // posted" timestamp across all customer boards — this is `updated_at`,
  // the one timestamp it does consistently return. Close enough for
  // "posted X days ago" sorting/display, not a guaranteed original-post date.
  postedDate: string;
  jobDescriptionHtml: string;
  jobDescriptionPlain: string;
  experienceLevel: string;
  roleType: string;
  externalJobId: string | null;
  boardToken: string | null;

  // Per-user overlay, filled in by the discover route from the requesting
  // user's own SavedJob rows — never cached as part of the shared
  // Redis-cached job data itself (that's cross-user, this isn't).
  isBookmarked: boolean;
  isQueued: boolean;
  savedJobId: string | null;
  // Populated from the existing SavedJob row, if any — lets the frontend
  // skip re-prompting for contact emails when a job already has them on
  // file from an earlier bookmark/queue action.
  contactEmails: string[];
}
