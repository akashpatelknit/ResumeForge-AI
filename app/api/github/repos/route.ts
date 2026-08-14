import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  fetchPublicRepos,
  repoRelevanceScore,
  GitHubApiError,
} from "@/lib/github";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const includeForks = searchParams.get("includeForks") === "true";

  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 },
    );
  }

  try {
    const repos = await fetchPublicRepos(username);
    const filtered = includeForks ? repos : repos.filter((r) => !r.fork);
    const sorted = [...filtered].sort(
      (a, b) => repoRelevanceScore(b) - repoRelevanceScore(a),
    );

    return NextResponse.json({
      repos: sorted.map((r) => ({
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        language: r.language,
        stargazersCount: r.stargazersCount,
        updatedAt: r.updatedAt,
        htmlUrl: r.htmlUrl,
        topics: r.topics,
      })),
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GitHub repos fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories from GitHub." },
      { status: 502 },
    );
  }
}
