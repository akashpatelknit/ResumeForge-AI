import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateSummary } from "@/lib/ai/generateSummary";

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

  const existingSummaryValue = (body as { existingSummary?: unknown })
    ?.existingSummary;
  const existingSummary =
    typeof existingSummaryValue === "string" ? existingSummaryValue : "";

  if (!rawInput.trim() && !existingSummary.trim()) {
    return NextResponse.json(
      {
        error:
          "Add some notes, paste a job description, or write a summary first",
      },
      { status: 400 },
    );
  }

  const rawContext = (body as { resumeContext?: unknown })?.resumeContext;
  const resumeContext =
    rawContext && typeof rawContext === "object"
      ? {
          name:
            typeof (rawContext as Record<string, unknown>).name === "string"
              ? ((rawContext as Record<string, unknown>).name as string)
              : undefined,
          targetRole:
            typeof (rawContext as Record<string, unknown>).targetRole ===
            "string"
              ? ((rawContext as Record<string, unknown>)
                  .targetRole as string)
              : undefined,
        }
      : undefined;

  try {
    const summary = await generateSummary({
      rawInput,
      existingSummary,
      resumeContext,
    });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary. Please try again." },
      { status: 500 },
    );
  }
}
