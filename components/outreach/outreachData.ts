// Mock-only data for the Cold Outreach feature's first UI pass — no backend
// wiring yet. Shapes here mirror what a future /api/outreach endpoint would
// plausibly return, so swapping in real data later is a fetch, not a rewrite.

export type OutreachType = "cold" | "general" | "referral" | "quickApply";

export type OutreachStatus =
  | "draft"
  | "generated"
  | "approved"
  | "scheduled"
  | "generating"
  | "sending"
  | "sent"
  | "replied"
  | "bounced"
  | "failed";

export interface OutreachEntry {
  id: string;
  company: string;
  role: string;
  // Nullable for real (SavedJob-backed) entries whose type hasn't been
  // chosen yet in the Generate & Review panel — MOCK_OUTREACH_ENTRIES below
  // always sets a real value, so this only ever reads as null for rows
  // coming from GET /api/outreach/queue.
  outreachType: OutreachType | null;
  jobId: string | null;
  emails: string[];
  status: OutreachStatus;
  scheduledSendTime: string | null;
  lastActivity: string | null;
}

export const OUTREACH_TYPE_LABELS: Record<OutreachType, string> = {
  cold: "Cold (JD-based)",
  general: "General",
  referral: "Referral",
  quickApply: "Quick Apply",
};

export const STATUS_LABELS: Record<OutreachStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  approved: "Approved",
  scheduled: "Scheduled",
  generating: "Generating...",
  sending: "Sending...",
  sent: "Sent",
  replied: "Replied",
  bounced: "Bounced",
  failed: "Failed",
};

const COMPANIES: { name: string; role: string }[] = [
  { name: "Google", role: "Software Engineer II" },
  { name: "Microsoft", role: "Frontend Developer" },
  { name: "Airbnb", role: "Full Stack Engineer" },
  { name: "Stripe", role: "Backend Engineer" },
  { name: "Databricks", role: "Software Engineer" },
  { name: "Notion", role: "Product Engineer" },
  { name: "Adobe", role: "Frontend Developer" },
  { name: "Salesforce", role: "Developer" },
  { name: "Coinbase", role: "Software Engineer" },
  { name: "Snowflake", role: "Data Engineer" },
  { name: "Meta", role: "Product Engineer" },
  { name: "Netflix", role: "Senior Software Engineer" },
  { name: "Uber", role: "Backend Engineer" },
  { name: "Dropbox", role: "Full Stack Engineer" },
  { name: "Figma", role: "Frontend Engineer" },
  { name: "Amazon", role: "SDE II" },
  { name: "Spotify", role: "Software Engineer" },
  { name: "Shopify", role: "Backend Developer" },
  { name: "Atlassian", role: "Software Engineer" },
  { name: "Zoom", role: "Platform Engineer" },
  { name: "LinkedIn", role: "Software Engineer" },
  { name: "Reddit", role: "Backend Engineer" },
  { name: "DoorDash", role: "Full Stack Engineer" },
  { name: "Robinhood", role: "Software Engineer" },
  { name: "Asana", role: "Product Engineer" },
  { name: "Canva", role: "Frontend Engineer" },
  { name: "Twitch", role: "Software Engineer" },
  { name: "Discord", role: "Backend Engineer" },
  { name: "Ramp", role: "Software Engineer" },
  { name: "Plaid", role: "Backend Engineer" },
  { name: "Affirm", role: "Software Engineer" },
  { name: "Brex", role: "Full Stack Engineer" },
  { name: "Webflow", role: "Frontend Engineer" },
  { name: "Intercom", role: "Software Engineer" },
  { name: "Twilio", role: "Backend Engineer" },
  { name: "Palantir", role: "Software Engineer" },
  { name: "Pinterest", role: "Software Engineer" },
  { name: "Instacart", role: "Backend Engineer" },
  { name: "Square", role: "Software Engineer" },
  { name: "Roblox", role: "Software Engineer" },
  { name: "Apple", role: "Software Engineer" },
  { name: "Lyft", role: "Backend Engineer" },
  { name: "Slack", role: "Frontend Engineer" },
];

const TYPE_CYCLE: OutreachType[] = ["cold", "general", "referral", "quickApply"];
const STATUS_CYCLE: OutreachStatus[] = [
  "approved",
  "generated",
  "scheduled",
  "sent",
  "draft",
  "replied",
  "bounced",
  "generated",
  "draft",
  "approved",
];

function emailFor(company: string, kind: "recruiter" | "talent" | "careers" | "jobs" | "recruiting") {
  const domain = `${company.toLowerCase().replace(/\s+/g, "")}.com`;
  return `${kind}@${domain}`;
}

