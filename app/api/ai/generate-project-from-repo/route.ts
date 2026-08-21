import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchReadme } from "@/lib/github";
import { generateProjectFromRepo } from "@/lib/ai/generateProjectFromRepo";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const repoFullNameValue = (body as { repoFullName?: unknown })?.repoFullName;
  if (typeof repoFullNameValue !== "string" || !repoFullNameValue.trim()) {
    return NextResponse.json(
      { error: "repoFullName is required" },
      { status: 400 },
    );
  }
  const repoFullName = repoFullNameValue.trim();

  const repoDescriptionValue = (body as { repoDescription?: unknown })
    ?.repoDescription;
  const repoDescription =
    typeof repoDescriptionValue === "string" ? repoDescriptionValue : undefined;

  const languageValue = (body as { language?: unknown })?.language;
  const language = typeof languageValue === "string" ? languageValue : undefined;

  const topicsValue = (body as { topics?: unknown })?.topics;
  const topics = Array.isArray(topicsValue)
    ? topicsValue.filter((t): t is string => typeof t === "string")
    : undefined;

  // Best-effort — fetchReadme already returns null on any failure (missing
  // README, network error, decode error) rather than throwing, so this
  // never blocks generation on README availability.
  const readme = await fetchReadme(repoFullName);
  const repoName = repoFullName.split("/").pop() || repoFullName;

  try {
    const result = await generateProjectFromRepo(
      { repoName, repoDescription, language, topics, readme },
      userId,
    );
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Failed to generate project from repo:", error);
    return aiRouteErrorResponse(error, "Failed to generate a project from this repository. Please try again.");
  }
}
