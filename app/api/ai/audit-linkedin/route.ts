import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResume } from "@/lib/db/resumes";
import { mapResumeFromDB } from "@/mapper/mapResumeFromDB";
import { generateLinkedInAudit } from "@/lib/ai/generateLinkedInAudit";
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

  const headlineValue = (body as { headline?: unknown })?.headline;
  const aboutSectionValue = (body as { aboutSection?: unknown })
    ?.aboutSection;
  const resumeIdValue = (body as { resumeId?: unknown })?.resumeId;

  const headline = typeof headlineValue === "string" ? headlineValue : "";
  const aboutSection =
    typeof aboutSectionValue === "string" ? aboutSectionValue : "";

  if (!headline.trim() && !aboutSection.trim()) {
    return NextResponse.json(
      { error: "Provide a headline or an About section to audit" },
      { status: 400 },
    );
  }

  let resume: ReturnType<typeof mapResumeFromDB> | undefined;
  if (typeof resumeIdValue === "string" && resumeIdValue.trim()) {
    const resumeRow = await getResume(resumeIdValue, userId);
    if (!resumeRow) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 },
      );
    }
    resume = mapResumeFromDB(resumeRow);
  }

  try {
    const result = await generateLinkedInAudit(
      { headline, aboutSection, resume },
      userId,
    );
    return NextResponse.json({ result });
  } catch (error) {
    console.error("LinkedIn profile audit failed:", error);
    return aiRouteErrorResponse(error, "Failed to audit this profile. Please try again.");
  }
}
