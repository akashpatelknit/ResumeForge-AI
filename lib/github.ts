import "server-only";

const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
  htmlUrl: string;
  topics: string[];
  fork: boolean;
}

export class GitHubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// GitHub's public REST API — unauthenticated, no OAuth. Fine for v1 (public
// repos only), but shares the 60 req/hr per-IP unauthenticated rate limit
// across every user of this deployment, not per-user. See the 403 branch
// below for how that surfaces to the caller.
export async function fetchPublicRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    { headers: { Accept: "application/vnd.github+json" } },
  );

  if (res.status === 404) {
    throw new GitHubApiError(
      `No GitHub user found with username "${username}".`,
      404,
    );
  }

  if (res.status === 403) {
    // GitHub returns 403 for both rate limiting and abuse-detection —
    // x-ratelimit-remaining is the reliable signal for which one this is.
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      const resetHeader = res.headers.get("x-ratelimit-reset");
      const resetInSeconds = resetHeader
        ? Math.max(0, Number(resetHeader) - Math.floor(Date.now() / 1000))
        : null;
      throw new GitHubApiError(
        resetInSeconds
          ? `GitHub API rate limit reached. Try again in about ${Math.ceil(resetInSeconds / 60)} minute(s).`
          : "GitHub API rate limit reached. Please try again shortly.",
        429,
      );
    }
    throw new GitHubApiError(
      "GitHub rejected this request. Please try again shortly.",
      403,
    );
  }

  if (!res.ok) {
    throw new GitHubApiError(`GitHub API error (${res.status}).`, res.status);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new GitHubApiError("Unexpected response from GitHub.", 502);
  }

  return data.map((r) => {
    const repo = r as Record<string, unknown>;
    return {
      name: String(repo.name ?? ""),
      fullName: String(repo.full_name ?? ""),
      description: typeof repo.description === "string" ? repo.description : null,
      language: typeof repo.language === "string" ? repo.language : null,
      stargazersCount:
        typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
      updatedAt: String(repo.updated_at ?? ""),
      htmlUrl: String(repo.html_url ?? ""),
      topics: Array.isArray(repo.topics)
        ? repo.topics.filter((t): t is string => typeof t === "string")
        : [],
      fork: Boolean(repo.fork),
    };
  });
}

// Blends recency and popularity so an actively-maintained repo with modest
// stars still ranks above a long-abandoned repo that happened to go viral
// once. Log-scaled stars so a handful of very-starred repos don't
// completely bury everything else; recency weighted higher since "what are
// you working on now" is usually more resume-relevant than "what got the
// most attention once."
export function repoRelevanceScore(repo: GitHubRepo): number {
  const daysSinceUpdate =
    (Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 365 - daysSinceUpdate) / 365; // 1.0 = updated today, 0 = a year+ stale
  const starScore = Math.log2(repo.stargazersCount + 1);
  return recencyScore * 3 + starScore * 0.7;
}

// Best-effort — returns null both when there's genuinely no README and
// when the fetch/decode fails for any other reason, since the caller's
// contract is "proceed with just repo metadata" either way.
export async function fetchReadme(fullName: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${fullName}/readme`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    const content = (data as Record<string, unknown>)?.content;
    if (typeof content !== "string") return null;

    return Buffer.from(content, "base64").toString("utf-8");
  } catch (error) {
    console.error(`Failed to fetch README for ${fullName}:`, error);
    return null;
  }
}
