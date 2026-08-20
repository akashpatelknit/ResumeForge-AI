import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateOutreachSettings } from "@/lib/outreach/settings";
import { to12Hour, to24Hour } from "@/lib/outreach/timeFormat";

function serialize(settings: Awaited<ReturnType<typeof getOrCreateOutreachSettings>>) {
  return {
    dailySendLimit: settings.dailySendLimit,
    sendWindowStart: to12Hour(settings.sendWindowStart),
    sendWindowEnd: to12Hour(settings.sendWindowEnd),
    sendWindowStartsNow: settings.sendWindowStartsNow,
    weekdaysOnly: settings.weekdaysOnly,
    jitterEnabled: settings.jitterEnabled,
    jitterMinSeconds: settings.jitterMinSeconds,
    jitterMaxSeconds: settings.jitterMaxSeconds,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getOrCreateOutreachSettings(userId);
  return NextResponse.json(serialize(settings));
}

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

  const b = body as Record<string, unknown>;

  const dailySendLimit = Number(b.dailySendLimit);
  const weekdaysOnly = Boolean(b.weekdaysOnly);
  const jitterEnabled = Boolean(b.jitterEnabled);
  const jitterMinSeconds = Number(b.jitterMinSeconds);
  const jitterMaxSeconds = Number(b.jitterMaxSeconds);

  if (!Number.isFinite(dailySendLimit) || dailySendLimit < 1 || dailySendLimit > 200) {
    return NextResponse.json({ error: "dailySendLimit must be between 1 and 200" }, { status: 400 });
  }
  if (!Number.isFinite(jitterMinSeconds) || !Number.isFinite(jitterMaxSeconds) || jitterMinSeconds < 0) {
    return NextResponse.json({ error: "Invalid jitter range" }, { status: 400 });
  }
  if (jitterMaxSeconds < jitterMinSeconds) {
    return NextResponse.json({ error: "jitterMaxSeconds must be >= jitterMinSeconds" }, { status: 400 });
  }

  // When "Start Now" is selected, the literal sendWindowStart value is
  // irrelevant (see schema comment on sendWindowStartsNow) — normalized to
  // midnight server-side regardless of whatever placeholder the client sent.
  const sendWindowStartsNow = Boolean(b.sendWindowStartsNow);

  let sendWindowStart: string;
  let sendWindowEnd: string;
  try {
    sendWindowStart = sendWindowStartsNow ? "00:00" : to24Hour(String(b.sendWindowStart));
    sendWindowEnd = to24Hour(String(b.sendWindowEnd));
  } catch {
    return NextResponse.json({ error: "Invalid sending window time" }, { status: 400 });
  }
  if (sendWindowEnd <= sendWindowStart) {
    return NextResponse.json({ error: "Sending window end must be after start" }, { status: 400 });
  }

  const settings = await prisma.userOutreachSettings.upsert({
    where: { userId },
    create: {
      userId,
      dailySendLimit,
      sendWindowStart,
      sendWindowEnd,
      sendWindowStartsNow,
      weekdaysOnly,
      jitterEnabled,
      jitterMinSeconds,
      jitterMaxSeconds,
    },
    update: {
      dailySendLimit,
      sendWindowStart,
      sendWindowEnd,
      sendWindowStartsNow,
      weekdaysOnly,
      jitterEnabled,
      jitterMinSeconds,
      jitterMaxSeconds,
    },
  });

  return NextResponse.json(serialize(settings));
}
