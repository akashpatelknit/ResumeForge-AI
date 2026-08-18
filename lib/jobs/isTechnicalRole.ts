// Job Discovery is scoped to technical/engineering roles only — applied as
// a hard filter in the discover route (not a togglable UI option), since
// that's this tool's actual audience. Checked against both the Greenhouse
// department name (usually reliable — "Engineering", "Data", "IT") and the
// job title itself (catches boards that dump everything into one
// "General"/"Operations" department, or titles like "Solutions Engineer"
// that read as technical regardless of department).
const TECHNICAL_DEPARTMENTS = [
  "engineering",
  "software",
  "data",
  "it",
  "information technology",
  "technology",
  "product engineering",
  "infrastructure",
  "platform",
  "security",
  "devops",
  "quality engineering",
  "machine learning",
  "artificial intelligence",
  "ai",
  "research",
  "architecture",
];

const TECHNICAL_TITLE_KEYWORDS = [
  "engineer",
  "developer",
  "programmer",
  "software",
  "backend",
  "back-end",
  "frontend",
  "front-end",
  "full stack",
  "fullstack",
  "full-stack",
  "devops",
  "sre",
  "site reliability",
  "data scientist",
  "data engineer",
  "machine learning",
  "ml engineer",
  "ai engineer",
  "security engineer",
  "qa engineer",
  "test engineer",
  "sdet",
  "architect",
  "systems engineer",
  "network engineer",
  "database",
  "dba",
  "cloud engineer",
  "infrastructure engineer",
  "platform engineer",
  "technical program manager",
  "solutions engineer",
  "mobile engineer",
  "ios engineer",
  "android engineer",
  "embedded engineer",
  "firmware engineer",
];

// Titles that would otherwise match a technical keyword above but are
// clearly non-technical roles (e.g. "Sales Engineer" often skews toward
// sales, "Support Engineer" toward customer support) — excluded even when
// the department looks technical.
const EXCLUDE_TITLE_KEYWORDS = ["sales engineer", "support engineer", "field engineer", "customer engineer"];

export function isTechnicalRole(jobTitle: string, roleType: string): boolean {
  const title = jobTitle.toLowerCase();
  const department = roleType.toLowerCase();

  if (EXCLUDE_TITLE_KEYWORDS.some((kw) => title.includes(kw))) return false;
  if (TECHNICAL_DEPARTMENTS.some((dept) => department.includes(dept))) return true;
  return TECHNICAL_TITLE_KEYWORDS.some((kw) => title.includes(kw));
}
