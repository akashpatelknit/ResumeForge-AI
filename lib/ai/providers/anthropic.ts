import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateText(prompt: string) {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : undefined;
}
