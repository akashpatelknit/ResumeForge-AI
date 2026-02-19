import { generateLinkedInContent } from "@/lib/ai/linkedin";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await generateLinkedInContent(body);

  return Response.json({ result });
}
