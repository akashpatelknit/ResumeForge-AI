import { auth } from "@clerk/nextjs/server";
import { extractJobIdentity } from "@/lib/ai/extractJobIdentity";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

// Identifies a company name/role title from a pasted job description —
// used only to decide whether the "Track this application?" prompt on the
// AI Outreach tabs can show a confident company name. Never invents a
// value: returns "" fields when nothing is clearly stated in the text.
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const jobDescription =
      typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";

    if (!jobDescription) {
      return Response.json(
        { error: "jobDescription is required" },
        { status: 400 },
      );
    }

    const result = await extractJobIdentity(jobDescription, userId);
    return Response.json({ result });
  } catch (error) {
    console.error("Failed to extract job identity:", error);
    return aiRouteErrorResponse(error, "Extraction failed");
  }
}
