import { auth } from "@clerk/nextjs/server";
import { generateLinkedInContent } from "@/lib/ai/linkedin";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await generateLinkedInContent(body, userId);
    return Response.json({ result });
  } catch (error) {
    console.error("Failed to generate LinkedIn content:", error);
    return aiRouteErrorResponse(error, "Generation failed");
  }
}
