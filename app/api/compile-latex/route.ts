import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { latexCode } = await request.json();

    const response = await fetch(
      "https://latexonline.cc/compile?text=" + encodeURIComponent(latexCode),
    );

    if (!response.ok) {
      throw new Error("LaTeX compilation failed");
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("LaTeX error:", error);
    return NextResponse.json(
      { error: "Failed to compile LaTeX" },
      { status: 500 },
    );
  }
}
