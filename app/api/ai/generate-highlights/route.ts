import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateHighlights } from "@/lib/ai/generateHighlights";
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

  const rawInputValue = (body as { rawInput?: unknown })?.rawInput;
  const rawInput = typeof rawInputValue === "string" ? rawInputValue : "";

  const existingValue = (body as { existingHighlights?: unknown })
    ?.existingHighlights;
  const existingHighlights = Array.isArray(existingValue)
    ? existingValue.filter((h): h is string => typeof h === "string")
    : undefined;

  if (!rawInput.trim() && (!existingHighlights || existingHighlights.length === 0)) {
    return NextResponse.json(
      { error: "Add project notes or write a highlight first" },
      { status: 400 },
    );
  }

  const projectNameValue = (body as { projectName?: unknown })?.projectName;
  const projectName =
    typeof projectNameValue === "string" ? projectNameValue : undefined;

  const techStackValue = (body as { techStack?: unknown })?.techStack;
  const techStack = Array.isArray(techStackValue)
    ? techStackValue.filter((t): t is string => typeof t === "string")
    : undefined;

  try {
    const highlights = await generateHighlights(
      { rawInput, existingHighlights, projectName, techStack },
      userId,
    );
    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Failed to generate highlights:", error);
    return aiRouteErrorResponse(error, "Failed to generate highlights. Please try again.");
  }
}
