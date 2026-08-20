import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateOutreachSettings } from "@/lib/outreach/settings";
import { computeOutreachSchedule, type JobToSchedule } from "@/lib/outreach/scheduling";

// Statuses a job can be scheduled (or re-scheduled) from. Deliberately
// excludes generating/sending/sent/scheduled — a job already in flight or
// already scheduled isn't touched by a second "Approve & Schedule" call.
const SCHEDULABLE_STATUSES = ["draft", "generated", "approved"] as const;

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requestedIds = Array.isArray((body as { savedJobIds?: unknown }).savedJobIds)
    ? ((body as { savedJobIds?: unknown }).savedJobIds as unknown[]).filter((v): v is string => typeof v === "string")
    : null;

  const targets = await prisma.savedJob.findMany({
    where: {
      userId,
      isQueued: true,
      ...(requestedIds
        ? { id: { in: requestedIds } }
        : { OR: [{ outreachStatus: null }, { outreachStatus: { in: [...SCHEDULABLE_STATUSES] } }] }),
    },
    orderBy: { addedAt: "asc" },
  });

  // When specific IDs were requested, still only schedule the ones actually
  // in a schedulable state — silently skip anything already scheduled/sent
  // rather than erroring the whole batch over one already-in-flight row.
  const schedulable = requestedIds
    ? targets.filter((t) => t.outreachStatus === null || (SCHEDULABLE_STATUSES as readonly string[]).includes(t.outreachStatus))
    : targets;

  if (schedulable.length === 0) {
    return NextResponse.json({ error: "No schedulable jobs found in your queue." }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  if (!resume) {
    return NextResponse.json(
      { error: "Create a resume before scheduling outreach — it's attached to every scheduled email." },
      { status: 400 },
    );
  }

  const settings = await getOrCreateOutreachSettings(userId);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const targetIds = new Set(schedulable.map((t) => t.id));
  const alreadyScheduled = await prisma.savedJob.findMany({
    where: {
      userId,
      outreachStatus: "scheduled",
      scheduledSendTime: { gte: todayStart },
      id: { notIn: Array.from(targetIds) },
    },
    select: { scheduledSendTime: true, contactEmails: true },
  });

  const existingDailyCounts = new Map<string, number>();
  for (const row of alreadyScheduled) {
    if (!row.scheduledSendTime) continue;
    const key = dateKey(row.scheduledSendTime);
    const units = Math.max(1, row.contactEmails.length);
    existingDailyCounts.set(key, (existingDailyCounts.get(key) ?? 0) + units);
  }

  const jobsToSchedule: JobToSchedule[] = schedulable.map((job) => ({
    id: job.id,
    units: Math.max(1, job.contactEmails.length),
  }));

  const schedule = computeOutreachSchedule(
    jobsToSchedule,
    {
      dailySendLimit: settings.dailySendLimit,
      sendWindowStart: settings.sendWindowStart,
      sendWindowEnd: settings.sendWindowEnd,
      weekdaysOnly: settings.weekdaysOnly,
      jitterEnabled: settings.jitterEnabled,
      jitterMinSeconds: settings.jitterMinSeconds,
      jitterMaxSeconds: settings.jitterMaxSeconds,
    },
    existingDailyCounts,
    now,
  );

  const updated = await prisma.$transaction(
    schedulable.map((job) => {
      const scheduledSendTime = schedule.get(job.id)!;
      return prisma.savedJob.update({
        where: { id: job.id },
        data: {
          outreachStatus: "scheduled",
          scheduledSendTime,
          resumeId: job.resumeId ?? resume.id,
          lastActivityAt: now,
        },
      });
    }),
  );

  return NextResponse.json({
    scheduled: updated.map((job) => ({
      id: job.id,
      company: job.company,
      role: job.jobTitle,
      emails: job.contactEmails,
      scheduledSendTime: job.scheduledSendTime?.toISOString() ?? null,
    })),
  });
}
