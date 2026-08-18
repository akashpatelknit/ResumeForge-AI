import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isValidEmailFormat } from "@/lib/validation/textSanity";

function cleanEmails(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
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
  const source = b.source === "manual" ? "manual" : b.source === "greenhouse" ? "greenhouse" : null;
  const company = typeof b.company === "string" ? b.company.trim() : "";
  const jobTitle = typeof b.jobTitle === "string" ? b.jobTitle.trim() : "";
  const jobDescription = typeof b.jobDescription === "string" ? b.jobDescription.trim() : "";
  const location = typeof b.location === "string" && b.location.trim() ? b.location.trim() : null;
  const requisitionId =
    typeof b.requisitionId === "string" && b.requisitionId.trim() ? b.requisitionId.trim() : null;
  const contactEmails = cleanEmails(b.contactEmails);
  const invalidEmail = contactEmails.find((email) => !isValidEmailFormat(email));

  if (!source) {
    return NextResponse.json({ error: "source must be 'greenhouse' or 'manual'" }, { status: 400 });
  }
  if (!company || !jobTitle || !jobDescription) {
    return NextResponse.json({ error: "company, jobTitle, and jobDescription are required" }, { status: 400 });
  }
  if (invalidEmail) {
    return NextResponse.json({ error: `"${invalidEmail}" isn't a valid email address` }, { status: 400 });
  }

  // ── Manual jobs: private to this user, always land straight in the
  // queue — a manually-typed entry only exists because the user is about
  // to reach out, so there's no separate "just bookmarked" state for it.
  if (source === "manual") {
    if (contactEmails.length === 0) {
      return NextResponse.json({ error: "At least one contact email is required" }, { status: 400 });
    }

    const created = await prisma.savedJob.create({
      data: {
        userId,
        source: "manual",
        externalJobId: null,
        company,
        jobTitle,
        location,
        jobDescription,
        requisitionId,
        contactEmails,
        isBookmarked: false,
        isQueued: true,
        // Every queued job needs a starting point on the Cold Outreach
        // Dashboard — "draft" is that point; outreachType stays null until
        // the user picks one in the Generate & Review panel.
        outreachStatus: "draft",
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json({ savedJobId: created.id, isBookmarked: created.isBookmarked, isQueued: created.isQueued });
  }

  // ── Greenhouse jobs: first bookmark/queue is what actually writes the
  // row to Postgres — copying the fields the live-fetched job carried.
  const externalJobId = typeof b.externalJobId === "string" ? b.externalJobId.trim() : "";
  const action = b.action === "queue" ? "queue" : b.action === "bookmark" ? "bookmark" : null;

  if (!externalJobId) {
    return NextResponse.json({ error: "externalJobId is required for greenhouse jobs" }, { status: 400 });
  }
  if (!action) {
    return NextResponse.json({ error: "action must be 'bookmark' or 'queue'" }, { status: 400 });
  }
  if (action === "queue" && contactEmails.length === 0) {
    return NextResponse.json({ error: "At least one contact email is required to add this job to the queue" }, { status: 400 });
  }

  const existing = await prisma.savedJob.findUnique({
    where: { userId_externalJobId: { userId, externalJobId } },
  });

  if (existing) {
    // Only the flag for the requested action is touched — bookmarking an
    // already-queued job must never silently pull it back out of the
    // queue, and vice versa. outreachStatus is only ever initialized here
    // (queue action, and only if it isn't already set) — never overwritten,
    // so re-queuing a job that's already progressed past "draft" doesn't
    // reset it.
    const updated = await prisma.savedJob.update({
      where: { id: existing.id },
      data: {
        ...(action === "bookmark" ? { isBookmarked: true } : { isQueued: true }),
        ...(contactEmails.length > 0 ? { contactEmails } : {}),
        ...(action === "queue" && !existing.outreachStatus ? { outreachStatus: "draft" } : {}),
        lastActivityAt: new Date(),
      },
    });
    return NextResponse.json({ savedJobId: updated.id, isBookmarked: updated.isBookmarked, isQueued: updated.isQueued });
  }

  const created = await prisma.savedJob.create({
    data: {
      userId,
      source: "greenhouse",
      externalJobId,
      company,
      jobTitle,
      location,
      jobDescription,
      requisitionId,
      contactEmails,
      isBookmarked: action === "bookmark",
      isQueued: action === "queue",
      outreachStatus: action === "queue" ? "draft" : null,
      lastActivityAt: new Date(),
    },
  });

  return NextResponse.json({ savedJobId: created.id, isBookmarked: created.isBookmarked, isQueued: created.isQueued });
}