// First 10 entries match the reference mock exactly; the rest are generated
// on the same shape so pagination ("42 outreach entries") has real rows
// behind every page, not just page 1.
const OVERRIDES: Partial<Record<number, Partial<OutreachEntry>>> = {
  0: {
    jobId: null,
    emails: ["sarah.johnson@google.com", "kyle.hr@google.com"],
    status: "approved",
    scheduledSendTime: "May 21, 10:30 AM",
    lastActivity: "May 20, 9:15 AM",
  },
  1: {
    outreachType: "general",
    emails: [emailFor("Microsoft", "recruiter")],
    status: "generated",
    scheduledSendTime: "May 20, 8:40 AM",
    lastActivity: "May 20, 8:40 AM",
  },
  2: {
    outreachType: "referral",
    jobId: "REQ-78291",
    emails: ["talent@airbnb.com", "j.miller@airbnb.com"],
    status: "scheduled",
    scheduledSendTime: "May 20, 7:22 AM",
    lastActivity: "May 19, 6:10 PM",
  },
  3: {
    outreachType: "cold",
    emails: [emailFor("Stripe", "careers")],
    status: "sent",
    scheduledSendTime: "May 19, 6:10 PM",
    lastActivity: "May 19, 6:12 PM",
  },
  4: {
    outreachType: "general",
    emails: [emailFor("Databricks", "recruiting")],
    status: "draft",
    scheduledSendTime: null,
    lastActivity: "May 19, 11:01 AM",
  },
  5: {
    outreachType: "referral",
    jobId: "JOB-34021",
    emails: ["jobs@notion.so"],
    status: "replied",
    scheduledSendTime: "May 18, 2:45 PM",
    lastActivity: "May 18, 3:20 PM",
  },
  6: {
    outreachType: "cold",
    emails: [emailFor("Adobe", "recruiting")],
    status: "bounced",
    scheduledSendTime: "May 18, 9:30 AM",
    lastActivity: "May 18, 10:02 AM",
  },
  7: {
    outreachType: "quickApply",
    emails: [emailFor("Salesforce", "talent")],
    status: "draft",
    scheduledSendTime: null,
    lastActivity: "May 17, 4:55 PM",
  },
  8: {
    outreachType: "general",
    emails: [emailFor("Coinbase", "careers")],
    status: "generated",
    scheduledSendTime: "May 17, 1:15 PM",
    lastActivity: "May 17, 1:16 PM",
  },
  9: {
    outreachType: "referral",
    jobId: "REQ-11839",
    emails: ["talent@snowflake.com"],
    status: "approved",
    scheduledSendTime: "May 17, 11:00 AM",
    lastActivity: "May 17, 11:02 AM",
  },
};

function buildEntries(): OutreachEntry[] {
  return COMPANIES.map((c, i) => {
    const override = OVERRIDES[i];
    const outreachType = override?.outreachType ?? TYPE_CYCLE[i % TYPE_CYCLE.length];
    const status = override?.status ?? STATUS_CYCLE[i % STATUS_CYCLE.length];
    const day = 17 - Math.floor(i / 3);
    const fallbackTime = status === "draft" ? null : `May ${Math.max(1, day)}, ${9 + (i % 8)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60} AM`;

    return {
      id: `outreach-${i + 1}`,
      company: c.name,
      role: c.role,
      outreachType,
      jobId: override?.jobId ?? (outreachType === "referral" ? `REQ-${10000 + i * 37}` : null),
      emails: override?.emails ?? [emailFor(c.name, "recruiting")],
      status,
      scheduledSendTime: override?.scheduledSendTime ?? fallbackTime,
      lastActivity: override?.lastActivity ?? fallbackTime,
    };
  });
}

export const MOCK_OUTREACH_ENTRIES: OutreachEntry[] = buildEntries();

export const MOCK_JD_SUMMARY =
  "This role focuses on building and scaling backend services for Google's core infrastructure. Candidates should have 2+ years of experience with distributed systems, strong proficiency in at least one of Java/Go/C++, and a track record of shipping high-availability services. The team values ownership, clear technical communication, and a bias toward simple, maintainable solutions.";

export function generateMockEmailBody() {
  return `Hi Sarah,

I hope you're doing well!

I came across the Software Engineer II opportunity at Google and was excited to see how well it aligns with my experience in building scalable web applications and solving complex problems.

With 2+ years of experience in full-stack development using React, TypeScript, Node.js, and cloud technologies, I've built products that improve user experience and drive impact. I'm particularly drawn to Google's mission of organizing the world's information and would love to contribute to teams building technology at that scale.

I've attached my resume for your review and would be happy to discuss how my background fits your team's needs.

Thanks for your time and consideration!
Best regards,
Akash Patel`;
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Screen 2's rich-text editor (components/outreach/RichTextEditor.tsx) works
// in HTML, unlike the plain-text mock used by Quick Apply's lighter-weight
// textarea — this converts the same mock copy into paragraph/line-break HTML
// rather than maintaining two separate mock bodies.
export function generateMockEmailHtml() {
  return generateMockEmailBody()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.split("\n").map(escapeHtml).join("<br>")}</p>`)
    .join("");
}
