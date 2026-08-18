import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Namespaced key inside UserPreferences.preferences (a general-purpose JSON
// blob, previously unused anywhere in the app) — namespaced so this table
// can hold other kinds of saved preferences later without collisions.
const PREFS_KEY = "jobDiscoveryFilters";

interface JobDiscoveryFilters {
  company: string;
  location: string;
  source: string;
  roleType: string;
  experienceLevel: string;
  postedWithinDays: string;
}

function isValidFilters(value: unknown): value is JobDiscoveryFilters {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.company === "string" &&
    typeof v.location === "string" &&
    typeof v.source === "string" &&
    typeof v.roleType === "string" &&
    typeof v.experienceLevel === "string" &&
    typeof v.postedWithinDays === "string"
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.userPreferences.findUnique({ where: { userId } });
  const stored = (row?.preferences as Record<string, unknown> | null)?.[PREFS_KEY];

  return NextResponse.json({ filters: isValidFilters(stored) ? stored : null });
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

  const filters = (body as { filters?: unknown })?.filters;
  if (!isValidFilters(filters)) {
    return NextResponse.json({ error: "Invalid filters payload" }, { status: 400 });
  }

  const existing = await prisma.userPreferences.findUnique({ where: { userId } });
  const nextPreferences = {
    ...((existing?.preferences as Record<string, unknown> | null) ?? {}),
    [PREFS_KEY]: filters,
  } as unknown as Prisma.InputJsonValue;

  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, preferences: nextPreferences },
    update: { preferences: nextPreferences },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!existing) {
    return NextResponse.json({ ok: true });
  }

  const nextPreferences = { ...(existing.preferences as Record<string, unknown>) };
  delete nextPreferences[PREFS_KEY];

  await prisma.userPreferences.update({
    where: { userId },
    data: { preferences: nextPreferences as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ ok: true });
}
