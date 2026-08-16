import { auth } from "@clerk/nextjs/server";
import { generateLinkedInContent } from "@/lib/ai/linkedin";
import { checkAiGate, recordAiGeneration } from "@/lib/subscription/aiGate";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = await checkAiGate(userId);
  if (!gate.allowed) return gate.response;

  try {
    const body = await req.json();
    const result = await generateLinkedInContent(body);
    await recordAiGeneration(userId, gate.plan);
    return Response.json({ result });
  } catch (error) {
    console.error("Failed to generate LinkedIn content:", error);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
