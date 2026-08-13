import "server-only";

// Single chokepoint every AI feature in this app calls through. Picks a
// provider based on AI_PROVIDER (if set) or whichever API key is present
// (Gemini first, to preserve existing behavior), so the app works with
// whatever key the deployer has — Gemini, OpenAI, or Claude — without
// touching any call site.
type AIProviderName = "gemini" | "openai" | "anthropic";

function resolveProvider(): AIProviderName {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "gemini" || explicit === "openai" || explicit === "anthropic") {
    return explicit;
  }

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";

  throw new Error(
    "No AI provider configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY " +
      "(optionally set AI_PROVIDER=gemini|openai|anthropic to choose explicitly).",
  );
}

// Dynamic imports so only the SDK client for the active provider is
// constructed — the other two providers' modules read an API key at
// module scope, and we don't want an unset key on an inactive provider
// to matter.
export async function generateText(prompt: string): Promise<string | undefined> {
  const provider = resolveProvider();

  switch (provider) {
    case "gemini":
      return (await import("./providers/gemini")).generateText(prompt);
    case "openai":
      return (await import("./providers/openai")).generateText(prompt);
    case "anthropic":
      return (await import("./providers/anthropic")).generateText(prompt);
  }
}
