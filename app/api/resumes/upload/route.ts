import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  countUploadedResumes,
  createUploadedResume,
  getUploadedResumes,
} from "@/lib/db/uploadedResumes";
import { uploadResumeBlob } from "@/lib/storage/resumeBlob";
import { MAX_UPLOADED_RESUME_FILE_SIZE_BYTES, MAX_UPLOADED_RESUMES_PER_USER } from "@/lib/constants";

// Needs Buffer/File — same reasoning as app/api/resume/parse/route.ts.
export const runtime = "nodejs";

// GET — list this user's uploaded PDFs, for the "Uploaded PDFs" section of
// the Resume to Attach picker (components/outreach/ResumeAttachPicker.tsx).
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uploads = await getUploadedResumes(userId);
  return NextResponse.json(uploads);
}

// POST — upload a raw PDF resume: validate type/size/cap, store it in blob
// storage, and persist the resulting UploadedResume row.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf") {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "This file is empty." }, { status: 400 });
  }

  if (file.size > MAX_UPLOADED_RESUME_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `This file is larger than ${MAX_UPLOADED_RESUME_FILE_SIZE_BYTES / (1024 * 1024)}MB — try a smaller file.` },
      { status: 400 },
    );
  }

  const existingCount = await countUploadedResumes(userId);
  if (existingCount >= MAX_UPLOADED_RESUMES_PER_USER) {
    return NextResponse.json(
      {
        error: `You've reached the limit of ${MAX_UPLOADED_RESUMES_PER_USER} uploaded resumes — delete one before uploading another.`,
      },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadResumeBlob(userId, file.name, buffer);

    const uploaded = await createUploadedResume({
      userId,
      fileName: file.name,
      fileUrl: url,
      fileSizeBytes: file.size,
    });

    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    console.error("Failed to upload resume PDF:", error);
    return NextResponse.json({ error: "Failed to upload this file. Please try again." }, { status: 500 });
  }
}
