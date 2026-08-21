import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateAchievements } from "@/lib/ai/generateAchievements";
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

  const existingValue = (body as { existingAchievements?: unknown })
    ?.existingAchievements;
  const existingAchievements = Array.isArray(existingValue)
    ? existingValue.filter((a): a is string => typeof a === "string")
    : undefined;

  if (!rawInput.trim() && (!existingAchievements || existingAchievements.length === 0)) {
    return NextResponse.json(
      { error: "Add a description or write an achievement first" },
      { status: 400 },
    );
  }

  const roleValue = (body as { role?: unknown })?.role;
  const role = typeof roleValue === "string" ? roleValue : undefined;

  const companyValue = (body as { company?: unknown })?.company;
  const company = typeof companyValue === "string" ? companyValue : undefined;

  try {
    const achievements = await generateAchievements(
      { rawInput, existingAchievements, role, company },
      userId,
    );
    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Failed to generate achievements:", error);
    return aiRouteErrorResponse(error, "Failed to generate achievements. Please try again.");
  }
}
