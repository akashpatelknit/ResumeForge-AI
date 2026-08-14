import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getApplications, createApplication } from "@/lib/db/applications";

const VALID_STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"];

// GET all job applications for the signed-in user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await getApplications(userId);
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create a job application — used identically by the manual "+ Add
// Application" flow and by the "Add" action on the smart tracker prompts
// (components/shared/AddToTrackerPrompt.tsx); both go through this same
// route so entries are indistinguishable afterward.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const company = typeof body.company === "string" ? body.company.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";

    if (!company) {
      return NextResponse.json({ error: "Company is required" }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const status = VALID_STATUSES.includes(body.status) ? body.status : "wishlist";

    const application = await createApplication(userId, {
      company,
      role,
      status,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : null,
      matchScore:
        typeof body.matchScore === "number" ? Math.round(body.matchScore) : null,
      tags: Array.isArray(body.tags)
        ? body.tags.filter((t: unknown) => typeof t === "string")
        : [],
      location: typeof body.location === "string" ? body.location : null,
      salary: typeof body.salary === "string" ? body.salary : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      url: typeof body.url === "string" ? body.url : null,
      jobDescription:
        typeof body.jobDescription === "string" ? body.jobDescription : null,
      source: typeof body.source === "string" ? body.source : "manual",
      resumeId: typeof body.resumeId === "string" ? body.resumeId : null,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
