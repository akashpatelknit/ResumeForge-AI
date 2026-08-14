import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateApplication, deleteApplication } from "@/lib/db/applications";

const VALID_STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"];

// PATCH update a job application — status moves (Kanban drag-and-drop) and
// field edits (notes, etc.) both go through here.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (typeof body.company === "string") data.company = body.company.trim();
    if (typeof body.role === "string") data.role = body.role.trim();
    if (typeof body.status === "string" && VALID_STATUSES.includes(body.status)) {
      data.status = body.status;
    }
    if ("appliedDate" in body) {
      data.appliedDate = body.appliedDate ? new Date(body.appliedDate) : null;
    }
    if (typeof body.matchScore === "number") {
      data.matchScore = Math.round(body.matchScore);
    }
    if (Array.isArray(body.tags)) {
      data.tags = body.tags.filter((t: unknown) => typeof t === "string");
    }
    if (typeof body.location === "string") data.location = body.location;
    if (typeof body.salary === "string") data.salary = body.salary;
    if (typeof body.notes === "string") data.notes = body.notes;
    if (typeof body.url === "string") data.url = body.url;

    const application = await updateApplication(id, userId, data);
    return NextResponse.json(application);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE a job application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteApplication(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
