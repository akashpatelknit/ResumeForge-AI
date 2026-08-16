import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCustomSection } from "@/lib/ai/generateCustomSection";
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

  const rawInputValue = (body as { rawInput?: unknown })?.rawInput;
  const rawInput = typeof rawInputValue === "string" ? rawInputValue : "";

  const existingValue = (body as { existingEntry?: unknown })?.existingEntry;
  const existingEntry =
    existingValue && typeof existingValue === "object"
      ? {
          heading:
            typeof (existingValue as Record<string, unknown>).heading ===
            "string"
              ? ((existingValue as Record<string, unknown>).heading as string)
              : undefined,
          subheading:
            typeof (existingValue as Record<string, unknown>).subheading ===
            "string"
              ? ((existingValue as Record<string, unknown>)
                  .subheading as string)
              : undefined,
          bullets: Array.isArray(
            (existingValue as Record<string, unknown>).bullets,
          )
            ? (
                (existingValue as Record<string, unknown>)
                  .bullets as unknown[]
              ).filter((b): b is string => typeof b === "string")
            : undefined,
        }
      : undefined;

  const hasExisting =
    !!existingEntry &&
    (!!existingEntry.heading?.trim() ||
      !!existingEntry.subheading?.trim() ||
      !!(existingEntry.bullets && existingEntry.bullets.length > 0));

  if (!rawInput.trim() && !hasExisting) {
    return NextResponse.json(
      { error: "Add some notes or fill in an entry first" },
      { status: 400 },
    );
  }

  const sectionTitleValue = (body as { sectionTitle?: unknown })?.sectionTitle;
  const sectionTitle =
    typeof sectionTitleValue === "string" ? sectionTitleValue : undefined;

  try {
    const entry = await generateCustomSection({
      rawInput,
      existingEntry,
      sectionTitle,
    });
    await recordAiGeneration(userId, gate.plan);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to generate custom section entry:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 },
    );
  }
}
