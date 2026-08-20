import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUploadedResume, deleteUploadedResume } from "@/lib/db/uploadedResumes";
import { deleteResumeBlob } from "@/lib/storage/resumeBlob";

// DELETE — remove an uploaded resume: the stored blob file and the DB row.
// Any QuickApplyEntry pointing at it cascades (see UploadedResume in
// prisma/schema.prisma); any SavedJob pointing at it has its
// uploadedResumeId set null instead, matching how deleting a builder Resume
// already behaves for SavedJob.
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const uploaded = await getUploadedResume(id, userId);
  if (!uploaded) {
    return NextResponse.json({ error: "Uploaded resume not found" }, { status: 404 });
  }

  try {
    await deleteResumeBlob(uploaded.fileUrl);
  } catch (error) {
    // Non-fatal — an already-missing blob (e.g. deleted out of band)
    // shouldn't block cleaning up the DB row that references it.
    console.error(`Failed to delete blob for uploaded resume ${id}:`, error);
  }

  await deleteUploadedResume(id, userId);

  return NextResponse.json({ success: true });
}
