import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Namespaced key inside UserPreferences.preferences — same generic JSON
// blob app/api/jobs/preferences/route.ts uses for jobDiscoveryFilters,
// namespaced the same way so the two never collide. Clerk owns name/email/
// avatar; this only covers the profile fields Clerk doesn't have (phone,
// location) for the Settings page's Profile card.
const PREFS_KEY = "profile";

interface ProfileFields {
  phone: string;
  location: string;
}

function isValidProfile(value: unknown): value is ProfileFields {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.phone === "string" && typeof v.location === "string";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.userPreferences.findUnique({ where: { userId } });
  const stored = (row?.preferences as Record<string, unknown> | null)?.[PREFS_KEY];

  return NextResponse.json({
    profile: isValidProfile(stored) ? stored : { phone: "", location: "" },
  });
}

export async function PUT(request: NextRequest) {
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

  const profile = (body as { profile?: unknown })?.profile;
  if (!isValidProfile(profile)) {
    return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
  }

  const existing = await prisma.userPreferences.findUnique({ where: { userId } });
  const nextPreferences = {
    ...((existing?.preferences as Record<string, unknown> | null) ?? {}),
    [PREFS_KEY]: profile,
  } as unknown as Prisma.InputJsonValue;

  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, preferences: nextPreferences },
    update: { preferences: nextPreferences },
  });

  return NextResponse.json({ ok: true });
}
