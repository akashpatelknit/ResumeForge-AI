import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { compileLatex } from "@/lib/latex/compile";

// Note: proxy.ts (Clerk middleware) already gates every non-public route,
// this route included, before the handler runs. This explicit check
// mirrors the pattern used by app/api/resumes/**/route.ts — defense in
// depth, and it's how we get a concrete userId for future rate limiting.
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

  const latexCode = (body as { latexCode?: unknown })?.latexCode;
  if (typeof latexCode !== "string" || latexCode.trim().length === 0) {
    return NextResponse.json(
      { error: "`latexCode` is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const result = await compileLatex(latexCode);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        diagnostics: result.diagnostics,
        rawLog: result.rawLog,
      },
      { status: 422 },
    );
  }

  return new NextResponse(new Uint8Array(result.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(result.pdf.length),
      "Cache-Control": "no-store",
    },
  });
}
