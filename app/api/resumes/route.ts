import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResumes, createResume } from "@/lib/db/resumes";

// GET all resumes
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await getResumes(userId);
    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create resume
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const resume = await createResume(userId, {
      title: body.title ?? "Untitled Resume",
      templateId: body.templateId ?? "modern",
      data: body.data ?? {},
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
