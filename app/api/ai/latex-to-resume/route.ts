import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractResumeFromLatex } from "@/lib/latex/extractResumeFromLatex";
import { checkAiGate, recordAiGeneration } from "@/lib/subscription/aiGate";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

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

  const latexCode = (body as { latexCode?: unknown })?.latexCode;
  if (typeof latexCode !== "string" || latexCode.trim().length === 0) {
    return NextResponse.json(
      { error: "`latexCode` is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  try {
    const result = await extractResumeFromLatex(latexCode, userId);
    await recordAiGeneration(userId, gate.plan);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Failed to extract resume data from LaTeX:", error);
    return aiRouteErrorResponse(error, "Failed to parse form fields from LaTeX");
  }
}
