import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCoverLetter } from "@/lib/ai/generateCoverLetter";
import { checkAiGate, recordAiGeneration } from "@/lib/subscription/aiGate";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = await checkAiGate(userId);
  if (!gate.allowed) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resume = (body as { resume?: unknown })?.resume;
  if (
    !resume ||
    (typeof resume !== "string" && typeof resume !== "object")
  ) {
    return NextResponse.json({ error: "resume is required" }, { status: 400 });
  }

  const jobDescriptionValue = (body as { jobDescription?: unknown })
    ?.jobDescription;
  const jobDescription =
    typeof jobDescriptionValue === "string" ||
    (typeof jobDescriptionValue === "object" && jobDescriptionValue !== null)
      ? (jobDescriptionValue as string | object)
      : undefined;

  const toneValue = (body as { tone?: unknown })?.tone;
  const tone = typeof toneValue === "string" ? toneValue : undefined;

  try {
    const coverLetter = await generateCoverLetter({
      resume: resume as string | object,
      jobDescription,
      tone,
    });
    await recordAiGeneration(userId, gate.plan);
    return NextResponse.json({ result: coverLetter });
  } catch (error) {
    console.error("Failed to generate cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 },
    );
  }
}
