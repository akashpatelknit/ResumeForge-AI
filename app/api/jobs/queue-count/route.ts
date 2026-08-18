import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Not in the original numbered route list — added so the sidebar's "Queue:
// N jobs" widget (rendered on every dashboard page, not just Job
// Discovery) doesn't have to call the much heavier /api/jobs/discover
// (live Greenhouse fetch + experience-level resolution) just for a count.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.savedJob.count({ where: { userId, isQueued: true } });
  return NextResponse.json({ count });
}
