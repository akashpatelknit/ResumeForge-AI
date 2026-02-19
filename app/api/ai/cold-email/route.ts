import { generateColdEmails } from "@/lib/ai/generateColdEmails";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await generateColdEmails(body);

    return Response.json({ result });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
