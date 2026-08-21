import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateQuickApplyExtract } from "@/lib/ai/generateQuickApplyExtract";
import { aiRouteErrorResponse } from "@/lib/ai/policy/refusal";

// Debounced auto-fill for Quick Apply's "Paste Job Post or Context" field —
// deliberately lenient: pasted context is optional and can be a short,
// partial snippet, so the only rejection here is "nothing to extract from",
// never the stricter nonsense-detection used by the generate endpoint.
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

  const pastedTextValue = (body as { pastedText?: unknown })?.pastedText;
  const pastedText = typeof pastedTextValue === "string" ? pastedTextValue.trim() : "";

  if (!pastedText) {
    return NextResponse.json({ error: "pastedText is required" }, { status: 400 });
  }

  try {
    const result = await generateQuickApplyExtract(pastedText, userId);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Quick Apply context extraction failed:", error);
    return aiRouteErrorResponse(error, "Extraction failed");
  }
}
