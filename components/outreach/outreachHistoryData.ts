// Mock-only data for the Outreach History UI pass — no backend wiring yet.
// Distinct from outreachData.ts's queue-shaped entries: history rows are a
// closed set of terminal events (sent/replied/bounced/failed), not
// in-progress queue items, so they get their own light shape here rather
// than overloading OutreachEntry/OutreachStatus.

import type { OutreachType } from "@/components/outreach/outreachData";

export type HistoryStatus = "sent" | "replied" | "bounced" | "failed";

export interface HistoryEntry {
  id: string;
  company: string;
  role: string;
  // Nullable for real (SavedJob-backed) rows whose type was never set — see
  // the same note on OutreachEntry in outreachData.ts.
  outreachType: OutreachType | null;
  email: string;
  // Real rows can have more than one contact email; the feed only shows
  // the first (email above), this is just for a "+N" indicator if needed.
  // Optional since the mock entries below don't set it.
  emailCount?: number;
  status: HistoryStatus;
  timestamp: string;
  subject: string;
  snippet: string;
  replySnippet?: string;
  reason?: string;
}

export const HISTORY_STATUS_LABELS: Record<HistoryStatus, string> = {
  sent: "Sent",
  replied: "Replied",
  bounced: "Bounced",
  failed: "Failed",
};

export const MOCK_HISTORY_ENTRIES: HistoryEntry[] = [
  {
    id: "hist-1",
    company: "Google",
    role: "Software Engineer II",
    outreachType: "cold",
    email: "sarah.johnson@google.com",
    status: "replied",
    timestamp: "May 21, 10:24 AM",
    subject: "Software Engineer II — excited about the team's infra work",
    snippet:
      "I came across the Software Engineer II opening and was excited to see how well it aligns with my backend experience...",
    replySnippet:
      "Hi Akash, thanks for reaching out — your background looks like a strong fit. Could you share some availability this week for a quick call?",
  },
  {
    id: "hist-2",
    company: "Microsoft",
    role: "Frontend Developer",
    outreachType: "general",
    email: "recruiter@microsoft.com",
    status: "sent",
    timestamp: "May 21, 9:10 AM",
    subject: "Frontend Developer — React/TypeScript background",
    snippet: "I wanted to introduce myself as I'm actively exploring frontend roles on teams building at scale...",
  },
  {
    id: "hist-3",
    company: "Amazon",
    role: "SDE II",
    outreachType: "referral",
    email: "talent@amazon.com",
    status: "bounced",
    timestamp: "May 20, 4:45 PM",
    subject: "Referral request — SDE II opening",
    snippet: "Hoping you might be able to point me toward the right team for the SDE II opening on the referral board...",
    reason: "Mailbox not found",
  },
  {
    id: "hist-4",
    company: "Shopify",
    role: "Backend Developer",
    outreachType: "cold",
    email: "careers@shopify.com",
    status: "sent",
    timestamp: "May 20, 11:02 AM",
    subject: "Backend Developer — scaling commerce infrastructure",
    snippet: "Shopify's approach to merchant infrastructure is genuinely impressive, and I'd love to contribute to it...",
  },
  {
    id: "hist-5",
    company: "Atlassian",
    role: "Software Engineer",
    outreachType: "general",
    email: "recruiting@atlassian.com",
    status: "failed",
    timestamp: "May 19, 3:30 PM",
    subject: "Software Engineer — collaboration tooling",
    snippet: "I've used Jira and Confluence extensively and would love the chance to build the tools I rely on daily...",
    reason: "SMTP error",
  },
  {
    id: "hist-6",
    company: "Zomato",
    role: "Product Engineer",
    outreachType: "referral",
    email: "talent@zomato.com",
    status: "replied",
    timestamp: "May 19, 10:15 AM",
    subject: "Referral request — Product Engineer role",
    snippet: "Reaching out about the Product Engineer opening — would appreciate a referral or a pointer to the right recruiter...",
    replySnippet: "Hey! Passed your resume along to the hiring manager. You should hear back within a few days.",
  },
  {
    id: "hist-7",
    company: "Razorpay",
    role: "Backend Engineer",
    outreachType: "cold",
    email: "jobs@razorpay.com",
    status: "sent",
    timestamp: "May 18, 2:50 PM",
    subject: "Backend Engineer — payments infrastructure",
    snippet: "I've been following Razorpay's growth in the payments space and would love to help scale the platform...",
  },
  {
    id: "hist-8",
    company: "Swiggy",
    role: "Software Engineer",
    outreachType: "general",
    email: "careers@swiggy.com",
    status: "bounced",
    timestamp: "May 18, 9:05 AM",
    subject: "Software Engineer — logistics platform",
    snippet: "I'm reaching out to learn more about open Software Engineer roles on the logistics platform team...",
    reason: "Domain not accepting mail",
  },
  {
    id: "hist-9",
    company: "Flipkart",
    role: "SDE I",
    outreachType: "referral",
    email: "talent@flipkart.com",
    status: "sent",
    timestamp: "May 17, 5:20 PM",
    subject: "Referral request — SDE I opening",
    snippet: "Would really appreciate a referral for the SDE I role — happy to share my resume and portfolio...",
  },
  {
    id: "hist-10",
    company: "HubSpot",
    role: "Frontend Engineer",
    outreachType: "cold",
    email: "recruiting@hubspot.com",
    status: "failed",
    timestamp: "May 17, 1:40 PM",
    subject: "Frontend Engineer — design systems focus",
    snippet: "HubSpot's design system work is something I admire, and I'd love to bring my component-library experience to the team...",
    reason: "SMTP error",
  },
];
